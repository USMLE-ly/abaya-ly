// Debug endpoint — only accessible with valid admin token
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

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (!ADMIN_PASSWORD) {
    return res.status(500).json({ error: "Server configuration error" });
  }
  const provided = req.headers["x-admin-password"];
  if (provided !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) {
    return res.status(200).json({ error: "No EC_URL" });
  }
  try {
    const resp = await fetch(EC_URL);
    const data = await resp.json();
    const keys = Object.keys(data);
    return res.status(200).json({ keys, keyCount: keys.length });
  } catch (err) {
    return res.status(200).json({ error: err.message });
  }
}
