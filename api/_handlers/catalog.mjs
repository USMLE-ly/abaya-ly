import { cors, readItems } from "./shared.mjs";

// Public read of the admin-managed product catalog (Edge Config "catalog").
// Mirrors /api/stock: no auth — the storefront merges these overrides over the
// static catalog so admin image/text edits appear on the live product pages.
export default async function handler(req, res) {
  cors(req, res, { methods: "GET, OPTIONS", headers: "Content-Type" });
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ products: [] });

  try {
    const items = await readItems(EC_URL);
    return res.status(200).json({ products: items["catalog"] || [] });
  } catch (err) {
    console.error("Catalog API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
