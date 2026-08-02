// Consolidated Nadine API — a single Vercel serverless function.
// Every previous /api/* endpoint is dispatched here by path + method so the
// Hobby plan function cap (12) is no longer hit. Logic lives in api/_handlers/,
// which Vercel does not deploy as separate functions.
import order from "./_handlers/order.mjs";
import newsletter from "./_handlers/newsletter.mjs";
import contact from "./_handlers/contact.mjs";
import coupons from "./_handlers/coupons.mjs";
import analytics from "./_handlers/analytics.mjs";
import debugEc from "./_handlers/debug-ec.mjs";
import stock from "./_handlers/stock.mjs";
import trackOrder from "./_handlers/track-order.mjs";
import reviews from "./_handlers/reviews.mjs";
import updateStatus from "./_handlers/update-status.mjs";
import adminAnalytics from "./_handlers/admin-analytics.mjs";
import adminOrders from "./_handlers/admin-orders.mjs";
import adminNotes from "./_handlers/admin-notes.mjs";
import adminProducts from "./_handlers/admin-products.mjs";
import adminSettings from "./_handlers/admin-settings.mjs";
import adminStock from "./_handlers/admin-stock.mjs";

const ADMIN_404_HTML = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/><title>404 - الصفحة غير موجودة</title><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:Tajawal,system-ui,sans-serif;background:#f9fafb;direction:rtl}.box{text-align:center;padding:2rem}h1{font-size:6rem;margin:0;color:#d1d5db;font-weight:800}p{font-size:1.125rem;color:#6b7280;margin-top:.5rem}</style></head>
<body><div class="box"><h1>404</h1><p>الصفحة غير موجودة</p></div></body>
</html>`;

function admin404(req, res) {
  res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
  res.end(ADMIN_404_HTML);
}

export default async function handler(req, res) {
  const pathname = (req.url || "").split("?")[0].replace(/\/+$/, "");
  const parts = pathname.split("/").filter(Boolean);
  // parts[0] is "api" for direct hits, or "admin" for the /admin rewrite.
  const [first, second] = parts;

  try {
    if (first === "admin") {
      // /admin and /admin/* now redirect to the real dashboard path so the
      // panel is reachable (the login page still protects it).
      const rest = parts.slice(2).join("/");
      const q = (req.url || "").split("?")[1] ? `?${(req.url || "").split("?")[1]}` : "";
      const adminPath = process.env.VITE_ADMIN_PATH || "dashboard-nadine-admin";
      res.writeHead(301, { Location: `/${adminPath}${rest ? `/${rest}` : ""}${q}` });
      return res.end();
    }
    if (first !== "api") {
      return res.status(404).json({ error: "Not found" });
    }

    switch (second) {
      case "order": return await order(req, res);
      case "newsletter": return await newsletter(req, res);
      case "contact": return await contact(req, res);
      case "coupons": return await coupons(req, res);
      case "analytics": return await analytics(req, res);
      case "debug-ec": return await debugEc(req, res);
      case "stock": return await stock(req, res);
      case "track-order": return await trackOrder(req, res);
      case "reviews": return await reviews(req, res);
      case "update-status": return await updateStatus(req, res);
      case "admin":
        switch (parts[2]) {
          case "analytics": return await adminAnalytics(req, res);
          case "orders": return await adminOrders(req, res);
          case "notes": return await adminNotes(req, res);
          case "products": return await adminProducts(req, res);
          case "settings": return await adminSettings(req, res);
          case "stock": return await adminStock(req, res);
          default: return admin404(req, res);
        }
      default:
        return res.status(404).json({ error: "Not found" });
    }
  } catch (err) {
    console.error("API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
