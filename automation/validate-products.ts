#!/usr/bin/env npx tsx
// ════════════════════════════════════════════════════════════════
// Product Naming & Hierarchy Validation
// Enforces: collection → model → color/descriptor → edition
// Blocks forbidden fabrication words in highlights
// Run: npx tsx automation/validate-products.ts
// ════════════════════════════════════════════════════════════════

import { products, brandCollections } from "../src/data/products";

// ── Forbidden words in highlights (visible-only rule) ────────────
const FORBIDDEN_HIGHLIGHT_WORDS = [
  // "تطريز",   // embroidery — allowed (visible in product images)
  "لؤلؤ",    // pearls — fabrication claim
  "شبك",     // lace pattern
  "خرز",     // beads
  "الماس",   // diamonds/crystals
  "كристال", // crystal
  "فيروز",   // turquoise stones
];

// ── Valid collection names ────────────────────────────────────────
const VALID_COLLECTIONS = brandCollections.map(c => c.name);

// ── Validation rules ─────────────────────────────────────────────
type Violation = {
  productId: string;
  field: string;
  message: string;
};

function validate(products: ReturnType<typeof import("../src/data/products")["products"]>): Violation[] {
  const violations: Violation[] = [];
  const usedModels = new Map<string, string>(); // model → productId

  for (const p of products) {
    // 1. Name hierarchy format: «Collection • Model • Descriptor • Edition»
    const nameParts = p.name.split(" • ");
    if (nameParts.length !== 4) {
      violations.push({ productId: p.id, field: "name", message: `Name must have 4 parts separated by " • ", got ${nameParts.length}` });
    } else {
      const [col, model, desc, edition] = nameParts;
      if (col.trim() !== p.collection) {
        violations.push({ productId: p.id, field: "name", message: `Collection in name ("${col.trim()}") doesn't match collection field ("${p.collection}")` });
      }
      if (model.trim() !== p.model) {
        violations.push({ productId: p.id, field: "name", message: `Model in name ("${model.trim()}") doesn't match model field ("${p.model}")` });
      }
      if (!desc.trim().startsWith("فستان")) {
        violations.push({ productId: p.id, field: "name", message: `Descriptor should start with "فستان", got "${desc.trim().substring(0, 20)}"` });
      }
      if (edition.trim() !== p.edition) {
        violations.push({ productId: p.id, field: "name", message: `Edition in name ("${edition.trim()}") doesn't match edition field ("${p.edition}")` });
      }
    }

    // 2. Collection is valid
    if (!VALID_COLLECTIONS.includes(p.collection)) {
      violations.push({ productId: p.id, field: "collection", message: `"${p.collection}" is not a valid collection. Valid: ${VALID_COLLECTIONS.join(", ")}` });
    }

    // 3. Model is unique
    if (usedModels.has(p.model)) {
      violations.push({ productId: p.id, field: "model", message: `Model "${p.model}" already used by "${usedModels.get(p.model)}"` });
    } else {
      usedModels.set(p.model, p.id);
    }

    // 4. Edition matches constant
    if (p.edition !== "إصدار 2026") {
      violations.push({ productId: p.id, field: "edition", message: `Edition should be "إصدار 2026", got "${p.edition}"` });
    }

    // 5. Forbidden words in highlights
    for (const h of p.highlights) {
      for (const word of FORBIDDEN_HIGHLIGHT_WORDS) {
        if (h.includes(word)) {
          violations.push({ productId: p.id, field: "highlights", message: `Forbidden word "${word}" found in: "${h.substring(0, 60)}"` });
        }
      }
    }

    // 6. Tag count (15–25)
    if (p.tags.length < 15) {
      violations.push({ productId: p.id, field: "tags", message: `Only ${p.tags.length} tags, minimum is 15` });
    }
    if (p.tags.length > 25) {
      violations.push({ productId: p.id, field: "tags", message: `Has ${p.tags.length} tags, maximum is 25` });
    }

    // 7. Tags include collection name
    const collectionTag = p.collection.replace(/[' ]/g, "-");
    const hasCollectionTag = p.tags.some(t => t.includes(p.collection) || t.includes(collectionTag));
    if (!hasCollectionTag) {
      violations.push({ productId: p.id, field: "tags", message: `Tags missing collection name "${p.collection}"` });
    }

    // 8. Tags include model name
    const hasModelTag = p.tags.some(t => t.includes(p.model));
    if (!hasModelTag) {
      violations.push({ productId: p.id, field: "tags", message: `Tags missing model name "${p.model}"` });
    }
  }

  return violations;
}

// ── Run ──────────────────────────────────────────────────────────
console.log("🔍 Validating product naming & hierarchy...\n");

const violations = validate(products);

if (violations.length === 0) {
  console.log(`✅ All ${products.length} products pass validation.`);
  console.log(`   Collections: ${VALID_COLLECTIONS.length}`);
  console.log(`   Models: ${products.length} (all unique)`);
  console.log(`   Forbidden words: none found in highlights`);
  process.exit(0);
} else {
  console.log(`❌ Found ${violations.length} violation(s):\n`);
  
  // Group by product
  const grouped = new Map<string, Violation[]>();
  for (const v of violations) {
    const list = grouped.get(v.productId) ?? [];
    list.push(v);
    grouped.set(v.productId, list);
  }

  for (const [pid, viols] of grouped) {
    console.log(`  📦 ${pid}`);
    for (const v of viols) {
      console.log(`     [${v.field}] ${v.message}`);
    }
    console.log();
  }

  console.log(`\nTotal: ${violations.length} violation(s) across ${grouped.size} product(s)`);
  process.exit(1);
}
