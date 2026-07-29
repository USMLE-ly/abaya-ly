
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
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");
  
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  // Rate limiting
  const ip = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown";
  const rl = rl_check(ip);
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
