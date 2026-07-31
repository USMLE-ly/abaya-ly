// Admin stock management — GET (map), PUT (upsert), DELETE (clear override)
// Stored in Edge Config under key "stockLevels" (productId → units on hand)

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
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");

  if (req.method === "OPTIONS") return res.status(200).end();

  // Auth
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (!ADMIN_PASSWORD) return res.status(500).json({ error: "Server config error" });
  if (req.headers["x-admin-password"] !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ stock: {} });

  const STOCK_KEY = "stockLevels";

  try {
    const readResp = await fetch(EC_URL);
    const allData = readResp.ok ? await readResp.json() : { items: {} };
    const items = allData.items || {};
    const stock = items[STOCK_KEY] || {};

    // GET — full stock map
    if (req.method === "GET") {
      return res.status(200).json({ stock });
    }

    const write = async (next) => {
      const writeResp = await fetch(`${EC_URL}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ operation: "upsert", key: STOCK_KEY, value: next }],
        }),
      });
      if (!writeResp.ok) {
        const text = await writeResp.text();
        console.error("Edge Config write error:", text);
        throw new Error("Failed to save stock");
      }
    };

    // PUT — upsert one product's stock
    if (req.method === "PUT") {
      const { productId, stock: value } = req.body || {};
      if (!productId || typeof productId !== "string") {
        return res.status(400).json({ error: "productId required" });
      }
      if (value === undefined || value === null || value === "") {
        const next = { ...stock };
        delete next[productId];
        await write(next);
        return res.status(200).json({ success: true, stock: next });
      }
      const num = Number(value);
      if (!Number.isInteger(num) || num < 0 || num > 9999) {
        return res.status(400).json({ error: "Stock must be an integer 0-9999" });
      }
      const next = { ...stock, [productId]: num };
      await write(next);
      return res.status(200).json({ success: true, stock: next });
    }

    // DELETE — clear override (back to default/unknown)
    if (req.method === "DELETE") {
      const { productId } = req.body || {};
      if (!productId) return res.status(400).json({ error: "productId required" });
      const next = { ...stock };
      delete next[productId];
      await write(next);
      return res.status(200).json({ success: true, stock: next });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Admin stock error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
