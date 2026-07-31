import { cors, createRateLimiter, clientIp, readItems, writeItem, sanitize } from "./shared.mjs";

const rl = createRateLimiter();

export default async function handler(req, res) {
  cors(req, res, { methods: "POST, OPTIONS", headers: "Content-Type" });
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const r = rl(clientIp(req));
  if (!r.allowed) return res.status(429).json({ error: "Too many requests", retryAfter: r.retryAfter });

  const { name, email, phone, message } = req.body || {};
  const cleanName = String(name || "").trim();
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanMessage = String(message || "").trim();
  if (!cleanName || !cleanEmail || !cleanMessage) {
    return res.status(400).json({ error: "يرجى ملء الاسم والبريد الإلكتروني والرسالة" });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return res.status(400).json({ error: "يرجى إدخال بريد إلكتروني صحيح" });
  }
  if (cleanName.length > 100 || cleanMessage.length > 2000) {
    return res.status(400).json({ error: "الرسالة أو الاسم طويلان جداً" });
  }

  const EC_URL = process.env.EDGE_CONFIG;
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  let stored = false;
  if (EC_URL) {
    try {
      const items = await readItems(EC_URL);
      const existing = items["contact:messages"] || [];
      existing.push({
        name: sanitize(cleanName),
        email: cleanEmail,
        phone: sanitize(phone || ""),
        message: sanitize(cleanMessage),
        createdAt: new Date().toISOString(),
      });
      await writeItem(EC_URL, "contact:messages", existing.slice(-500));
      stored = true;
    } catch (e) {
      console.error("Contact Edge Config error:", e);
    }
  }

  let sent = false;
  if (BOT_TOKEN && CHAT_ID) {
    try {
      const text = [
        `📩 رسالة جديدة من الموقع`,
        "━━━━━━━━━━━━━━━",
        `👤 الاسم: ${sanitize(cleanName)}`,
        `✉️ البريد: ${cleanEmail}`,
        `📞 الهاتف: ${sanitize(phone || "—")}`,
        `💬 الرسالة: ${sanitize(cleanMessage)}`,
        "━━━━━━━━━━━━━━━",
        `📅 ${new Date().toLocaleDateString("ar-LY", {
          weekday: "long", year: "numeric", month: "long", day: "numeric",
          hour: "2-digit", minute: "2-digit"
        })}`,
      ].join("\n");
      const resp = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text }),
      });
      sent = resp.ok;
    } catch (e) { /* ignore */ }
  }

  if (!stored && !sent) {
    return res.status(502).json({ error: "تعذر إرسال الرسالة، يرجى المحاولة لاحقاً" });
  }
  return res.status(200).json({ success: true, message: "تم إرسال رسالتك بنجاح — سنرد عليكِ خلال 24 ساعة" });
}
