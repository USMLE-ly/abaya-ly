export default async function handler(req, res) {
  const { orderNumber, phone } = req.query;
  if (!orderNumber || !phone) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const EC_URL = process.env.EDGE_CONFIG;
  try {
    const resp = await fetch(EC_URL);
    const text = await resp.text();
    return res.status(200).json({ 
      status: resp.status, 
      textLength: text.length,
      textStart: text.substring(0, 300)
    });
  } catch (err) {
    return res.status(200).json({ error: err.message });
  }
}
