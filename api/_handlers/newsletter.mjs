import { cors, createRateLimiter, clientIp, readItems, writeItem } from "./shared.mjs";

const rl = createRateLimiter();

export default async function handler(req, res) {
  cors(req, res, { methods: "POST, OPTIONS", headers: "Content-Type" });
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const r = rl(clientIp(req));
  if (!r.allowed) return res.status(429).json({ error: "Too many requests", retryAfter: r.retryAfter });

  const { email } = req.body || {};
  const clean = String(email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return res.status(400).json({ error: "يرجى إدخال بريد إلكتروني صحيح" });
  }

  const EC_URL = process.env.EDGE_CONFIG;
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  let stored = false;
  if (EC_URL) {
    try {
      const items = await readItems(EC_URL);
      const existing = items["newsletter:subscribers"] || [];
      if (!existing.includes(clean)) {
        existing.push(clean);
        await writeItem(EC_URL, "newsletter:subscribers", existing);
      }
      stored = true;
    } catch (e) {
      console.error("Newsletter Edge Config error:", e);
    }
  }

  if (BOT_TOKEN && CHAT_ID && stored) {
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: `📧 اشتراك جديد في النشرة البريدية\n━━━━━━━━━━━━━━━\n✉️ ${clean}\n📅 ${new Date().toLocaleDateString("ar-LY", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}`,
        }),
      });
    } catch (e) { /* ignore */ }
  }

  return res.status(200).json({ success: true, message: "تم الاشتراك بنجاح" });
}
