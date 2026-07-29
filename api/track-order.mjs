export default async function handler(req, res) {
  const { orderNumber, phone } = req.query;
  if (!orderNumber || !phone) {
    return res.status(400).json({ error: "Missing fields" });
  }
  
  const EC_URL = process.env.EDGE_CONFIG;
  const info = { hasEC: !!EC_URL, ecPrefix: EC_URL?.substring(0, 40) };
  
  if (!EC_URL) return res.json({ found: false, info });

  // Try multiple read strategies
  try {
    // Strategy 1: Root GET with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const resp = await fetch(EC_URL, { signal: controller.signal });
    clearTimeout(timeout);
    
    info.status = resp.status;
    const text = await resp.text();
    info.textLen = text.length;
    info.first100 = text.substring(0, 100);
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(text);
      info.isJson = true;
      info.rootKeys = Object.keys(data);
      info.hasItems = "items" in data;
      if (data.items) {
        info.itemsType = typeof data.items;
        info.itemsIsArr = Array.isArray(data.items);
        info.itemsKeys = Object.keys(data.items).slice(0, 10);
        info.totalItems = Object.keys(data.items).length;
      }
    } catch (e) {
      info.isJson = false;
    }

    return res.json({ found: false, info });
  } catch (err) {
    info.error = err.name + ": " + err.message;
    return res.json({ found: false, info });
  }
}
