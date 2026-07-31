// Admin Products CRUD API — GET (list), POST (create), PUT (update), DELETE
// Stored in Edge Config under key "catalog"

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin || "";
  const allowedOrigins = [
    "https://nadine.luxor.ly",
    "https://abaya-ly.vercel.app",
    "http://localhost:5173",
  ];
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");

  if (req.method === "OPTIONS") return res.status(200).end();

  // Auth
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (!ADMIN_PASSWORD) return res.status(500).json({ error: "Server config error" });
  const provided = req.headers["x-admin-password"];
  if (provided !== ADMIN_PASSWORD) return res.status(401).json({ error: "Unauthorized" });

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ products: [], note: "Edge Config not configured" });

  const CATALOG_KEY = "catalog";

  try {
    // Read existing catalog
    const readResp = await fetch(EC_URL);
    const allData = readResp.ok ? await readResp.json() : { items: {} };
    const items = allData.items || {};
    let catalog = items[CATALOG_KEY] || [];

    // GET — list all products from Edge Config
    if (req.method === "GET") {
      return res.status(200).json({ products: catalog });
    }

    // POST — create a product
    if (req.method === "POST") {
      const { id, name, price, collection, model, fabric, category, images, colors, sizes, badge, originalPrice, description, details, highlights, tags } = req.body || {};
      if (!id || !name) return res.status(400).json({ error: "id and name required" });

      // Prevent duplicate IDs
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
      await writeCatalog(EC_URL, CATALOG_KEY, catalog);
      return res.status(201).json({ success: true, product });
    }

    // PUT — update a product
    if (req.method === "PUT") {
      const { id, ...updates } = req.body || {};
      if (!id) return res.status(400).json({ error: "id required" });

      const idx = catalog.findIndex((p) => p.id === id);
      if (idx === -1) return res.status(404).json({ error: "Product not found" });

      catalog[idx] = { ...catalog[idx], ...updates, id, updatedAt: new Date().toISOString() };
      await writeCatalog(EC_URL, CATALOG_KEY, catalog);
      return res.status(200).json({ success: true, product: catalog[idx] });
    }

    // DELETE — remove a product
    if (req.method === "DELETE") {
      const { id } = req.body || {};
      if (!id) return res.status(400).json({ error: "id required" });

      const idx = catalog.findIndex((p) => p.id === id);
      if (idx === -1) return res.status(404).json({ error: "Product not found" });

      catalog.splice(idx, 1);
      await writeCatalog(EC_URL, CATALOG_KEY, catalog);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Products API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

async function writeCatalog(ecUrl, key, data) {
  const resp = await fetch(`${ecUrl}/items`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ operation: "upsert", key, value: data }],
    }),
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Edge Config write failed: ${text}`);
  }
}
