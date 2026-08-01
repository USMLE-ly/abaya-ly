import { cors, createRateLimiter, clientIp, readItems, writeItem, ecGetItem } from "./shared.mjs";

const rl = createRateLimiter();

const validStatuses = ["pending", "processing", "waiting_shipping", "shipped", "delivered"];
const statusLabels = {
  pending: "انتظار التأكيد",
  processing: "جاري التجهيز",
  waiting_shipping: "في انتظار الشحن",
  shipped: "جاري الشحن",
  delivered: "تم التوصيل",
};

export default async function handler(req, res) {
  cors(req, res, { methods: "POST, OPTIONS", headers: "Content-Type, x-admin-password" });
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const r = rl(clientIp(req));
  if (!r.allowed) return res.status(429).json({ error: "Too many requests", retryAfter: r.retryAfter });

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (!ADMIN_PASSWORD) return res.status(500).json({ error: "Server configuration error" });
  if (req.headers["x-admin-password"] !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { orderId, status } = req.body || {};
  if (!orderId || !status) return res.status(400).json({ error: "orderId and status required" });
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
  }

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ success: false, note: "Edge Config not configured" });

  try {
    const items = await readItems(EC_URL);
    const orderKey = `order:${orderId.trim()}`;
    const order = ecGetItem(items, orderKey);
    if (!order) return res.status(404).json({ error: "Order not found" });

    order.status = status;
    order.statusLabel = statusLabels[status];
    order.updatedAt = new Date().toISOString();

    await writeItem(EC_URL, orderKey, order);

    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    if (BOT_TOKEN && CHAT_ID) {
      const waMessage = encodeURIComponent(
        `السلام عليكم، تم تحديث حالة طلبك ${orderId} إلى: ${statusLabels[status]}. للاستفسار يرجى الرد على هذه الرسالة.`
      );
      const message = [
        `🔄 تحديث حالة الطلب ${orderId}`,
        "━━━━━━━━━━━━━━━",
        `👗 الفستان: ${order.name || "—"}`,
        `📞 الهاتف: ${order.phone}`,
        `📌 الحالة الجديدة: ${statusLabels[status]}`,
        order.whatsappConsent ? `💬 واتساب: 👇` : `💬 واتساب: لم يوافق العميل`,
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

    return res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("Update status error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
