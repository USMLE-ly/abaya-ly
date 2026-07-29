import { checkRateLimit } from "../_ratelimit.mjs";
// Debug endpoint — only accessible with valid admin token
export default async function handler(req, res) {
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
