import { cors, createRateLimiter, clientIp, readItems, writeItem, isAdmin } from "./shared.mjs";

const rl = createRateLimiter();

const STOCK_KEY = "stockLevels";

export default async function handler(req, res) {
  cors(req, res, { methods: "GET, PUT, DELETE, OPTIONS", headers: "Content-Type, x-admin-password" });
  if (req.method === "OPTIONS") return res.status(200).end();

  const r = rl(clientIp(req));
  if (!r.allowed) return res.status(429).json({ error: "Too many requests", retryAfter: r.retryAfter });

  if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ stock: {} });

  try {
    const items = await readItems(EC_URL);
    const stock = items[STOCK_KEY] || {};

    if (req.method === "GET") {
      return res.status(200).json({ stock });
    }

    const write = async (next) => {
      try {
        await writeItem(EC_URL, STOCK_KEY, next);
      } catch (err) {
        console.error("Edge Config write error:", err.message);
        throw new Error("Failed to save stock");
      }
    };

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
