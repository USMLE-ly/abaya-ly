// Admin storefront analytics — GET aggregated summary (auth required)

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
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (!ADMIN_PASSWORD) return res.status(500).json({ error: "Server config error" });
  if (req.headers["x-admin-password"] !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ analytics: null });

  try {
    const readResp = await fetch(EC_URL);
    const allData = readResp.ok ? await readResp.json() : { items: {} };
    const items = allData.items || {};
    const data = items["analytics"] || { counts: {}, byPage: {}, byProduct: {}, byDay: {}, raw: [], visitors: {} };

    const topPages = Object.entries(data.byPage || {})
      .sort(([, a], [, b]) => Number(b) - Number(a))
      .slice(0, 10)
      .map(([path, count]) => ({ path, count: Number(count) }));

    const topProducts = Object.entries(data.byProduct || {})
      .sort(([, a], [, b]) => Number(b) - Number(a))
      .slice(0, 10)
      .map(([id, count]) => ({ id, count: Number(count) }));

    const trend = Object.entries(data.byDay || {})
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([day, v]) => ({ day, visits: v.visits || 0, events: v.events || 0 }));

    const recent = [...(data.raw || [])].reverse().slice(0, 50);

    return res.status(200).json({
      analytics: {
        counts: data.counts || {},
        visitors: Object.keys(data.visitors || {}).length,
        topPages,
        topProducts,
        trend,
        recent,
      },
    });
  } catch (err) {
    console.error("Admin analytics error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
