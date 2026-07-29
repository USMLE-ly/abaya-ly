import { checkRateLimit } from "../_ratelimit.mjs";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://nadine.luxor.ly");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");
  
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  // Rate limiting
  const ip = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown";
  const rl = checkRateLimit(ip);
  if (!rl.allowed) return res.status(429).json({ error: "Too many requests", retryAfter: rl.retryAfter });

  // Auth
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (!ADMIN_PASSWORD) return res.status(500).json({ error: "Server configuration error" });
  if (req.headers["x-admin-password"] !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ orders: [] });

  try {
    const resp = await fetch(EC_URL);
    if (!resp.ok) return res.status(200).json({ orders: [] });

    const allData = await resp.json();
    const items = allData.items || {};

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
