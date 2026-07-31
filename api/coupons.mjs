// Coupons API — GET (list/validate), POST (create), DELETE
// Stored in Edge Config under key "coupons"

export default async function handler(req, res) {
  const origin = req.headers.origin || "";
  const allowedOrigins = [
    "https://nadine.luxor.ly",
    "https://abaya-ly.vercel.app",
    "http://localhost:5173",
  ];
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");

  if (req.method === "OPTIONS") return res.status(200).end();

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ coupons: [] });
  const COUPONS_KEY = "coupons";

  try {
    const readResp = await fetch(EC_URL);
    const allData = readResp.ok ? await readResp.json() : { items: {} };
    const items = allData.items || {};
    let coupons = items[COUPONS_KEY] || [];

    // GET — public validate ?code=XXXX | admin list (with auth)
    if (req.method === "GET") {
      const code = req.query?.code;
      const isAdmin = req.headers["x-admin-password"] === process.env.ADMIN_PASSWORD;

      // Public: validate a code
      if (code && !isAdmin) {
        const coupon = coupons.find(
          (c) => c.code.toLowerCase() === String(code).trim().toLowerCase() && c.active !== false
        );
        if (!coupon) return res.status(404).json({ error: "كود غير صالح" });

        const now = Date.now();
        if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < now) {
          return res.status(410).json({ error: "انتهت صلاحية هذا الكود" });
        }
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          return res.status(410).json({ error: "تم استخدام هذا الكود بالكامل" });
        }

        return res.status(200).json({
          success: true,
          coupon: {
            code: coupon.code,
            type: coupon.type, // "percent" | "fixed"
            value: coupon.value,
            label: coupon.label || "",
          },
        });
      }

      // Admin: list all
      if (isAdmin) return res.status(200).json({ coupons });
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Admin auth for mutations
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    if (!ADMIN_PASSWORD) return res.status(500).json({ error: "Server config error" });
    if (req.headers["x-admin-password"] !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // POST — create coupon
    if (req.method === "POST") {
      const { code, type, value, label, expiresAt, maxUses } = req.body || {};
      if (!code || !["percent", "fixed"].includes(type) || !Number(value) || Number(value) <= 0) {
        return res.status(400).json({ error: "code, type (percent|fixed), and positive value required" });
      }

      const coupon = {
        code: String(code).trim().toUpperCase(),
        type,
        value: Number(value),
        label: label || "",
        expiresAt: expiresAt || null,
        maxUses: maxUses ? Number(maxUses) : null,
        usedCount: 0,
        active: true,
        createdAt: new Date().toISOString(),
      };

      if (coupons.find((c) => c.code === coupon.code)) {
        return res.status(409).json({ error: "الكود موجود مسبقاً" });
      }

      coupons.push(coupon);
      await write(EC_URL, COUPONS_KEY, coupons);
      return res.status(201).json({ success: true, coupon });
    }

    // DELETE — remove coupon (admin)
    if (req.method === "DELETE") {
      const { code } = req.body || {};
      if (!code) return res.status(400).json({ error: "code required" });

      const idx = coupons.findIndex((c) => c.code === String(code).trim().toUpperCase());
      if (idx === -1) return res.status(404).json({ error: "Coupon not found" });

      coupons.splice(idx, 1);
      await write(EC_URL, COUPONS_KEY, coupons);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Coupons API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}

async function write(ecUrl, key, data) {
  const resp = await fetch(`${ecUrl}/items`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: [{ operation: "upsert", key, value: data }] }),
  });
  if (!resp.ok) throw new Error("Edge Config write failed");
}
