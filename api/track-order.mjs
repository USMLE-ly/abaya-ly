export default async function handler(req, res) {
  // Enable CORS for admin panel
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderNumber, phone } = req.query;

  if (!orderNumber || !phone) {
    return res.status(400).json({ error: "رقم الطلب ورقم الهاتف مطلوبان" });
  }

  const EC_URL = process.env.EDGE_CONFIG;
  const debug = { hasEC: !!EC_URL, ecUrlPrefix: EC_URL ? EC_URL.substring(0, 30) + "..." : "none" };

  if (!EC_URL) {
    return res.status(200).json({ found: false, debug });
  }

  try {
    // Read all items from Edge Config
    const resp = await fetch(EC_URL);

    if (!resp.ok) {
      debug.readStatus = resp.status;
      debug.readStatusText = resp.statusText;
      return res.status(200).json({ found: false, debug });
    }

    const allData = await resp.json();
    const orderKey = `order:${orderNumber.trim()}`;
    const allKeys = Object.keys(allData);
    const order = allData[orderKey];

    debug.allKeys = allKeys;
    debug.orderKey = orderKey;
    debug.hasOrder = !!order;

    if (!order) {
      return res.status(200).json({ found: false, debug });
    }

    const phoneMatch = order.phone === phone.trim();
    debug.phoneMatch = phoneMatch;
    debug.storedPhone = order.phone;
    debug.queryPhone = phone.trim();

    if (!phoneMatch) {
      return res.status(200).json({ found: false, debug });
    }

    return res.status(200).json({ found: true, order, debug });
  } catch (err) {
    debug.error = err.message;
    return res.status(200).json({ found: false, debug });
  }
}
