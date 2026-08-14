# 👗 Nadine Project — Full Handoff (2026-08-12)

> Read this first. This document is the master guide for continuing work on the
> **Nadine** project: a luxury dress e-commerce storefront (`nadine.luxor.ly`) plus
> a cookie-based social-media auto-poster that promotes it on TikTok, Instagram,
> Twitter/X, Facebook, and Snapchat.

---

## 1. Repo & how to continue in a new chat

- **Remote:** `https://github.com/USMLE-ly/abaya-ly.git` (branch `main`)
- **Last commit:** `0690220` — `fix(automation): robust posting verification + FB account chooser` (2026-08-09 19:51)
- **Working tree:** clean at handoff time.
- The remote URL embeds a GitHub personal-access token — do not print it in chat output, but it lets `git push` work without auth prompts.
- ⚠️ **A concurrent process commits to this repo during sessions.** Before every commit/push, run `git status` + `git log --oneline -5` and re-check `git pull` state. Your changes may land in HEAD while you work (this happened repeatedly).

### First commands in a fresh chat
```bash
git clone https://github.com/USMLE-ly/abaya-ly.git
cd abaya-ly
git log --oneline -20        # orient yourself
cat HANDOFF.md               # this file
git status                   # should be clean
```

---

## 2. Project at a glance

Two halves in one repo:

| Half | Tech | Location |
|---|---|---|
| **Storefront** (nadine.luxor.ly) | Vite + React 18 + TypeScript, Tailwind, shadcn-style UI, motion | repo root (`src/`, `api/`, `public/`) |
| **Automation** (social auto-poster) | Python 3.12, playwright, browser-use, instagrapi, Pillow | `automation/` |

Deployment: **Vercel** (Hobby plan). The site is a SPA with serverless API in a
**single** function (`api/[...route].mjs`) because Vercel Hobby caps functions at 12.

---

## 3. Storefront — what exists today

### Core pages (`src/pages/`)
- `Home.tsx` — Hormozi-style rewrite: hero, featured collections, best sellers,
  card-fan carousel, flip gallery, marquee, testimonials, FAQ, contact strip.
- `Product.tsx` — full product detail: color-family swatches (switch between
  same-dress-different-color pages), size guide, booking button, highlights,
  shipping estimate, stock, reviews, recently viewed, WhatsApp share.
- `Cart.tsx` / `CartDrawer.tsx` — cart with real coupon discount applied,
  shipping-fee preview, savings display. **No** "الشحن السريع" (fast shipping) notice.
- `TrackOrder.tsx` — order tracking by phone + order code (the "تتبع طلبكِ" page).
- `Collections.tsx`, `Wishlist.tsx`, `About.tsx`, `FAQ.tsx`, `Contact.tsx`,
  `ShippingPolicy.tsx`, `RefundPolicy.tsx`, `PrivacyPolicy.tsx`, `TermsOfService.tsx`,
  `NotFound.tsx`, `DesignSystem.tsx`.
- Key shared components: `AnnouncementBar`, `PromoCountdown`, `BookingModal`,
  `Header`, `Footer`, `CookieConsent`, `WhatsAppButton`, `StickyBookingBar`,
  `OptimizedImage`, `ProductCarousel`, `InstaStories`, `TickerMarquee`.

### Product data
- **Source of truth:** `src/data/products.ts` — 55 products, each with
  `id`, `name`, `price` (د.ل), `category`, `description`, `highlights`, `colors`,
  `images` (main + thumbs), `sizes`, `stock`.
- Build pipeline (`package.json` `prebuild`):
  `automation/export-products.ts` → `public/products.json`
  → `generate-sitemap.mjs` → `optimize-images.mjs` (creates `.webp` thumbnails)
  → `validate-products.ts` (55-product validator: unique models, tag length 15–25,
  forbids "شبك" in highlights, etc.).
- **Color families:** same dress in different colors share a swatch row on each
  product page. Clicking a swatch navigates to that color's own product page.
  Families were linked by a long series of commits (`Link <a> and <b> as color family`).
  Also: **all thumbnails were deleted from every product page — only the main image shows.**
- **MiMo 2.5 used extensively** to write/rewrite product details (Arabic color
  names, descriptions) from dress photos. Key: MiMo key + endpoint below.

### Checkout & booking
- `BookingModal` — "حجز الطلب" (book the order) flow; opens cart summary.
  Validates name/phone/city/notes via `src/lib/validateBooking.ts`.
  WhatsApp consent is a **customer-service note** (not a consent checkbox):
  "يوافق فريق خدمة العملاء بالتواصل معي عبر واتساب لإرسال أي معلومات تتعلق بطلبي" → later simplified.
- Fires Meta `InitiateCheckout` pixel on every booking modal open.
- On booking: creates order via `/api/order`, generates a **certificate**
  (PDF/preview, `src/components/certificate/`) with a serial (`certificate-serial.ts`),
  displays barcode (`lib/barcode.ts`).
- **Delivery fees** (`src/lib/delivery.ts`, mirrored in `api/_handlers/delivery-config.mjs`):
  91 cities with per-city flat fees; **free inside بنغازي only**; unlisted → default 30 د.ل.
- **Coupon:** `NADINE10` = 10% off, **valid 24h only** (expiry driven by
  `api/_handlers/promo-config.mjs` + `/api/promo`; `src/lib/promo.ts` caches 60s;
  `PromoCountdown` shows live countdown). Single configurable promo system.

### Announcement bar
- Was cutting off on the right on scroll (strawberry/`#` bar). Fixed to span full
  width and restick correctly; message shows `RefundPolicy` link + promo note.

### Admin dashboard
- URL: **`/dashboard-nadine-admin`** (`VITE_ADMIN_PATH` env, default
  `dashboard-nadine-admin`). Old `/admin` and `/admin/*` **301-redirect** here
  (see `vercel.json` redirects and `api/[...route].mjs` admin branch) — this fixed
  the persistent "الصفحة غير موجودة" 404.
- Login: password stored in `sessionStorage` (`nadine_admin_pw`); API calls send
  `x-admin-password` header. Server compares against `ADMIN_PASSWORD` env
  (`api/_handlers/shared.mjs` `isAdmin`).
- Pages (`src/admin/pages/`): `Login`, `Dashboard`, `Orders`, `OrderDetail`,
  `Products`, `Analytics`, `Settings`, `Stock`, `Reviews`, `Calendar`.
  Layout: `AdminLayout` + `Sidebar` + `Topbar`.
- **All admin data is real API data** — no mocks:
  - `GET /api/admin/orders` (list), `PATCH /api/admin/orders/:id` (status edit),
    `DELETE /api/admin/orders` (delete one or all with `confirm=CLEAR_ALL_ORDERS`),
    notes, products, settings, stock, reviews, analytics.
- Products admin can edit image/text (URL-based image storage; `.webp` thumbnails).

### API layer (`api/[...route].mjs`)
Single serverless function dispatching to `api/_handlers/*.mjs`:
`order`, `newsletter`, `contact`, `coupons`, `promo`, `analytics`, `debug-ec`,
`stock`, `catalog`, `track-order`, `reviews`, `update-status`, and the `admin-*` set.
- **Storage:** Edge Config (`EDGE_CONFIG`) primary, **Upstash Redis fallback**
  (`UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`) — env-driven via
  `api/_handlers/shared.mjs` `readItems`/`writeItems`. Add `?debug=1` on
  `track-order` to surface storage errors.
- CORS + rate limiting (`createRateLimiter`) in `shared.mjs`.

### Analytics / tracking
- Meta Pixel (`src/lib/meta-pixel.ts`) with `InitiateCheckout` on booking.
- `analytics.mjs` logs visits/events per page/product/day (Edge Config/Upstash).

---

## 4. Automation — social auto-poster (`automation/`)

### Concept
No platform APIs. **Session cookies you export (Cookie-Editor extension) and upload**
as `automation/cookies/<platform>.json` (git-ignored). The pipeline logs in by
restoring those cookies into an anti-detect headless Chromium.

### The caption workflow (approved, enforced)
1. **Alex Hormozi style** captions generated by `src/hormozi_templates.py`
   (built from $100M Offers / Leads / Money Models books converted to skills via
   book-to-skill → `~/.agents/skills/alex-hermosi/`).
2. **Humanized in-session** via `~/.agents/skills/humanizer/` — no external LLM for captions.
3. **Approval gate (hard rule):** nothing is pushed until the user approves the
   caption. `main.py` prints the caption and asks `✅ Approve? (y/n/edit)`.
   The user has explicitly demanded: **never push without review first.**

### Caption structure (Arabic, emoji, Hormozi value-equation)
```
<💃 hook line with emoji>          ← collection/fabric/model-aware hook
✨ <bullet 1 — dream outcome + status>
💎 <bullet 2 — proof: real fabric + collection + inspection>
👗 <bullet 3 — fit/exclusivity + الدفع عند الاستلام>
الرابط في البايو 👇🏻              ← Instagram/TikTok only
https://nadine.luxor.ly/product/<id>   ← Twitter/X, Facebook, Snapchat
#نادين ... #Nadine ...
```
- Per-platform adaptation via `adapt_caption(caption, platform)`:
  IG/TikTok → URL replaced with `الرابط في البايو 👇🏻` and the real link is posted
  as a **comment** (+ attempted link sticker); Twitter/FB/Snapchat keep the URL in text.
- **5-caption mode:** menu option 5 generates 5 distinct Hormozi captions for one
  dress and pushes them sequentially, **30s apart** (`VARIANT_POST_DELAY = 30`).

### Publishing paths per platform
| Platform | Method | Notes |
|---|---|---|
| Instagram | `instagrapi` (sessionid cookie) — `src/uploaders/instagram_uploader.py` | Most reliable; link sticker via `extra_data={"link": ...}`, falls back to no-link; link comment after 5s. Falls back to browser-use vision agent |
| TikTok | browser-use vision agent (`src/vision_agent.py`) on anti-detect chromium host | LLM (MiMo 2.5) *sees* the page, uploads the file, types caption; falls back to legacy Playwright uploader (`tiktok_uploader.py` / `tiktok_worker.py`) |
| Twitter/X | Playwright on anti-detect chromium host (CDP) — `src/uploaders/twitter_uploader.py` | Deterministic controller; 275-char caption (hashtags dropped first) |
| Facebook | Playwright on chromium host (CDP) — `src/uploaders/facebook_uploader.py` | Deterministic controller, RTL/emoji-safe; account chooser; vision fallback |
| Snapchat | Playwright chromium (CDP) — `snapchat_uploader.py` | OTP-blocked sessions need `src/snapchat_otp_login.py` once; otherwise writes `content/snapchat_caption.txt` for manual posting |

### Anti-detect browser (`src/browser_host.py`)
- Headless Chromium launched with: modern UA, `navigator.webdriver` masked,
  session cookies restored, CPU-only software rendering (`--disable-gpu`,
  SwiftShader), CDP port exposed. browser-use's Agent attaches **over CDP**
  instead of launching its own (fingerprinted) Chromium.
- **Why:** platform cookies only restore a session when the browser isn't
  fingerprinted; the plain browser-use Chromium got logged out, Playwright
  full Chromium + UA + webdriver-mask + `add_cookies` stayed logged in.

### Vision agent (`src/vision_agent.py`)
- browser-use Agent + **MiMo 2.5** (OpenAI-compatible) driving the browser over CDP.
- **MiMo key:** `MIMO_API_KEY` env override; default hardcoded fallback
  `sk-soyioi...` (key rotated before; if it stops working, ask the user for a new one).
  Base URL `https://api.xiaomimimo.com/v1`, model `mimo-v2.5`.
- `MiMoChatOpenAI` repairs JSON (MiMo emits stray `screenshot` fields and mangles
  `response_format`) — skip `response_format`, strip markdown fences, balanced-JSON finder.

### Scheduler & safety (`src/scheduler.py`, `src/main.py`)
- `post_to_all(video, caption, product, skip_platforms=...)` — enables resume.
- Human-like random delays between platforms (`platform_delay_min/max` in config).
- Posting windows (09–11, 14–16, 19–22 local).
- Every attempt logged in `automation/logs/posts.json` (never raises on log failure).
- **TikTok once-per-video rule:** `platforms.tiktok.once_per_video` gates duplicate
  uploads (duplicates caused the shadow-ban / 0-views). The 5×-campaign sets it `false`.
- Menu: 1 post now · 2 list products · 3 cookie status · 4 post history · 5 five captions.

### Config (`automation/config.json`)
Brand (website), hashtags (ar + en), posting windows/delays, platforms enable +
cookies_file paths, humanizer/book-to-skill skill paths.

### Videos (`automation/content/`)
Uploaded as-is, never re-encoded by the poster. Current files:
`VN20260804_180526.mp4` (3.86s), `VN20260806_030509.mp4` (7.73s),
`VN20260809_045948.mp4` (4.70s), `VN20260809_170511.mp4` (6.53s),
`VN20260812_113518.mp4` (46.75s — 3-dress video), `VN20260812_134135.mp4` (5.87s),
`1c748396-2523-45c3-9e9c-268326aa67f5.mp4` (9.51s). All 1080×1920 + aac audio except the 1c74 (720×1280).

### Posting history
115 entries in `logs/posts.json`; recent pushes: Instagram 5× campaigns on
`rouge-burgundy-draped-bow-midi` (12:14–12:19) and `rouge-burgundy-polka-vneck`
(13:48–13:52) all success. Facebook had a false-positive bug (fixed in `0690220`):
success was detected by substring "success" matching the JSON `"success": false`;
now uses explicit markers. TikTok zero-view investigation concluded: warm-up pause
+ once-per-video rule; new account/verification still TBD.

---

## 5. Recent work timeline (commits → what each did)

- Storefront Hormozi copy rewrite (`a6cc5ad`) — Home, Cart, Product, FAQ, policies.
- Checkout: booking validation, certificate PDF/preview, e2e tests + CI (`1ddc7d3`).
- Meta Pixel + InitiateCheckout (`41eea58`, `d468d23`).
- Upstash Redis storage backend with Edge Config fallback + debug (`22035fc`…`c99843b`).
- Per-city delivery (91 cities, Benghazi free) (`9850796`, `673dc3d`).
- NADINE10 24h coupon + countdown + white-screen fix (hook-order bug #310) (`6381db2`…`751ac74`).
- Cart fixes: remove fast-shipping notice, real coupon discount (`6331f5a`).
- Admin: real API everywhere, orders CRUD, product image/text editing (`src/admin/*`).
- Color-family swatch linking (~15 commits), swatch scaling 1.5×→3×, selection ring.
- All thumbnails removed from product pages (main image only).
- Social auto-poster from scratch (`fa9402f`) → link-in-bio captions + link comments
  (`34119cd`, `4734a74`) → 5 Hormozi variants 30s apart (`7ed1aeb`) → anti-detect
  chromium host + browser-use vision agent (`96956ed`) → TikTok warm-up pause +
  once-per-video (`e2e41e3`) → FB dry-run mode (`ed3c9db`) → browser-use replacing
  Selenium/Firefox (`fa4c908`) → robust verification + FB account chooser (`0690220`).

---

## 6. ⏳ PENDING — the approved "viral-ready" plan (implement next)

User approved this plan (said "Implement") and it is **not yet implemented** —
it was paused to write this handoff. **Start the next chat by implementing this.**

### Goal
Make Instagram Reels "viral-ready": burn the hook text (first 3s) onto videos and
flag long videos, per this viral guide (text color in first 3s, 5–7s length,
trending audio is manual).

### Locked decisions
- **Edit level:** Overlay + flag — burn hook text as a lower-third subtitle; long
  videos are flagged, **never auto-trimmed**.
- **Scope:** future posts only — existing videos untouched.
- **Hook source:** first non-emoji line of the approved caption
  (e.g. `من مجموعة Rouge Héritage — قطعة وحدة تخلّي كل العيون عليكِ` after stripping `👗`).

### Implementation steps (build exactly this)
1. **New `automation/src/viral_ready.py`**
   - `qc_video(path) -> dict`: duration/resolution/aspect/audio verdicts — ideal ≤7s,
     warn 8–10s, flag >10s; require audio + 9:16.
   - `burn_hook_overlay(video, hook_text, out_path)`: temp `.ass` subtitle
     (white bold text, black outline, lower-third, fade in 0.2–1.2s, out 2.6–3.0s),
     `ffmpeg -vf subtitles=...`. Strip leading emoji/whitespace. **Never blocks
     posting** — return the original on any failure.
   - `ensure_viral(video, hook_text, work_dir) -> (out_path, report)`:
     QC + overlay into a temp file; the original is never modified.
2. **Config:** `automation/config.json` →
   `platforms.instagram.viral: {enabled: true, max_duration_flag: 10, text_seconds: 3, font: "FreeSans"}`
   (off if absent).
3. **Wire into `InstagramPublisher`** (`automation/src/publishers/instagram_publisher.py`)
   + the standalone `ig_*` posting scripts: QC first (print report), burn overlay,
   post the overlaid temp with the same caption/link-sticker/comment flow.
4. **README:** viral checklist + what stays manual (choosing trending audio in-app;
   re-cutting long videos).
5. **Tests:** QC parse on all existing videos; overlay on `VN20260812_134135.mp4`
   (5.87s) verifying duration+audio preserved and t=1s frame differs; Arabic
   rendering check (extract t=1s frame and view); failure modes (no audio →
   warn+post, empty hook → skip, ffmpeg error → original posted); integration dry-run.
   **Final live post requires user approval of a preview frame.**

### Environment facts for the implementation (already verified)
- CWD: `/root/Documents/Codex/2026-07-26/abaya-ly`; venv: `automation/venv/bin/python`.
- `apply_patch` NOT on PATH — edit files via Python string-replace or `cat > file`.
- `ffmpeg` not on PATH — use `imageio_ffmpeg.get_ffmpeg_exe()` from the venv
  (static build `.../imageio_ffmpeg/binaries/ffmpeg-linux-aarch64-v7.0.2`).
- Build has **NO `drawtext`** but has **`subtitles` + libass + fribidi** → `.ass`
  burn-in gives Arabic shaping.
- `pillow` 12.2.0 available (preview frames); no `mutagen`/`opencv`; moviepy 2.2.1
  installed (no `moviepy.editor`).
- Arabic font: `FreeSans` (+ Bold) at `/usr/share/fonts/truetype/freefont/`.
  No Noto Naskh/Kufi; `NotoColorEmoji.ttf` is emoji-only.

---

## 7. Other known follow-ups / investigations (from recent sessions)

1. **TikTok 0-views root cause** — user asked to investigate why TikTok posts get
   zero views while Instagram gets engagement. Partial findings: duplicate uploads
   triggered a shadow-ban → once-per-video rule + warm-up pause. Next: verify the
   account state (fresh video, trending audio, no watermark), possibly re-login.
2. **Facebook uploader** — vision fallback had login-screen false positives; fixed
   verification, but the browser-use vision path for FB is still best-effort.
3. **Snapchat OTP** — login blocked by OTP; use `src/snapchat_otp_login.py` with a
   number the user provides, or keep manual caption file fallback.
4. **browser-use alternatives** — user explored donutbrowser / browser-use /
   Skyvern / AutoGPT / clicky; decided the current anti-detect chromium host is the
   working path. Keep it unless it breaks.
5. **Product-page work may resume** — MiMo-based product additions/rewrites,
   color-circle families, URL renames with legacy redirects (no redirect mechanism
   yet for renamed product URLs — old links 404).

---

## 8. How to run everything

### Storefront
```bash
npm install
npm run dev                 # Vite dev (bind 127.0.0.1 for local browser tests)
npm run build               # tsc -b && vite build (prebuild exports products)
npm run validate            # product validator
npm run test:e2e            # Playwright e2e (tests/ + playwright.config.ts)
```

### Automation
```bash
cd automation
source venv/bin/activate
python src/main.py          # interactive menu (1 post · 5 five-caption mode)
python run_post.py          # non-interactive: posts the hardcoded approved caption
```
Scripts used for one-off pushes (Instagram-focused) also live in `automation/`.

### Env vars (Vercel + local)
- `EDGE_CONFIG` — Edge Config URL (primary storage)
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — Upstash Redis fallback
- `VITE_ADMIN_PATH` — admin path segment (`dashboard-nadine-admin`)
- `ADMIN_PASSWORD` — server-side admin password checked by `isAdmin`
- `MIMO_API_KEY` — MiMo 2.5 key (automation; env override)
- `META_PIXEL_ID` — comma-separated Meta pixel IDs for CAPI (e.g. `760469593227327,1742209750300193`)
- `META_CAPI_ACCESS_TOKEN` — Meta Conversions API token (manage_pixel / ads_management)
- `VITE_META_DEBUG=1` — build flag that enables Meta event console logging by default
- `GITHUB_TOKEN` is embedded in the git remote URL (do not echo)

---

## 9. Critical rules & gotchas (do not violate)

1. **Approval gate:** never post to any platform until the user reviews/approves the
   caption(s) — hard rule, demanded explicitly.
2. **Never commit** `automation/cookies/*.json`, `automation/content/*.mp4`,
   `automation/logs/*.json` (all git-ignored). Keep it that way.
3. **Concurrent process commits** to this repo during sessions — re-check git state
   before pushing; don't fight it, just verify.
4. **Vercel Hobby 12-function cap** — add new API endpoints as handlers inside
   `api/_handlers/` dispatched from `api/[...route].mjs`, never as separate functions.
5. **Product data single source:** edit `src/data/products.ts`, then run the build
   pipeline (or `export-products.ts` + `validate-products.ts`) to refresh
   `public/products.json` + sitemap + images.
6. **No mock/static data in admin** — everything must hit the real API.
7. **MiMo ≠ OpenAI:** don't rely on strict JSON-schema; use the JSON repair in
   `vision_agent.py`. MiMo key rotates — if it dies, ask the user for a new one.
8. **ffmpeg** must come from `imageio_ffmpeg` (static build) — no system ffmpeg, no drawtext.
9. Don't add tests to areas that have none; keep changes minimal and consistent.
10. The user communicates in Arabic/English mix and often says "continue" — keep
    momentum, verify with screenshots/builds, and never guess product data from images
    without MiMo (or the user's) confirmation.

---

## 10. Suggested first actions for the next chat

1. `git pull` + `git log --oneline -3` + read `HANDOFF.md`.
2. Implement the approved **viral-ready plan** (section 6) — start with
   `automation/src/viral_ready.py`, then config, wiring, README, tests.
3. Show the user a t=1s preview frame of the overlay and get approval before any live post.
4. Then continue from section 7 follow-ups (TikTok views, FB uploader, Snapchat OTP)
   as the user directs.

---

## 10. Meta Pixel reliability — CAPI, catalog feed & QA (added 2026-08-14)

### Client pixel → Conversions API (server-side) with dedup
- `src/lib/meta-pixel.ts` now fires every standard event to **all pixels** and
  mirrors the same event to **`POST /api/meta/capi`** with the **same `event_id`**
  (`eventID` param on the browser side), so Meta deduplicates browser + server hits.
- Handler: `api/_handlers/meta-capi.mjs` (dispatched from `api/[...route].mjs`).
  - Whitelists standard events, hashes `user_data` (ph/em/fn/ln) with SHA-256
    server-side, adds `client_ip_address` + `client_user_agent` automatically.
  - **Dedup:** every `event_id` is stored for 48h (Edge Config/Upstash); repeats
    are answered `{ deduplicated: true }` without re-sending to Meta.
  - `GET /api/meta/capi` returns config status for the QA page.
- Purchase (`BookingModal`) sends `ph`; Contact form sends `ph` + `fn` for Lead
  matching. `trackPurchase` / `trackLead` / `trackNewsletter` accept `userData`.
- **Required Vercel env vars:** `META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`.
  Token must have `manage_pixel`/`ads_management` on the pixel(s). Until set, the
  handler answers `{ skipped: true }` and logs a warning — the site keeps working.

### Meta product catalog feed (dynamic product ads)
- Generator: `automation/generate-feed.mjs` → `public/products-feed.xml`
  (runs in `prebuild` after `generate-sitemap.mjs`).
- Feed URL: **`https://nadine.luxor.ly/products-feed.xml`** — add this in
  Business Manager → Catalog → Data sources → Meta Pixel/URL (or manual upload).
- `<g:id>` values equal storefront product IDs, so `ViewContent`/`Purchase`
  `content_ids` match feed items automatically.
- Meta requires `LYD` as the catalog currency; prices are `NNN.NN LYD`.

### Debug mode + QA page
- Enable logging: `?meta_debug=1` on any URL, `VITE_META_DEBUG=1` build flag, or
  toggle from the QA page. Logs every event to console with its payload.
- QA page: **`/meta-debug`** — live event list (pixel + CAPI), event IDs, JSON
  payloads, copy-JSON button, CAPI config status, and a **“Fire test events”**
  button (ViewContent + Lead + Purchase).
- Every event is buffered in `window.__META_EVENTS__` (cap 200) and a
  `meta-debug-event` window event fires on each record.
- E2E coverage: `tests/meta-pixel.spec.ts` (runs in CI against the preview build).

### How to verify (Meta Events Manager)
1. Events Manager → your pixel → **Test Events** → open
   `https://nadine.luxor.ly/?meta_debug=1` and confirm PageView/ViewContent appear
   for **both** pixels.
2. Live test purchase: use the QA page’s “Fire test events” (or place a real
   order). The `Purchase` event should appear once in Events Manager — the same
   `event_id` dedupes the pixel + CAPI copy.
3. In Events Manager → “Server events”, confirm CAPI shows `events_received: 1`
   per sent event (no duplicates).
4. Catalog: Business Manager → Catalog → Items → “Add items via URL” →
   `https://nadine.luxor.ly/products-feed.xml`, then check items load and map to
   product IDs.
