"""
Instagram Trial Reels — 100 posts, Libya location, Hormozi captions.

Setup:
  1. automation/cookies/instagram_new.json  (Cookie-Editor export)
  2. automation/content/video.mp4           (your reel)
  3. Run:  python automation/trial_post_100.py
"""
import os
import sys
import time
import json

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ROOT, "src"))

from caption_generator import generate_structured_caption_variants, adapt_caption
from uploaders.instagram_uploader import InstagramUploader

# ══════════════════════════════════════════════════════════════
# CONFIG — edit these before running
# ══════════════════════════════════════════════════════════════
COOKIE_FILE  = os.path.join(ROOT, "cookies", "instagram_new.json")
VIDEO_DIR    = os.path.join(ROOT, "content")
PRODUCT_ID   = ""       # ← paste the product id here (e.g. "noir-black-polka-halter-midi")
TOTAL_POSTS  = 100
DELAY_SEC    = 35       # seconds between each post
LOCATION     = "Libya"
SITE_URL     = "https://nadine.luxor.ly"
# ══════════════════════════════════════════════════════════════


def load_sessionid(path: str) -> str | None:
    if not os.path.exists(path):
        return None
    with open(path) as f:
        for c in json.load(f):
            if c.get("name") == "sessionid":
                return c.get("value")
    return None


def pick_video() -> str:
    files = sorted(
        f for f in os.listdir(VIDEO_DIR)
        if f.lower().endswith((".mp4", ".mov", ".avi"))
    ) if os.path.isdir(VIDEO_DIR) else []
    if not files:
        sys.exit(f"❌ No video in {VIDEO_DIR}")
    path = os.path.join(VIDEO_DIR, files[0])
    print(f"📹 {files[0]} ({os.path.getsize(path)/1e6:.1f} MB)")
    return path


def load_product(pid: str) -> dict:
    from caption_generator import find_product_by_id
    p = find_product_by_id(pid)
    if not p:
        sys.exit(f"❌ Product '{pid}' not found")
    print(f"👗 {p.get('name', pid)}")
    return p


def generate_captions(product: dict, n: int) -> list[str]:
    """Generate n adapted captions (cycle through variant batches)."""
    out = []
    while len(out) < n:
        batch = generate_structured_caption_variants(product, n=min(20, n - len(out)))
        out.extend(adapt_caption(c, "instagram") for c in batch)
        if len(batch) < 20:
            break
    return out[:n]


def main():
    # ── Validate inputs ──
    sessionid = load_sessionid(COOKIE_FILE)
    if not sessionid:
        sys.exit(f"❌ Cookie not found: {COOKIE_FILE}")
    print(f"✅ Cookie loaded (...{sessionid[-8:]})")

    video = pick_video()
    product = load_product(PRODUCT_ID)
    captions = generate_captions(product, TOTAL_POSTS)
    print(f"📝 {len(captions)} captions ready")

    # ── Preview first 3 ──
    for i, c in enumerate(captions[:3], 1):
        print(f"\n--- preview {i} ---\n{c}")
    print(f"\n--- ...{len(captions)} total ---\n")

    # ── Confirm ──
    input("Press ENTER to start posting (Ctrl+C to abort)… ")

    # ── Init uploader ──
    uploader = InstagramUploader(sessionid=sessionid)
    info = uploader.account_info()
    print(f"🔑 Logged in as @{info['username']}\n")

    # ── Post loop ──
    ok = fail = 0
    log = []
    link = f"{SITE_URL}/product/{product['id']}"

    for i, caption in enumerate(captions, 1):
        ts = time.strftime("%H:%M:%S")
        print(f"[{ts}] {i}/{len(captions)}", end="  ")
        try:
            r = uploader.upload_reel(video, caption, link=link,
                                     trial=True, location_name=LOCATION)
            print(f"✅ {r['url']}")
            ok += 1
            log.append({"i": i, "pk": r["pk"], "ok": True})

            # comment with link
            time.sleep(5)
            try:
                uploader.comment(r["pk"], link)
            except Exception:
                pass

        except Exception as e:
            print(f"❌ {e}")
            fail += 1
            log.append({"i": i, "ok": False, "error": str(e)[:200]})

        if i < len(captions):
            time.sleep(DELAY_SEC)

    # ── Summary ──
    print(f"\n{'='*40}")
    print(f"✅ {ok} posted  ❌ {fail} failed")
    print(f"{'='*40}")

    log_path = os.path.join(ROOT, "logs", "trial_posts.json")
    os.makedirs(os.path.dirname(log_path), exist_ok=True)
    with open(log_path, "w") as f:
        json.dump({"product": product["id"], "ok": ok, "fail": fail,
                    "location": LOCATION, "trial": True, "log": log}, f, indent=2)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n👋 Stopped")
    except Exception as e:
        print(f"\n❌ {e}")
        import traceback; traceback.print_exc()
