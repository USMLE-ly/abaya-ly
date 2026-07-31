# Premium CRO Upgrade — نادين

One big pass across the whole storefront. Brand identity (strawberry/VELAR palette, Tajawal, Arabic RTL) stays exactly as is; everything added reuses existing design tokens and `src/components/velar` primitives.

## What's already in place (reused, not rebuilt)
- Wishlist, RecentlyViewed, ReviewsSection, SizeGuide, ImageLightbox, SocialShare, StickyBookingBar, NewsletterSection, CookieConsent, WhatsAppButton.
- `api/reviews.mjs` (real reviews, admin-moderated) and `api/coupons.mjs` (real coupon validation) exist server-side.
- Policy pages: shipping, refund, terms, privacy, FAQ, track-order.

Note on stock: `src/data/products.ts` currently has **no** stock field. Real inventory needs a `stock: number` per product plus an admin editor — included below. Scarcity/urgency UI renders only when a real number is present.

## 1. Data layer
- Add `stock`, `lowStockThreshold`, `video?`, `completeTheLook?: string[]`, `bundleWith?: string[]` to the `Product` interface and fill values.
- Admin → Products: editable stock column so the number stays truthful.
- `src/lib/analytics.ts` — GA4 via the Google Analytics connector (measurement ID from the connector env var), SPA page_view on route change, plus typed event helpers.
- `src/lib/cart.ts` — extract cart read/write out of the components into one module (currently duplicated in Header/Cart), so add-to-cart, buy-now, and coupon logic share one source.

## 2. Homepage
- Announcement bar (dismissible, promo-driven) above the sticky header.
- Hero: keep LuminaHero visuals, add a real value proposition headline + subheadline + one primary CTA above the fold, with a secondary "تسوّقي المجموعة".
- Best sellers / trending rail (sorted by real review count + rating), seasonal / featured collections block.
- Ratings + testimonials pulled from the reviews API, not placeholders.
- Trust strip: cash-on-delivery, free shipping across Libya, 7-day returns, custom tailoring, WhatsApp support.
- Free-shipping-threshold and first-order-discount messaging tied to actual coupon records.

## 3. Product page
- Gallery: high-res with hover/pinch zoom, lifestyle + fabric close-ups, optional video slot, thumbnail rail.
- Sticky add-to-cart bar (mobile + desktop) with price, size, and both **أضيفي للسلة** and **اشتري الآن**.
- Price block: current, struck original, saving badge, anchoring copy.
- Stock indicator + low-stock warning driven by the real `stock` value only.
- Benefits-first description, then material / sizing / care / specs accordion; size guide, shipping, returns, warranty, and product FAQ as inline accordions.
- Reviews with photos and verified-purchase badges from the reviews API.
- Related products, "يُشترى معاً" bundle (with real bundle discount), and "أكملي الإطلالة".
- Product JSON-LD (Product, AggregateRating, Offer, Breadcrumb).

## 4. Cart & checkout
- Coupon field wired to `api/coupons.mjs` (first-order + bundle codes).
- Free-shipping progress bar to threshold.
- Cross-sell rail, saved-for-later from wishlist, single-step streamlined checkout form with inline validation (zod), COD + WhatsApp order paths clearly labelled.
- Abandonment nudge: cart contents persisted and surfaced by the announcement bar on return.

## 5. Trust & credibility
- Payment/security icons (existing SVGs in `public/images/payments`), SSL and COD messaging, money-back and easy-return statements sourced from the real policy pages.
- Brand story and craftsmanship section, contact info and support hours visible in footer and product page.

## 6. Popups (as requested)
- Email capture: delayed + scroll-triggered, one-time, dismissible, `localStorage` suppressed.
- Exit-intent discount: desktop mouse-leave / mobile back-intent, shows a real first-order coupon code, capped at one impression per visitor.

## 7. Loyalty & referral
- Lightweight, honest version: referral link generator + rewards explainer page. No fake point balances — states clearly how rewards are claimed via WhatsApp until a backend ledger exists.

## 8. Design system polish
- Consistent button variants, spacing scale, hover/reveal motion via existing framer-motion helpers, contrast-checked tokens, one icon set (lucide).

## 9. Performance, SEO, a11y
- Lazy-load all below-fold imagery, `fetchpriority=high` + preload on the LCP hero image, width/height on images to kill CLS.
- Route-level code splitting already partly there — extend to Product and Home sub-sections.
- Per-page meta via existing `usePageMeta`, Organization + WebSite + Product + FAQ JSON-LD, sitemap refresh.
- WCAG pass: single `<main>`, heading order, `aria-label` on icon buttons, 44px tap targets, focus-visible rings.

## 10. Analytics events (GA4)
`page_view`, `view_item`, `add_to_cart`, `remove_from_cart`, `begin_checkout`, `purchase`, `add_to_wishlist`, `newsletter_signup`, `cta_click`, `scroll_depth`, `popup_shown/converted`, `coupon_applied` — each with product/value params so funnels and future A/B splits work.

## Technical notes
- Google Analytics is connected through the connectors flow; the measurement ID arrives as `VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY`. I'll request that connection during implementation.
- No backend framework change; existing Vercel `api/*.mjs` handlers stay the source of truth for orders, reviews, and coupons.
- Every urgency/scarcity element is gated behind real data — if `stock` is unset, the component renders nothing rather than inventing a number.
