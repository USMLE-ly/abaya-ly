
export default async function handler(req, res) {
// Inline rate limiter (per-instance, mitigates brute force)
const rl_attempts = new Map();
const RL_WINDOW = 15 * 60 * 1000;
const RL_MAX = 10;
function rl_check(ip) {
  const now = Date.now();
  const key = `${ip}`;
  const entry = rl_attempts.get(key);
  if (!entry || now - entry.windowStart > RL_WINDOW) {
    rl_attempts.set(key, { windowStart: now, count: 1 });
    return { allowed: true, remaining: RL_MAX - 1 };
  }
  if (entry.count >= RL_MAX) {
    const retryAfter = Math.ceil((RL_WINDOW - (now - entry.windowStart)) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }
  entry.count++;
  return { allowed: true, remaining: RL_MAX - entry.count };
}

  res.setHeader("Access-Control-Allow-Origin", "https://nadine.luxor.ly");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  // Rate limiting
  const ip = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown";
  const rl = rl_check(ip);
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
