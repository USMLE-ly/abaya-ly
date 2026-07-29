import { checkRateLimit } from "./_ratelimit.mjs";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://nadine.luxor.ly");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  // Rate limiting
  const ip = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown";
  const rl = checkRateLimit(ip);
  if (!rl.allowed) return res.status(429).json({ error: "Too many requests", retryAfter: rl.retryAfter });

  const { orderNumber, phone } = req.query;

  if (!orderNumber || !phone) {
    return res.status(400).json({ error: "orderNumber and phone required" });
  }

  // Sanitize inputs
  const safeOrder = orderNumber.trim().replace(/[^NAD\-0-9a-zA-Z]/g, "");
  const safePhone = phone.trim().replace(/[^0-9]/g, "");

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ found: false });

  try {
    const resp = await fetch(EC_URL);
    if (!resp.ok) return res.status(200).json({ found: false });

    const allData = await resp.json();
    const items = allData.items || {};
    const order = items[`order:${safeOrder}`];

    if (!order) return res.status(200).json({ found: false });

    // Verify phone matches
    if (order.phone !== safePhone) {
      return res.status(200).json({ found: false });
    }

    return res.status(200).json({ found: true, order });
  } catch (err) {
    console.error("Track order error:", err);
    return res.status(200).json({ found: false });
  }
}
