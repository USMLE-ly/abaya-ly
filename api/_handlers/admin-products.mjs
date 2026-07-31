import { cors, readItems, writeItem, isAdmin } from "./shared.mjs";

const CATALOG_KEY = "catalog";

export default async function handler(req, res) {
  cors(req, res, { methods: "GET, POST, PUT, DELETE, OPTIONS", headers: "Content-Type, x-admin-password" });
  if (req.method === "OPTIONS") return res.status(200).end();

  if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ products: [], note: "Edge Config not configured" });

  try {
    const items = await readItems(EC_URL);
    let catalog = items[CATALOG_KEY] || [];

    if (req.method === "GET") {
      return res.status(200).json({ products: catalog });
    }

    if (req.method === "POST") {
      const { id, name, price, collection, model, fabric, category, images, colors, sizes, badge, originalPrice, description, details, highlights, tags } = req.body || {};
      if (!id || !name) return res.status(400).json({ error: "id and name required" });

      if (catalog.find((p) => p.id === id)) {
        return res.status(409).json({ error: `Product with id "${id}" already exists` });
      }

      const product = {
        id,
        name,
        price: Number(price) || 0,
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        collection: collection || "",
        model: model || "",
        fabric: fabric || "",
        category: category || "",
        images: images || [],
        colors: colors || [],
        sizes: sizes || [],
        badge: badge || "",
        description: description || "",
        details: details || [],
        highlights: highlights || [],
        tags: tags || [],
        rating: 0,
        reviewCount: 0,
        inStock: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      catalog.push(product);
      await writeItem(EC_URL, CATALOG_KEY, catalog);
      return res.status(201).json({ success: true, product });
    }

    if (req.method === "PUT") {
      const { id, ...updates } = req.body || {};
      if (!id) return res.status(400).json({ error: "id required" });

      const idx = catalog.findIndex((p) => p.id === id);
      if (idx === -1) return res.status(404).json({ error: "Product not found" });

      catalog[idx] = { ...catalog[idx], ...updates, id, updatedAt: new Date().toISOString() };
      await writeItem(EC_URL, CATALOG_KEY, catalog);
      return res.status(200).json({ success: true, product: catalog[idx] });
    }

    if (req.method === "DELETE") {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: "id required" });

      const idx = catalog.findIndex((p) => p.id === id);
      if (idx === -1) return res.status(404).json({ error: "Product not found" });

      catalog.splice(idx, 1);
      await writeItem(EC_URL, CATALOG_KEY, catalog);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Products API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
