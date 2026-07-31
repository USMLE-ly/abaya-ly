import { createRateLimiter, clientIp, readItems, isAdmin } from "./shared.mjs";

const rl = createRateLimiter();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://nadine.luxor.ly");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const r = rl(clientIp(req));
  if (!r.allowed) return res.status(429).json({ error: "Too many requests", retryAfter: r.retryAfter });

  if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ orders: [] });

  try {
    const items = await readItems(EC_URL);
    const orders = Object.entries(items)
      .filter(([key]) => key.startsWith("order:"))
      .map(([, value]) => value)
      .filter((o) => o && typeof o === "object" && o.orderId)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

    return res.status(200).json({ orders });
  } catch (err) {
    console.error("Admin orders error:", err);
    return res.status(200).json({ orders: [] });
  }
}
