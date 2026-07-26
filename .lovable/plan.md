
# Port the full VELAR design system into the site

I decompressed `VELAR - Design System.fig` (fig-kiwi + zstd frame at offset 27116, 12.5 MB payload) and pulled out every published token, style, and component variant. Today `src/index.css` only mirrors ~5% of it (rose primary + blush surface + Fraunces/Inter). The rest — the full 8-family color ramp, semantic layers, elevation, radii, space scale, type scale, three theme modes, and the entire component set — is missing. This plan adds all of it.

## What VELAR actually ships (extracted from the .fig)

**Color primitives** — 8 named ramps × 11 steps (50 → 950):
`strawberry`, `bubblegum`, `cotton`, `lavender`, `lemon`, `mint`, `peach`, `sky`
plus `utility/white`, `utility/transparent`, `overlay/50|70|80`, `shadow/4|6|8|12|16`.

**Semantic layer** (mode-aware):
- `accent/brand`, `accent/brand-hover`, `accent/brand-pressed`, `accent/brand-subtle`, `accent/brand-subtle-hover`
- `surface/canvas`, `surface/raised`, `surface/sunken`, `surface/overlay`, `surface/inverse`
- `text/primary`, `text/secondary`, `text/tertiary`, `text/disabled`, `text/inverse`, `text/onAccent`
- `border/default`, `border/subtle`, `border/strong`, `border/focus`, `border/action/normal`, sizes `border/0|sm|md|lg|xl`
- Status: `Success`, `Info`, `Warning`, `Danger`, `Neutral` (Solid + Subtle pairs)

**Radii** — `none, xs, sm, md, lg, xl, 2xl, 3xl, full`
**Space** — `0, 2xs, xs, sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl, 8xl`
**Elevation** — 6 shadows: `0 flat → 1 subtle → 2 raised → 3 overlay → 4 modal → 5 toast/popover`
**Sizes** — `control-sm|md|lg`, `icon-sm|md|lg|xl`, `avatar-24|32|40|48|56|64`

**Typography** — families `display = Fraunces`, `body = Inter` (Inter Display for large), `mono = JetBrains Mono`. Sizes `xs, sm, base, lg, xl, 2xl…6xl` + `control-sm|md|lg`. Weights `regular, medium, semibold, bold`. Tracking `tightest, tight, normal, wide, wider`. Line-heights matched per size.

**Theme modes** — `Light`, `Dark`, `High Contrast`.

**Components** (every variant is published):
- Button — 5 variants (Primary, Secondary, Tertiary, Ghost, Destructive) × 3 sizes (Sm/Md/Lg) × states (Default, Hover, Pressed, Focus, Loading, Disabled) × icon slots (None / Left / Right / Both / Icon-only)
- Badge, Tag (Solid + Subtle, tones: Brand / Info / Success / Warning / Danger / Neutral)
- Alert (title + supporting text + dismiss + inline action)
- Card (flat / subtle / raised / overlay)
- Modal (title, subtitle, body, footer with primary/secondary/cancel)
- Accordion (default, with icon, with chevron)
- Input, Textarea, Select — Default / Hover / Focus / Filled / Error / Disabled + label / sublabel / hint / error row / required asterisk / leading & trailing icons / clear
- Switch, Radio, Checkbox (Default, Checked, Indeterminate, Disabled, with label & sublabel)
- Avatar 24/32/40/48/56/64 (Icon / Image / Initials / Logo, with optional status dot)
- Divider (inline / stacked)
- Spinner, Progress
- Toast, Tooltip
- Tabs, Chip, Menu, List / ListItem, Table row, Pagination, Breadcrumb, Stepper, Slider

## Execution steps

1. **Rewrite `src/index.css`** — replace the current mini-token block with the full VELAR layer:
   - Under `:root` (Light mode): declare all 8 × 11 palette variables as `--color-strawberry-50 … --color-sky-950`, plus utility, overlay, shadow tints.
   - Add semantic aliases (`--surface-canvas`, `--text-primary`, `--accent-brand`, `--border-default`, etc.) pointing at palette steps per mode.
   - Add `[data-theme="dark"]` and `[data-theme="hc"]` blocks that re-point the semantic layer for Dark + High Contrast modes.
   - Add `--radius-*`, `--space-*`, `--shadow-elevation-0…5`, `--size-control-*`, `--size-icon-*`, `--size-avatar-*`.
   - Add `--font-size-*`, `--font-lh-*`, `--font-weight-*`, `--font-tracking-*`.
   - Repoint every legacy alias (`--color-gold`, `--color-cream`, `--color-primary`, `--color-foreground`, `--background`, etc.) onto the new semantic tokens so the existing site keeps rendering during the swap.
   - In `@theme inline`, expose every new variable so Tailwind v4 auto-generates `bg-strawberry-500`, `text-mint-700`, `shadow-elevation-3`, `rounded-2xl` (mapped), `p-lg`, etc.

2. **`index.html`** — extend the Google Fonts link to add `JetBrains Mono` alongside Fraunces + Inter + Almarai + Noto Kufi Arabic.

3. **New primitive library at `src/components/velar/`** (each file self-contained, CVA-based variants, token-only styling):
   `Button.tsx`, `IconButton.tsx`, `Badge.tsx`, `Tag.tsx`, `Alert.tsx`, `Card.tsx`, `Modal.tsx`, `Accordion.tsx`, `Input.tsx`, `Textarea.tsx`, `Select.tsx`, `Checkbox.tsx`, `Radio.tsx`, `Switch.tsx`, `Avatar.tsx`, `Divider.tsx`, `Spinner.tsx`, `Progress.tsx`, `Tooltip.tsx`, `Toast.tsx` (+ provider), `Tabs.tsx`, `Chip.tsx`, `Menu.tsx`, `List.tsx`, `Pagination.tsx`, `Breadcrumb.tsx`, `Stepper.tsx`, `Slider.tsx`. Each mirrors the Figma variant matrix exactly (variant × size × state × icon config).

4. **Wire the site to the new primitives**:
   - Replace ad-hoc `<button>`/`<a>` CTAs in `Header`, `LuminaHero`, `ElegantCarousel`, `ProductCarousel`, `Product`, `Cart`, `Contact`, `Footer`, `ComparisonTable`, `ContactForm` with `<Button variant="primary|secondary|tertiary|ghost|destructive" size="sm|md|lg">`.
   - Swap raw form fields on `Contact`, `TrackOrder`, `Cart` for `Input` / `Textarea` / `Select` / `Checkbox` / `Radio` with label + hint + error slots.
   - Replace bespoke status pills / dots with `<Tag>` / `<Badge>`.
   - Use `<Card elevation="raised|overlay">` for product cards, testimonial cards, FAQ cards.
   - Use `<Accordion>` on `FAQ.tsx`.
   - Add a `<ThemeToggle>` in the header exposing Light / Dark / High-Contrast (writes `data-theme` on `<html>`).

5. **Documentation surface** (optional but small): `src/pages/DesignSystem.tsx` on `/design-system` renders every token swatch and every component variant so the mapping is auditable. Not linked from public nav.

6. **Verify**:
   - `bun run build` clean.
   - Playwright at 1280×1800 + 390×844: home, /collections, a product page, /cart, /contact, /faq, /design-system. Capture Light + Dark + HC.
   - `rg -n '#[0-9a-fA-F]{6}|text-white|bg-white|bg-black|text-black|font-family:' src` returns nothing outside `src/index.css` and product-color swatches.

## Technical notes

- Tailwind v4 `@theme inline` means every VELAR variable becomes a first-class utility automatically — no `tailwind.config.ts` work needed.
- Arabic RTL + Almarai/Noto Kufi Arabic stay intact; VELAR is layered on top, not a replacement of the RTL setup.
- Product garment color hexes in `src/data/products.ts` stay untouched — they describe fabric, not brand.
- No routing, data, or business-logic changes.

## Out of scope (unless you say otherwise)

- Rewriting page layouts / content
- Product data changes
- Adding a headless CMS or backend
- Any Lovable Cloud integration

Say the word and I'll switch to build mode and execute steps 1 → 6 in order.
