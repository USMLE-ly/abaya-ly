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


Every post gets this exact structure, in Arabic with emojis:

```
🔥 <hook line with emoji>

✨ <bullet 1 — feature>
💎 <bullet 2 — fabric/detail>
👗 <bullet 3 — fit/occasion>

🔗 https://nadine.luxor.ly/product/<product-id>

#نادين #عبايات_فاخرة ... #Nadine #TopDress ...
```

- Hook: Alex Hormozi–style Arabic hooks (curiosity/desire triggers).
- Bullets: taken from the product's real highlights in `products.json`.
- URL: the live product page.
- Hashtags: brand Arabic + English hashtags, plus up to 6 product tags.
- Per-platform adaptation: Twitter gets a 275-char version (hashtags dropped first); Snapchat gets just the hook + URL.

You approve or edit the caption before anything is posted (`y` / `n` / `edit`).

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
| TikTok | Selenium + cookies | Most anti-bot-strict; first live run may need selector tuning |
| Twitter/X | Selenium + cookies | Uses `auth_token`/`ct0` from your session |
| Facebook | Selenium + cookies | Posts to the account that owns the cookies |
| Snapchat | Manual (caption file) | No web upload path exists; tool writes `content/snapchat_caption.txt` + instructions for the mobile app |

> ⚠️ Social platforms change their web UIs frequently. The Selenium flows are best-effort and marked with `TODO(live)` — expect to fine-tune selectors on the first real run against your accounts.

## Safety

- Human-like random delays between platforms (config: `posting.platform_delay_min/max`).
- Posting windows from `config.json` (`time_windows`).
- Every attempt is logged in `automation/logs/posts.json`.
- Platforms with missing cookies are skipped cleanly — nothing crashes, and the order/checkout side of the website is completely untouched.
