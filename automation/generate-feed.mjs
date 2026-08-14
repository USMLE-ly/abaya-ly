// ═══════════════════════════════════════════════════════════════
// Meta product catalog feed (dynamic product ads / DPA).
//
// Reads public/products.json (written by export-products.ts) and
// writes public/products-feed.xml. Meta catalogs can fetch the file
// directly from the deployed URL:
//     https://nadine.luxor.ly/products-feed.xml
//
// Product <g:id> values equal the storefront product IDs used in
// ViewContent / Purchase content_ids, so Meta matches events to
// catalog items automatically.
// ═══════════════════════════════════════════════════════════════
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const SITE_URL = "https://nadine.luxor.ly";
const BRAND = "Nadine";
const CATEGORY = "Apparel & Accessories > Clothing > Dresses";
const CURRENCY = "LYD";

const productsJson = JSON.parse(readFileSync(join(root, "public", "products.json"), "utf-8"));
const catalog = Array.isArray(productsJson) ? productsJson : productsJson.products ?? [];

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function imageUrl(src) {
  return /^https?:\/\//.test(src || "") ? src : `${SITE_URL}${src || ""}`;
}

const items = catalog.map((p) => {
  const images = (p.images || []).map(imageUrl);
  const price = Number(p.price) || 0;
  const item = [
    `  <item>`,
    `    <g:id>${esc(p.id)}</g:id>`,
    `    <g:title>${esc(p.name)}</g:title>`,
    `    <g:description>${esc(p.description || p.name)}</g:description>`,
    `    <g:link>${SITE_URL}/product/${esc(p.id)}</g:link>`,
    `    <g:image_link>${esc(images[0] || `${SITE_URL}/favicon.png`)}</g:image_link>`,
  ];
  for (const img of images.slice(1)) {
    item.push(`    <g:additional_image_link>${esc(img)}</g:additional_image_link>`);
  }
  item.push(
    `    <g:availability>in stock</g:availability>`,
    `    <g:condition>new</g:condition>`,
    `    <g:price>${price.toFixed(2)} ${CURRENCY}</g:price>`,
    `    <g:brand>${esc(BRAND)}</g:brand>`,
    `    <g:google_product_category>${esc(CATEGORY)}</g:google_product_category>`,
  );
  if (p.originalPrice) item.push(`    <g:sale_price>${price.toFixed(2)} ${CURRENCY}</g:sale_price>`);
  if (p.collection) item.push(`    <g:custom_label_0>${esc(p.collection)}</g:custom_label_0>`);
  if (p.model) item.push(`    <g:item_group_id>${esc(p.model)}</g:item_group_id>`);
  if (p.colors && p.colors[0]?.name) item.push(`    <g:color>${esc(p.colors[0].name)}</g:color>`);
  item.push(`  </item>`);
  return item.join("\n");
}).join("\n");

const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${esc(BRAND)} — ${esc(CATEGORY)}</title>
    <link>${SITE_URL}/</link>
    <description>${esc(BRAND)} — luxury dress catalog for Meta dynamic product ads</description>
${items}
  </channel>
</rss>
`;

const outPath = join(root, "public", "products-feed.xml");
writeFileSync(outPath, feed, "utf-8");
console.log(`✅ Generated Meta feed: ${catalog.length} products → public/products-feed.xml`);
