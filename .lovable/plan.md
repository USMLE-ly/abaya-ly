# Fix "pixel wasn't detected"

Two separate things are going on. One is a real bug in the code, one is about where Meta is looking.

## 1. Real bug: events are sent with the wrong call signature

`src/lib/meta-pixel.ts` sends every event as:

```text
fbq('track', '<pixel id>', 'ViewContent', {...})
```

That is not valid Meta syntax — with `track`, the second argument must be the event name, so Meta reads the pixel ID as the event name. Only the base `PageView` from `index.html` is well-formed today; ViewContent / AddToCart / InitiateCheckout / Purchase / AddToWishlist / Lead / Search are all malformed.

Fix: since two pixels are initialised (`760469593227327` and `1742209750300193`), use the multi-pixel form once per event instead of looping with the wrong verb:

- `fbq('trackSingle', '<id>', '<event>', params)` for standard events
- `fbq('trackSingleCustom', '<id>', '<event>', params)` for custom events

Same guard/try-catch wrapper and the same Purchase-once dedupe stay as they are.

## 2. Add the base PageView to the snippet

The snippet in `index.html` calls `fbq('init', ...)` twice but never `fbq('track', 'PageView')`. The app fires PageView from the router, which works for real visitors but happens after React boots. Meta's crawler and some blockers see nothing. Add a plain `fbq('track', 'PageView')` right after the inits, and make the router's first page view not double-fire (skip the initial route, fire only on subsequent navigations).

## 3. Why Meta still says "not detected"

- Meta's checker crawls the **published** URL, not the Lovable preview. Frontend changes only go live after you press Publish/Update. If the pixel was added but not republished, the live site still has the old HTML.
- The URL you enter in Events Manager must be the domain that actually serves the site — the published one (`abaya-ly.lovable.app`) or your custom domain. `index.html` currently declares `https://nadine.luxor.ly/` as canonical/og:url; if you tested that domain and it isn't serving this build, the checker sees nothing.
- Meta's automated crawler is frequently blocked/unreliable. The reliable check is **Events Manager → Test Events**: open your live site with the test-events browser and watch events arrive.

## Verification after the fix

Run the live page in a headless browser, intercept requests to `facebook.com/tr`, and confirm one PageView per pixel ID on load and a correctly named `ViewContent` on a product page — reported back with the captured URLs.

## Files touched

- `src/lib/meta-pixel.ts` — switch to `trackSingle` / `trackSingleCustom`
- `index.html` — add base `fbq('track','PageView')`
- `src/lib/analytics.ts` — avoid duplicate initial PageView
