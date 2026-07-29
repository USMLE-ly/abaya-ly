export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, name, color, size, location, phone } = req.body || {};

  if (!code || !phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  // Generate unique order ID: NAD-XXXXXX
  const orderId = "NAD-" + Date.now().toString(36).slice(-4).toUpperCase() + Math.random().toString(36).slice(2, 4).toUpperCase();

  if (!BOT_TOKEN || !CHAT_ID) {
    console.log("Missing Telegram config. Would send:", { orderId, code, name, color, size, location, phone });
    return res.status(200).json({ success: true, orderId, note: "Order received, Telegram not configured" });
  }

  const message = [
    "🆕 طلب جديد من متجر نادين",
    "━━━━━━━━━━━━━━━",
    `🆔 رقم الطلب: ${orderId}`,
    `🆔 الكود: ${code}`,
    `👗 الفستان: ${name || "—"}`,
    `🎨 اللون: ${color || "—"}`,
    `📏 المقاس: ${size || "—"}`,
    `📍 الموقع: ${location || "—"}`,
    `📞 الهاتف: ${phone}`,
    "━━━━━━━━━━━━━━━",
    `📅 ${new Date().toLocaleDateString("ar-LY", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    })}`,
  ].join("\n");

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text: message }),
    });
    const result = await resp.json();

    if (!resp.ok) {
      console.error("Telegram error:", result);
      return res.status(200).json({ success: false, orderId, error: "Telegram failed" });
    }

    return res.status(200).json({ success: true, orderId });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
