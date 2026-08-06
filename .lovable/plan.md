# Meta Pixel tracking + conversion gap fill

Pixel ID: `760469593227327`. Fires immediately on load, no consent gate.

## 1. Install the pixel

- Add the Meta Pixel base snippet to the `<head>` of `index.html` with `fbq('init','760469593227327')`. The initial `PageView` fires from the app router (below) so single-page navigations aren't missed, not from the snippet.
- Add the `<noscript>` tracking image at the top of `<body>` (it is not valid inside `<head>`).

## 2. Wire the events into the existing analytics layer

The store already has an internal analytics module (`src/lib/analytics.ts`) with typed helpers for page views, product views, cart, checkout, purchase, wishlist, coupons and newsletter. Rather than sprinkling `fbq` calls across components, each helper will also forward the matching Meta event, so both systems stay in sync from one place.

| Store event | Meta event |
|---|---|
| page view (every route change) | `PageView` |
| product page opened | `ViewContent` |
| add to cart | `AddToCart` |
| wishlist add | `AddToWishlist` |
| checkout modal opened | `InitiateCheckout` |
| order confirmed | `Purchase` |
| newsletter / contact form submit | `Lead` |
| search submitted | `Search` |

Each payload carries `content_ids`, `content_name`, `content_type: 'product'`, `value`, `num_items` and `currency: 'LYD'` (the store prices in Libyan dinar, so Meta's catalog and ad reporting match the real order values).

## 3. Gaps to close (helpers that exist but are never called)

Confirmed by reading the code — these are wired to nothing today, so both the internal dashboard and the pixel are blind to them:

- **AddToCart** — the product page and cart drawer add items without firing the event.
- **InitiateCheckout** — never fired when the booking/checkout modal opens.
- **Purchase** — never fired after a confirmed order. This is the one that matters most for ads: without it, no conversion optimisation, no ROAS, no purchaser lookalike audience.
- **AddToWishlist** — wishlist toggle fires nothing.
- **Lead** — newsletter and contact form submissions fire nothing.
- **Search** — header search fires nothing.

All six get wired in this pass.

## 4. Facebook catalog readiness

Product IDs sent to the pixel will use the same `id` as `src/data/products.ts` and `public/products.json`, so a catalog feed built from that file matches the pixel events and dynamic retargeting ads work without an ID remap. No feed generation in this pass — flag it as a next step if you want dynamic ads.

## Not included

Your brief also lists user accounts/login, a blog, and Stripe checkout. Those are large, separate builds (accounts need a backend with auth and order history; the store currently checks out via order form + Telegram notification, with order tracking by number + phone). They are out of scope here — say the word and I'll plan them separately.

## Technical notes

- Files touched: `index.html`, `src/lib/analytics.ts` (add a `src/lib/meta-pixel.ts` module it delegates to), `src/pages/Product.tsx`, `src/components/BookingModal.tsx`, `src/components/CartDrawer.tsx`, `src/lib/wishlist.ts` consumers, `src/components/Footer.tsx` (newsletter), `src/components/ContactForm.tsx`, `src/components/Header.tsx` (search).
- Pixel calls are wrapped in a guard so a blocked/failed `fbevents.js` can never throw into React render or break checkout.
- `Purchase` fires once per order id, deduped in `sessionStorage`, so a page refresh on the success screen doesn't double-count revenue.
