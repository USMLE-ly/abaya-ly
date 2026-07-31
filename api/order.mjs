
export default async function handler(req, res) {
// Inline rate limiter (per-instance, mitigates brute force)
const rl_attempts = new Map();
const RL_WINDOW = 15 * 60 * 1000;
const RL_MAX = 10;
function rl_check(ip) {
  const now = Date.now();
  const key = `${ip}`;
  const entry = rl_attempts.get(key);
  if (!entry || now - entry.windowStart > RL_WINDOW) {
    rl_attempts.set(key, { windowStart: now, count: 1 });
    return { allowed: true, remaining: RL_MAX - 1 };
  }
  if (entry.count >= RL_MAX) {
    const retryAfter = Math.ceil((RL_WINDOW - (now - entry.windowStart)) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }
  entry.count++;
  return { allowed: true, remaining: RL_MAX - entry.count };
}

  // Restrict CORS
  const origin = req.headers.origin || "";
  const allowedOrigins = [
    "https://nadine.luxor.ly",
    "https://abaya-ly.vercel.app",
    "http://localhost:5173",
  ];
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Rate limiting
  const ip = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown";
  const rl = rl_check(ip);
  if (!rl.allowed) return res.status(429).json({ error: "Too many requests", retryAfter: rl.retryAfter });

  const { code, name, color, size, location, phone, whatsappConsent } = req.body || {};

  // Validate required fields
  if (!code || !phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Validate Libyan phone number (091, 092, 093, 094 + 7 digits = 10 total)
  const phoneClean = phone.trim().replace(/[^0-9]/g, "");
  const libyanPattern = /^(091|092|093|094)\d{7}$/;
  if (!libyanPattern.test(phoneClean)) {
    return res.status(400).json({
      error: "رقم الهاتف يجب أن يبدأ بـ 091 أو 092 أو 093 أو 094 ويتكون من 10 أرقام",
    });
  }

  // Sanitize text inputs
  const sanitize = (str) => (str || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const sanitized = {
    code: sanitize(code),
    name: sanitize(name),
    color: sanitize(color),
    whatsappConsent: !!whatsappConsent,
    size: sanitize(size),
    location: sanitize(location),
  };

  const EC_URL = process.env.EDGE_CONFIG;
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  // Generate unique order ID
  const orderId = "NAD-" + Date.now().toString(36).slice(-4).toUpperCase() + Math.random().toString(36).slice(2, 4).toUpperCase();
  const now = new Date().toISOString();

  const order = {
    orderId,
    code: sanitized.code,
    name: sanitized.name,
    color: sanitized.color,
    size: sanitized.size,
    location: sanitized.location,
    phone: phoneClean,
      whatsappConsent: !!sanitized.whatsappConsent,
    status: "pending",
    statusLabel: "انتظار التأكيد",
    createdAt: now,
    updatedAt: now,
  };

  // Store in Edge Config
  let stored = false;
  if (EC_URL) {
    try {
      await fetch(`${EC_URL}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            { operation: "upsert", key: `order:${orderId}`, value: order },
          ],
        }),
      });

      const phoneResp = await fetch(`${EC_URL}/item/phone:${phoneClean}`);
      if (phoneResp.ok) {
        const existing = await phoneResp.json();
        const ids = Array.isArray(existing) ? existing : [];
        ids.push(orderId);
        await fetch(`${EC_URL}/items`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: [{ operation: "upsert", key: `phone:${phoneClean}`, value: ids }],
          }),
        });
      } else {
        await fetch(`${EC_URL}/items`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: [{ operation: "upsert", key: `phone:${phoneClean}`, value: [orderId] }],
          }),
        });
      }
      stored = true;
    } catch (e) {
      console.error("Edge Config write error:", e);
    }
  }

  // Send Telegram notification
  if (BOT_TOKEN && CHAT_ID && stored) {
    const consentEmoji = sanitized.whatsappConsent ? "✅" : "❌";
    const message = [
      `🛒 طلب جديد ${orderId}`,
      "━━━━━━━━━━━━━━━",
      `🆔 الكود: ${sanitized.code}`,
      `👗 الفستان: ${sanitized.name || "—"}`,
      `🎨 اللون: ${sanitized.color || "—"}`,
      `📏 المقاس: ${sanitized.size || "—"}`,
      `📍 الموقع: ${sanitized.location || "—"}`,
      `📞 الهاتف: ${phoneClean}`,
      `💬 إشعار واتساب: ${consentEmoji}`,
      "━━━━━━━━━━━━━━━",
      `📅 ${new Date().toLocaleDateString("ar-LY", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit"
      })}`,
    ].join("\n");
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text: message }),
      });
    } catch (e) { /* ignore */ }
  }

  return res.status(200).json({
    success: true,
    orderId,
    message: "سيتم الاتصال بسادتكم خلال 24 ساعه لتاكيد الطلب",
  });
}
