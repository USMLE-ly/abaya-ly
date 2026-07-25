# Rebrand to VELAR design system

The uploaded `VELAR - Design System.fig` is a proprietary Figma binary (kiwi format). The canvas itself can't be reliably parsed in-sandbox, so I extracted the visible identity from the file's thumbnail: a **rose/pink brand** with a **bold serif logo (VELAR)** paired with a **modern geometric sans** for body, on soft blush/off-white surfaces.

I'll apply the following VELAR palette + type pair as the single source of truth. If you have the exact hex values / font names from inside the Figma libraries, paste them and I'll use those verbatim instead.

## Proposed VELAR tokens

Colors (light theme):
- `--background` `#FFF7F8` (blush off-white)
- `--foreground` `#1A1113` (near-black plum)
- `--card` `#FFFFFF`
- `--muted` `#F5E6EA`
- `--muted-foreground` `#7A5560`
- `--border` `#F0D9DE`
- `--primary` `#E11D63` (VELAR rose)
- `--primary-foreground` `#FFFFFF`
- `--accent` `#FFB6C4` (soft pink)
- `--ring` `#E11D63`
- `--destructive` `#B00020`

Typography:
- Display / headings: **Fraunces** (serif, matches the VELAR wordmark)
- Body / UI: **Inter** (geometric sans for `Design System` label + all UI)
- Arabic fallback stays **Almarai** / **Noto Kufi Arabic** for the RTL copy (VELAR fonts are Latin-only).

## Execution steps

1. **Rewrite `src/index.css`**
   - Replace every value under `:root` and `@theme inline` with the VELAR tokens above.
   - Update `--font-display` → `"Fraunces", "Noto Kufi Arabic", serif` and `--font-body` → `"Inter", "Almarai", sans-serif`.
   - Refresh legacy aliases (`--color-gold`, `--color-cream`, `--color-ink`, glass tints) to map onto the new rose/blush palette so existing components pick up the change with no edits.
   - Update `.glass*` tints to blush-white with rose borders.

2. **Update `index.html`**
   - Swap Google Fonts link to load Fraunces + Inter + keep Almarai/Noto Kufi Arabic.
   - Keep `<html lang="ar" dir="rtl">` and Arabic `<title>`/`<meta>` unchanged.

3. **Sweep hard-coded colors** across:
   `src/pages/{Home,Product,Collections,Cart,Contact,About,FAQ,TrackOrder,PrivacyPolicy,RefundPolicy,ShippingPolicy,TermsOfService}.tsx`,
   `src/components/{Header,Footer,LuminaHero,SlideshowHero,ElegantCarousel,ProductCarousel,OutfitGallery,ComparisonTable,ContactForm,IconBar,GlobeSection,ResultsStats}.tsx`,
   `src/components/ui/{slide-tabs,grid-feature-cards,iphone-mockup,flip-gallery}.tsx`.
   - Replace raw hex (`#c96442`, `#faf9f5`, `#3d3929`, gold/cream literals, `bg-[#...]`, `text-[#...]`) with semantic tokens (`bg-primary`, `text-foreground`, `bg-background`, `border-border`, `text-muted-foreground`).
   - Replace `text-white`/`bg-white`/`text-black`/`bg-black` with `text-primary-foreground`/`bg-card`/`text-foreground`/`bg-foreground` per context.
   - Replace any inline `font-family` and `font-*` literals with `font-display` / `font-body` classes tied to the new CSS vars.

4. **Product swatches (`src/data/products.ts`)** – leave the outfit color hexes alone (they describe garment color, not brand); only the surrounding UI restyles.

5. **Verify**
   - Build (`bun run build`) and open `/`, `/collections`, a product page, and `/cart` via Playwright at 1280×1800 + 390×844 to confirm the rose/blush theme applies everywhere with no residual gold/cream leaks.
   - Grep for stragglers: `rg -n '#c96442|#faf9f5|#3d3929|gold|cream|text-white|text-black|bg-white|bg-black' src`.

## Technical notes

- Tailwind v4 with `@theme inline` in `src/index.css` means changing the CSS variables cascades to every `bg-primary`, `text-foreground`, etc. — so the bulk of the visual change happens in step 1. Steps 3–4 exist only to purge components that bypassed the tokens.
- No business logic, routing, data, or product content is touched. RTL + Arabic copy preserved.
- If you'd rather I extract the exact tokens from the `.fig`, share a Figma share link (or export the Styles panel as JSON / a screenshot of the color + type styles) and I'll swap the values in step 1 before implementing.
