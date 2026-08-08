# 👗 Nadine Social Media Auto-Poster

Cookie-based auto-posting of outfit videos to **TikTok, Instagram, Twitter/X, Facebook, and Snapchat**.
No platform APIs are used — auth comes from session cookies you export and upload.

**The video file is never touched.** No re-encoding, no watermarking, no format conversion.
If a platform rejects the file, the tool reports the error and leaves the video untouched.

## Caption workflow (chat-system driven)

Captions are written in the **Alex Hormozi style** and humanized **in-session** — no
external LLM or API is used:

1. The chat system drafts the caption using the **Alex Hormozi skill**
   (`~/.agents/skills/alex-hermosi/`), built from the author's book via
   **book-to-skill** (`~/.agents/skills/book-to-skill/`).
2. The draft is run through the **humanizer skill** (`~/.agents/skills/humanizer/`)
   to remove AI-isms while keeping the Hormozi voice, Arabic, emoji, the product
   URL, and hashtags intact.
3. You approve the humanized caption, then the pipeline posts it with cookies.

The template engine in `src/hormozi_templates.py` is kept in sync with the book's
frameworks, so even fully automatic captions follow the same style.

## Caption format (auto-generated)

Every caption is built from the Hormozi frameworks in the books (Value
Equation, hooks, offer stacking) using only real product data — no invented
prices, fabrics, or claims. Structure, in Arabic with emojis:

```
<💃 hook line with emoji>          ← product-aware hook (collection/fabric/model)
✨ <bullet 1 — dream outcome + status>
💎 <bullet 2 — proof: real fabric + collection + manual inspection>
👗 <bullet 3 — fit/exclusivity + الدفع عند الاستلام>
الرابط في البايو 👇🏻              ← Instagram/TikTok only
https://nadine.luxor.ly/product/<id>   ← Twitter/X, Facebook, Snapchat
#نادين ... #Nadine ...
```

Per-platform behavior:
- **Instagram / TikTok**: caption URL is replaced by `الرابط في البايو 👇🏻`;
  the real link is added as a **comment** on the post and attempted as a link
  sticker on the video (account-eligible).
- **Twitter/X, Facebook, Snapchat**: the full URL stays in the caption (auto-links).
- Twitter: 275-char version (hashtags dropped first); Snapchat: hook + URL only.
- The URL is never truncated by trimming — only hashtags/bullets are dropped.

## 5-caption mode (same dress, 30s apart)

Menu option **5** generates **5 distinct Hormozi captions** for the same dress
(different hook + dream-outcome phrasing each) and pushes them in sequence —
5 posts per platform, **30 seconds between pushes**. All 5 are shown for
approval (`y` / `n` / `edit<number>`) before anything is posted.

You approve or edit the caption(s) before anything is posted (`y` / `n` / `edit`).

## Setup

```bash
cd automation
python3.12 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt   # includes selenium, webdriver-manager, instagrapi
```

Requires **Firefox** (geckodriver is auto-installed via `webdriver-manager`).

## Cookies (you upload these — no APIs)

1. Install a cookie-export extension in your browser: **Cookie-Editor** (works with the format we read).
2. Log into each platform in that browser.
3. Export cookies as JSON and save as:
   - `automation/cookies/tiktok.json`
   - `automation/cookies/instagram.json`
   - `automation/cookies/twitter.json`
   - `automation/cookies/facebook.json`
4. For Instagram, only the `sessionid` cookie is required (instagrapi path). For the others, export the full session.

Cookie files are git-ignored and never leave your machine.

## Videos

Drop the prepared MP4 files into `automation/content/` — they are uploaded exactly as-is.

## Usage

```bash
cd automation
source venv/bin/activate
python src/main.py
```

Menu:
1. **Post a video now** — pick product → pick video → approve caption → publishes to enabled platforms with human-like delays.
2. **List products**
3. **Check cookies status**
4. **Check post history**

## Platform notes

| Platform | Method | Notes |
|---|---|---|
| Instagram | `instagrapi` (sessionid cookie) | Most reliable; falls back to Selenium web upload |
| TikTok | browser-use vision agent (anti-detect chromium host, CPU rendering) | LLM sees the page and posts; falls back to the legacy Playwright uploader if it fails |
| Twitter/X | Selenium + cookies | Uses `auth_token`/`ct0` from your session |
| Facebook | Selenium + cookies | On selector failure, retries via the browser-use vision agent with the same cookies |
| Snapchat | Manual (caption file) | Tool writes `content/snapchat_caption.txt` + instructions for the mobile app |

> 🚫 **TikTok paused (warm-up).** The account was silently shadow-banned: all videos show 0 views
> and are hidden from the public profile (`itemList: []` in the profile API). Trigger: the same video
> file uploaded 4–6 times within hours from automated web uploads on a brand-new account — TikTok's
> spam/unoriginal-content moderation suppressed everything. TikTok posting is disabled in `config.json`
> (`platforms.tiktok.enabled: false`, `paused_reason` explains why).
>
> **Once-per-video rule (TikTok):** the automation never re-uploads the same video file to TikTok —
> `has_posted()` checks `logs/posts.json` and skips duplicates in `post_to_all` and in the publisher
> itself. Re-enable only after the account is warmed up (browse/follow/like on the app for 5–7 days,
> no posting), then post at most 1 distinct video/day. Never upload the same file twice.

> ⚠️ Social platforms change their web UIs frequently. The browser-use vision agent (`src/vision_agent.py`) adapts to DOM changes by letting MiMo 2.5 *see* the page and click/type the right element. The browser is the anti-detect chromium from `src/browser_host.py` (modern UA + masked `navigator.webdriver` + session cookies, software rendering via `--disable-gpu`) — platform cookies only restore a session when the browser isn't fingerprinted, so the agent drives that browser over CDP instead of launching its own Chromium.

## Safety

- Human-like random delays between platforms (config: `posting.platform_delay_min/max`).
- Posting windows from `config.json` (`time_windows`).
- Every attempt is logged in `automation/logs/posts.json`.
- Platforms with missing cookies are skipped cleanly — nothing crashes, and the order/checkout side of the website is completely untouched.
