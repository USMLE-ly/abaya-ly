export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId, status } = req.body || {};

  if (!orderId || !status) {
    return res.status(400).json({ error: "orderId and status required" });
  }

  const validStatuses = ["pending", "processing", "shipped", "delivered"];
  const statusLabels = {
    pending: "انتظار التأكيد",
    processing: "جاري التجهيز",
    shipped: "جاري الشحن",
    delivered: "تم التوصيل",
  };

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
  }

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) {
    return res.status(200).json({ success: false, note: "Edge Config not configured" });
  }

  try {
    // Read all items
    const readResp = await fetch(EC_URL);
    if (!readResp.ok) {
      return res.status(500).json({ error: "Failed to read Edge Config" });
    }

    const allData = await readResp.json();
    const orderKey = `order:${orderId.trim()}`;
    const order = allData[orderKey];

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Update status
    order.status = status;
    order.statusLabel = statusLabels[status];
    order.updatedAt = new Date().toISOString();

    // Write back to Edge Config
    const writeResp = await fetch(`${EC_URL}/items`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [
          { operation: "upsert", key: orderKey, value: order },
        ],
      }),
    });

    if (!writeResp.ok) {
      const errText = await writeResp.text();
      console.error("Edge Config write error:", errText);
      return res.status(500).json({ error: "Failed to update" });
    }

    // Send Telegram notification
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    if (BOT_TOKEN && CHAT_ID) {
      const message = [
        `🔄 تحديث حالة الطلب ${orderId}`,
        "━━━━━━━━━━━━━━━",
        `👗 الفستان: ${order.name || "—"}`,
        `📞 الهاتف: ${order.phone}`,
        `📌 الحالة الجديدة: ${statusLabels[status]}`,
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
