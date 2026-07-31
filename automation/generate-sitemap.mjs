import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const SITE_URL = "https://nadine.luxor.ly";

const staticPages = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/collections", priority: "0.9", changefreq: "weekly" },
  { path: "/cart", priority: "0.3", changefreq: "monthly" },
  { path: "/faq", priority: "0.5", changefreq: "monthly" },
  { path: "/contact", priority: "0.5", changefreq: "monthly" },
  { path: "/track-order", priority: "0.4", changefreq: "monthly" },
  { path: "/about", priority: "0.6", changefreq: "monthly" },
  { path: "/shipping-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/refund-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms", priority: "0.3", changefreq: "yearly" },
  { path: "/privacy", priority: "0.3", changefreq: "yearly" },
  { path: "/wishlist", priority: "0.3", changefreq: "monthly" },
];

// Product IDs — read from products data file (dynamic)
// This will be populated at build time
const productIds = [
  "lumiere-white-polka-midi", "noir-navy-polka-belted", "maison-gold-polka-belted",
  "rouge-burgundy-polka-vneck", "azure-sky-blue-polka-belted", "azure-navy-polka-puff",
  "lumiere-white-polka-off-shoulder", "botanique-pink-polka-belted", "lumiere-cream-polka-maxi",
  "noir-black-polka-mandarin", "lumiere-cream-polka-lace", "rouge-burgundy-off-shoulder",
  "rouge-black-abstract-bandeau", "rouge-red-polka-sweetheart", "noir-black-white-polka-bustier",
  "noir-black-asymmetric-draped", "maison-brown-draped", "rouge-burgundy-silk-fitted",
  "rouge-burgundy-polka-halter", "azure-white-polka-halter", "noir-black-lace-halter",
  "botanique-pink-embroidered", "olive-ruffle", "white-beach", "red-velvet",
  "white-lace", "black-lace", "cream-silk", "night-velvet", "gold-embroidered-1",
  "gold-embroidered-2", "gold-embroidered-3", "gold-embroidered-4",
  "gold-embroidered-5", "gold-embroidered-6", "al-sahra-gold", "pearl-dream",
  "moonlight-silver", "desert-gold", "velvet-burgundy", "silk-cloud",
  "ivory-grace", "ocean-breeze", "obsidian-mist", "floral-sleeve",
];

const now = new Date().toISOString();

function xml(url) {
  return `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${url.lastmod || now}</lastmod>
    <changefreq>${url.changefreq || "monthly"}</changefreq>
    <priority>${url.priority || "0.5"}</priority>
  </url>`;
}

function escapeXml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const urls = [
  ...staticPages.map((p) => ({
    loc: `${SITE_URL}${p.path}`,
    priority: p.priority,
    changefreq: p.changefreq,
    lastmod: now,
  })),
  ...productIds.map((id) => ({
    loc: `${SITE_URL}/product/${id}`,
    priority: "0.8",
    changefreq: "monthly",
    lastmod: now,
  })),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(xml).join("\n")}
</urlset>`;

const outPath = join(root, "public", "sitemap.xml");
writeFileSync(outPath, sitemap, "utf-8");
console.log(`✅ Sitemap generated: ${outPath} (${urls.length} URLs)`);
