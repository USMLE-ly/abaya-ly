export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { orderNumber, phone, debug } = req.query;

  if (!orderNumber || !phone) {
    return res.status(400).json({ error: "رقم الطلب ورقم الهاتف مطلوبان" });
  }

  const EC_URL = process.env.EDGE_CONFIG;
  const dbg = { hasEC: !!EC_URL };

  if (!EC_URL) return res.status(200).json({ found: false, _debug: dbg });

  try {
    const resp = await fetch(EC_URL);
    dbg.readStatus = resp.status;
    
    if (!resp.ok) return res.status(200).json({ found: false, _debug: dbg });

    const allData = await resp.json();
    dbg.topKeys = Object.keys(allData);
    dbg.hasItems = "items" in allData;
    dbg.itemsType = typeof allData.items;
    dbg.itemsIsArray = Array.isArray(allData.items);
    
    const items = allData.items || {};
    const orderKey = `order:${orderNumber.trim()}`;
    dbg.orderKey = orderKey;
    dbg.itemsKeys = Object.keys(items).slice(0, 10); // Show first 10 keys
    dbg.keyExists = orderKey in items;
    
    const order = items[orderKey];
    dbg.hasOrder = !!order;

    // If debug mode, return full dump
    if (debug === "true") {
      // Return sanitized items (no full data, just keys and brief info)
      const sanitized = {};
      for (const [k, v] of Object.entries(items)) {
        if (k.startsWith("order:")) {
          sanitized[k] = { orderId: v.orderId, phone: v.phone, status: v.status };
        } else {
          sanitized[k] = v;
        }
      }
      dbg.sanitizedItems = sanitized;
    }

    if (!order || order.phone !== phone.trim()) {
      return res.status(200).json({ found: false, _debug: dbg });
    }

    return res.status(200).json({ found: true, order, _debug: dbg });
  } catch (err) {
    dbg.error = err.message;
    dbg.stack = err.stack?.substring(0, 200);
    return res.status(500).json({ error: "Server error", _debug: dbg });
  }
}
