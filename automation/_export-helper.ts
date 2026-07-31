
import { writeFileSync } from "fs";
import { products } from "./src/data/products";
const out = products.map((p) => ({
  id: p.id, name: p.name, price: p.price, originalPrice: p.originalPrice,
  collection: p.collection, model: p.model, fabric: p.fabric, category: p.category,
  images: p.images || [], colors: p.colors || [], sizes: p.sizes || [],
  badge: p.badge || "", description: p.description || "",
  details: p.details || [], highlights: p.highlights || [], tags: p.tags || [],
  rating: p.rating || 0, reviewCount: p.reviewCount || 0,
}));
writeFileSync("/root/Documents/Codex/2026-07-26/hello-there-my-name-is-javier/repo/public/products.json", JSON.stringify(out, null, 2));
console.log("Exported " + out.length + " products to products.json");
