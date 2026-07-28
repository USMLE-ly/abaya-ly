
# Tajawal typography + Louis-Vuitton-style product architecture

Two independent tracks that ship together.

## Track 1 — Tajawal everywhere + RTL audit

**`index.html`**
- Drop the Google Fonts request for Inter + JetBrains Mono, drop the self-hosted `@font-face` blocks for Zodiak and Arslan Wessam B (files stay in `/public/fonts/` but are no longer loaded).
- Add one Google Fonts link: `Tajawal:wght@200;300;400;500;700;800;900`.

**`src/index.css`**
- Repoint every font token to Tajawal:
  - `--font-display`, `--font-body`, `--font-mono` → `'Tajawal', system-ui, sans-serif` (mono keeps a monospaced fallback: `'Tajawal', ui-monospace, monospace` — kept only so `font-mono` utilities don't break; nothing in the shipped pages actually uses code type).
  - Legacy aliases `--font-serif`, `--font-sans`, `--font-arabic-display`, `--font-arabic-body` all point to Tajawal so any lingering utility keeps working.
- Keep `html[dir="rtl"]` defaults, Arabic numerals, and the RTL body class untouched.

**RTL verification pass** (read-only, after the swap)
- Playwright at 390×844 and 1280×1800 on `/`, `/collections`, a product page (`/product/al-sahra-gold`), `/cart`, `/contact`, `/faq`, `/design-system`.
- Screenshot each. Check for: mirrored icons that shouldn't mirror, English strings bleeding into Arabic lines, VELAR components (Button leading/trailing icons, Input label/hint, Alert dismiss, Accordion chevron, Tabs underline, Tooltip arrow, Modal close, Checkbox/Radio label side) sitting on the correct side under `dir="rtl"`.
- Any component that visibly breaks under RTL gets a targeted fix in `src/components/velar/<Component>.tsx` (swap `ml-*/mr-*` for logical `ms-*/me-*`, `left/right` for `start/end`, remove hardcoded `flex-row` where `flex-row-reverse` is implied by RTL, etc.). No API changes.

## Track 2 — Luxury product naming architecture (Louis Vuitton / Hermès style)

Rewrite `src/data/products.ts` for all 14 products. Keep IDs, prices, images, sizes, ratings, color hexes, and `linkTo` cross-links **unchanged** — only naming/copy fields change.

### New per-product fields

Extend the `Product` interface:

```ts
collection: string;        // e.g. "Noir Atelier"
model: string;             // e.g. "Aurelia"
edition: string;           // e.g. "إصدار 2026"
subtitle: string;          // luxury one-liner
seoName: string;           // clean searchable Arabic title
slug: string;              // Arabic URL slug (kebab-case Arabic)
tags: string[];            // 15–25 tags
```

`name` becomes the full hierarchy string: `«{collection} • {model} • {arabic descriptor} • {edition}»`.
`description` is rewritten to 80–150 words, focused on craftsmanship / silhouette / versatility, no invented embellishments.
`highlights` are rewritten to describe only what's visible in that product's image (neckline, sleeve, length, waist, pattern, movement) — no embroidery/lace/pearls unless clearly there.
`details` is rewritten in the same visible-only spirit.

### Collection assignment (by the garment's actual primary color)

| Collection | Palette | Products |
|---|---|---|
| **Noir Atelier** | black / charcoal | `olive-ruffle`, `night-velvet` (white-with-black-dots stays here because pattern reads black), `gold-embroidered-5` |
| **Lumière** | ivory / pearl / champagne | `al-sahra-gold` (white), `gold-embroidered-2` (ivory), `floral-sleeve` (cream) |
| **Rouge Héritage** | wine / ruby / burgundy | `white-beach` (wine), `gold-embroidered-3` (deep wine), `gold-embroidered-6` (wine) |
| **Azure** | sky / navy / sapphire | `red-velvet` (sky blue), `black-lace` (deep navy) |
| **Botanique** | rose / blossom | `white-lace` (pink) |
| **Maison d'Or** | gold / bronze / cocoa | `cream-silk` (gold), `gold-embroidered-1` (antique gold), `gold-embroidered-4` (dark chocolate) |

Model names (never trademarked): Aurelia, Céleste, Ophélie, Sérène, Colette, Odile, Amélie, Margaux, Elodie, Solène, Inès, Livia, Noor, Yasmina, Salma — one per product, unique.

### Example rewrite (for `al-sahra-gold`)

- `name`: «Lumière • Céleste • فستان سهرة أبيض بنقاط سوداء كلاسيكية • إصدار 2026»
- `collection`: "Lumière"
- `model`: "Céleste"
- `edition`: "إصدار 2026"
- `subtitle`: "أناقة كلاسيكية بخطوط نظيفة ولمسة أنثوية معاصرة."
- `seoName`: "فستان سهرة أبيض بنقاط سوداء — مجموعة Lumière"
- `slug`: "lumiere-celeste-فستان-سهرة-أبيض-منقط"
- `highlights` (visible-only): «قصة ميدي محددة الخصر تبرز القوام بأناقة.» / «أكمام قصيرة نظيفة الحواف ترسم خطاً نسائياً معاصراً.» / «نقشة النقاط السوداء الكلاسيكية على خلفية بيضاء تمنح إطلالة خالدة.»
- `description` (80–150 words): editorial Arabic focused on silhouette, versatility, timeless appeal.
- `tags`: ["سهرة","أبيض","منقط","ميدي","أكمام-قصيرة","محدد-الخصر","كلاسيكي","نسائي","مناسبات","ربيع-صيف","Lumière","Céleste","فستان-أبيض","نقاط-سوداء","إطلالة-خالدة","أنيق","راقي","ساتان","حفلات","خروجات-راقية"]

Same treatment for the remaining 13 products, each anchored to what its image actually shows.

### UI surfaces that render the new fields

- **Product card** (`ProductCarousel`, `Collections`, `OutfitGallery` where applicable): small uppercase collection tag above the Arabic descriptor; model name as a subtle line under the title.
- **Product page** (`src/pages/Product.tsx`): collection + edition as an eyebrow line, model as a secondary title, Arabic descriptor as the H1, `subtitle` under it, then price / description / highlights / details as today.
- **`<head>`** on the product page: use `seoName` for `<title>` and `subtitle` for `<meta description>`.

## Technical notes

- `Product` interface change is additive; existing consumers that only read `name`/`description` keep working through the transition.
- Tag `slug` is stored for future routing but not wired to routes in this pass (would need a router change out of scope).
- No business-logic, no cart, no data-shape breaking changes beyond the additive fields.
- After edits: `bun run build`, then Playwright RTL screenshots on the 7 routes above for verification.

## Out of scope

- Changing product photography or reordering the catalog.
- Routing by slug.
- Any backend / Lovable Cloud work.

Say the word and I'll switch to build mode and execute Track 1 then Track 2.
