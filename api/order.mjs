export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, name, color, size, location, phone } = req.body || {};

  if (!code || !phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const EC_URL = process.env.EDGE_CONFIG;
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  // Generate unique order ID
  const orderId = "NAD-" + Date.now().toString(36).slice(-4).toUpperCase() + Math.random().toString(36).slice(2, 4).toUpperCase();
  const now = new Date().toISOString();

  const order = {
    orderId,
    code,
    name,
    color,
    size,
    location,
    phone: phone.trim(),
    status: "pending",
    statusLabel: "انتظار التأكيد",
    createdAt: now,
    updatedAt: now,
  };

  // Store in Edge Config
  let stored = false;
  if (EC_URL) {
    try {
      // Store order by ID
      await fetch(`${EC_URL}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [
            { operation: "upsert", key: `order:${orderId}`, value: order },
          ],
        }),
      });
      // Index by phone number (append to phone index array)
      const phoneResp = await fetch(`${EC_URL}/item/phone:${phone.trim()}`);
      if (phoneResp.ok) {
        const existing = await phoneResp.json();
        const ids = Array.isArray(existing) ? existing : [];
        ids.push(orderId);
        await fetch(`${EC_URL}/items`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: [{ operation: "upsert", key: `phone:${phone.trim()}`, value: ids }],
          }),
        });
      } else {
        await fetch(`${EC_URL}/items`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: [{ operation: "upsert", key: `phone:${phone.trim()}`, value: [orderId] }],
          }),
        });
      }
      stored = true;
    } catch (e) {
      console.error("Edge Config error:", e.message);
    }
  }

  // Send to Telegram
  if (BOT_TOKEN && CHAT_ID) {
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
      `📦 الحالة: انتظار التأكيد`,
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
    } catch (e) {
      console.error("Telegram error:", e.message);
    }
  }

  return res.status(200).json({ success: true, orderId, stored });
}
