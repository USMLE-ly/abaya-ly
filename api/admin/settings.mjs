// Store settings stored in Edge Config
export default async function handler(req, res) {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "nadine2026";
  const provided = req.headers["x-admin-password"];
  if (provided !== ADMIN_PASSWORD) {
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

    if (req.method === "PUT" || req.method === "POST") {
      const { settings } = req.body || {};
      if (!settings) return res.status(400).json({ error: "settings required" });

      const writeResp = await fetch(`${EC_URL}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ operation: "upsert", key: "app:settings", value: settings }],
        }),
      });

      if (!writeResp.ok) return res.status(500).json({ error: "Failed to save" });

      return res.status(200).json({ success: true, settings });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Settings API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
