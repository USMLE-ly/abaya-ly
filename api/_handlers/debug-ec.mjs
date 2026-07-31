import { createRateLimiter, clientIp, isAdmin } from "./shared.mjs";

const rl = createRateLimiter();

export default async function handler(req, res) {
  const r = rl(clientIp(req));
  if (!r.allowed) return res.status(429).json({ error: "Too many requests", retryAfter: r.retryAfter });

  if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ error: "No EC_URL" });
  try {
    const resp = await fetch(EC_URL);
    const data = await resp.json();
    const keys = Object.keys(data);
    return res.status(200).json({ keys, keyCount: keys.length });
  } catch (err) {
    return res.status(200).json({ error: err.message });
  }
}
