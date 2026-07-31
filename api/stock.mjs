// Public stock levels — read-only map of productId → units on hand.
// Admin edits (api/admin/stock.mjs) are merged over the static defaults
// in the storefront bundle. Absent product = unknown stock → no scarcity UI.

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  const allowedOrigins = [
    "https://nadine.luxor.ly",
    "https://abaya-ly.vercel.app",
    "http://localhost:5173",
  ];
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ stock: {} });

  try {
    const readResp = await fetch(EC_URL);
    const allData = readResp.ok ? await readResp.json() : { items: {} };
    const items = allData.items || {};
    return res.status(200).json({ stock: items["stockLevels"] || {} });
  } catch (err) {
    console.error("Stock API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
