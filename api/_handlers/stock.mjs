import { cors, readItems } from "./shared.mjs";

export default async function handler(req, res) {
  cors(req, res, { methods: "GET, OPTIONS", headers: "Content-Type" });
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ stock: {} });

  try {
    const items = await readItems(EC_URL);
    return res.status(200).json({ stock: items["stockLevels"] || {} });
  } catch (err) {
    console.error("Stock API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
