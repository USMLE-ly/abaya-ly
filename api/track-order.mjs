export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderNumber, phone } = req.query;

  if (!orderNumber || !phone) {
    return res.status(400).json({ error: "رقم الطلب ورقم الهاتف مطلوبان" });
  }

  const EC_URL = process.env.EDGE_CONFIG;

  if (!EC_URL) {
    return res.status(200).json({ found: false, note: "Edge Config not configured" });
  }

  try {
    const resp = await fetch(`${EC_URL}/item/order:${orderNumber.trim()}`);
    
    if (!resp.ok) {
      return res.status(200).json({ found: false });
    }

    const order = await resp.json();

    // Verify phone number matches
    if (order.phone !== phone.trim()) {
      return res.status(200).json({ found: false });
    }

    return res.status(200).json({ found: true, order });
  } catch (err) {
    console.error("Track error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
