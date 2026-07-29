
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
  if (!EC_URL) return res.status(200).json({ settings: {} });

  try {
    if (req.method === "GET") {
      const resp = await fetch(EC_URL);
      const allData = resp.ok ? await resp.json() : { items: {} };
      const items = allData.items || {};
      const settings = items["app:settings"] || {
        storeName: "نادين",
        storeEmail: "nadine.luxor@gmail.com",
        storePhone: "+218944003708",
        whatsapp: "+218944003708",
        address: "بنغازي، ليبيا",
        shippingInfo: "توصيل إلى جميع المدن الليبية خلال 3-7 أيام عمل",
        socialInstagram: "nadine.ly",
        socialFacebook: "nadine.ly",
        currency: "د.ل",
      };
      return res.status(200).json({ settings });
    }

    if (req.method === "PUT") {
      const settings = req.body || {};
      const resp = await fetch(`${EC_URL}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ operation: "upsert", key: "app:settings", value: settings }],
        }),
      });
      if (!resp.ok) return res.status(500).json({ error: "Failed to save" });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Settings API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
