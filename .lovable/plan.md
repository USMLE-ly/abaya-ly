## Goal

1. Fix the misaligned buttons in the "تم استلام طلبك بنجاح" success modal.
2. Collect the customer's name at checkout (required).
3. After a confirmed order, generate a personalized luxury certificate carrying two seals: a fixed store authenticity seal and a per-outfit seal.

## 1. Success popup button fix

In `src/components/BookingModal.tsx` (success state, lines ~510-551) the track button is an `inline-flex … px-5 py-2.5 text-xs mt-4` link while "متابعة التسوق" is a `px-6 py-2.5 text-sm mt-6` button — different widths, text sizes and gaps.

Replace both with one flex container:
- `flex flex-col sm:flex-row gap-3 mt-6` (RTL-safe, gap only, no per-button margins)
- Each button: `flex-1 h-12 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold` — identical height, padding, and type scale.
- Primary = track order (gradient fill), secondary = continue shopping (outlined, `border border-brand text-brand`) so weights read as a pair.
- Stack full-width on mobile, side-by-side from `sm:` up.
- A third, quieter link "شهادة الطلب" opens the certificate.

## 2. Customer name (required)

- `BookingModal`: add a required "الاسم الكريم" text input above the phone field, min 2 / max 60 chars, trimmed, Arabic-friendly. Block submit with an inline error when empty.
- Send it as a new `customerName` field in the POST body.
- `api/_handlers/order.mjs`: sanitize `customerName`, require it, store it on the order object, and add a `👤 الاسم` line to the Telegram message. `code`, `phone` validation and the response shape stay exactly as they are — no change to the existing checkout contract, so old clients keep working.
- Admin order detail + track-order display the name where the order fields are listed.

## 3. Certificate components

Create the provided component library under the shadcn UI path already used by this project (`src/components/ui/`):

- `src/components/ui/award.tsx` — the full `Awards` component exactly as supplied (variants: stamp, award, certificate, badge, sticker, id-card), with `cn` from `@/lib/utils` (already exists). Only the color classes are re-pointed to brand tokens (strawberry `#c42855` / gold accent) instead of raw yellow/gray gradients.
- `src/components/ui/certificate.tsx` — thin wrapper rendering `variant="certificate"`.

Then the brand layer:

- `src/components/certificate/StoreSeal.tsx` — `Awards` **stamp** variant, fixed content: "NADINE LUXURY" curved top, "دار الأزياء المعتمدة" curved bottom, brand star. Identical on every order.
- `src/components/certificate/OutfitSeal.tsx` — `Awards` **badge** variant, generated per ordered item from `src/data/products.ts`: model/name, SKU code, collection, color/edition, and the order reference.
- `src/components/certificate/OrderCertificate.tsx` — the main certificate that composes them: Tajawal RTL, dotted gold border, crown/award mark, "شهادة أصالة", customer name, order number, purchased outfit(s), date in Arabic, store seal bottom-right, outfit seal bottom-left. Multi-item orders render one outfit seal per item (wrapped row, capped at 4 then "+N").

## 4. Data flow & delivery

- On success, `BookingModal` already holds everything needed (`orderId`, name, phone, and `cart.items` / single product props). It stores a `CertificateData` object in state and passes it to the certificate.
- Delivery: "شهادة الطلب" opens a full-screen modal with the rendered certificate and a **تحميل الشهادة** button using `html-to-image` (`toPng`, pixelRatio 2) → downloads `nadine-certificate-<orderId>.png`. This is a client-only render; nothing is persisted server-side.
- The same certificate is reachable later from `/track-order` once an order is found, so the customer isn't forced to save it immediately.

## Not breaking checkout

- No change to the order POST endpoint's URL, status codes, or `{ success, orderId, message }` response.
- `customerName` is additive; the handler treats a missing value as `"—"` for any legacy caller.
- Certificate rendering happens strictly after `res.ok` — it cannot block or fail the order, and it's wrapped in an error boundary so a render fault still leaves the success modal intact.
- Cart clearing (`onSuccess`) still fires exactly as today, before the certificate is opened; the certificate reads from a snapshot taken at submit time, not from the live cart.

## Technical notes

- Project is Vite + React + TS + Tailwind with `@/` alias and `cn` in `src/lib/utils.ts`, so the shadcn-style `src/components/ui/` path works as-is; `lucide-react` is already installed.
- One new dependency: `html-to-image`.
- Tokens used: existing `--color-strawberry-*`, `bg-card`, `text-muted-foreground` equivalents in `src/index.css`; no new hardcoded hex outside the certificate's gold foil accent, which will be added as a token.
