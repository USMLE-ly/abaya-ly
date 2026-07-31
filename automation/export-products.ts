import { writeFileSync } from "fs";
import { join } from "path";
import { products } from "../src/data/products";

const out = products.map((p) => ({
  id: p.id, name: p.name, price: p.price, originalPrice: p.originalPrice,
  collection: p.collection, model: p.model, fabric: p.fabric, category: p.category,
  images: p.images || [], colors: p.colors || [], sizes: p.sizes || [],
  badge: p.badge || "", description: p.description || "",
  details: p.details || [], highlights: p.highlights || [], tags: p.tags || [],
  rating: p.rating || 0, reviewCount: p.reviewCount || 0,
}));

const outPath = join(process.cwd(), "public", "products.json");
writeFileSync(outPath, JSON.stringify(out, null, 2), "utf-8");
console.log(`✅ Exported ${out.length} products to products.json`);
