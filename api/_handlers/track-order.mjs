import { createRateLimiter, clientIp, readItems, ecGetItem } from "./shared.mjs";

const rl = createRateLimiter();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://nadine.luxor.ly");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const r = rl(clientIp(req));
  if (!r.allowed) return res.status(429).json({ error: "Too many requests", retryAfter: r.retryAfter });

  const { orderNumber, phone } = req.query;
  if (!orderNumber || !phone) {
    return res.status(400).json({ error: "orderNumber and phone required" });
  }

  const safeOrder = orderNumber.trim().replace(/[^NAD\-0-9a-zA-Z]/g, "");
  const safePhone = phone.trim().replace(/[^0-9]/g, "");

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ found: false });

  try {
    const items = await readItems(EC_URL);
    const order = ecGetItem(items, `order:${safeOrder}`);
    if (!order) return res.status(200).json({ found: false, reason: "order" });
    if (order.phone !== safePhone) return res.status(200).json({ found: false, reason: "phone" });
    return res.status(200).json({ found: true, order });
  } catch (err) {
    console.error("Track order error:", err);
    return res.status(200).json({ found: false });
  }
}
