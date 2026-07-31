import { cors, readItems, isAdmin } from "./shared.mjs";

export default async function handler(req, res) {
  cors(req, res, { methods: "GET, OPTIONS", headers: "Content-Type, x-admin-password" });
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ analytics: null });

  try {
    const items = await readItems(EC_URL);
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
