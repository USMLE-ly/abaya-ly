import { createRateLimiter, clientIp, readItems, writeItem, isAdmin } from "./shared.mjs";

const rl = createRateLimiter();

const DEFAULT_SETTINGS = {
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

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://nadine.luxor.ly");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");

  if (req.method === "OPTIONS") return res.status(200).end();

  const r = rl(clientIp(req));
  if (!r.allowed) return res.status(429).json({ error: "Too many requests", retryAfter: r.retryAfter });

  if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ settings: {} });

  try {
    if (req.method === "GET") {
      const items = await readItems(EC_URL);
      const settings = items["app:settings"] || DEFAULT_SETTINGS;
      return res.status(200).json({ settings });
    }

    if (req.method === "PUT") {
      const settings = req.body || {};
      await writeItem(EC_URL, "app:settings", settings);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Settings API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
