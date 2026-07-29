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
    // URL-encode the key to handle special characters like ":"
    const key = `order:${orderNumber.trim()}`;
    const url = `${EC_URL}/item/${encodeURIComponent(key)}`;

    console.log("Fetching:", url.replace(/\?token=.*$/, "?token=***")); // Log URL without token
    
    const resp = await fetch(url);
    
    if (!resp.ok) {
      console.log("Edge Config response:", resp.status, resp.statusText);
      return res.status(200).json({ found: false });
    }

    const order = await resp.json();

    // Verify phone number matches
    if (!order || order.phone !== phone.trim()) {
      return res.status(200).json({ found: false });
    }

    return res.status(200).json({ found: true, order });
  } catch (err) {
    console.error("Track error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
