"""TikTok upload worker — runs in a fresh subprocess per attempt.

Primary backend: browser-use vision agent (MiMo sees the page and posts via the
anti-detect chromium host). The legacy tiktok-uploader (Playwright) path is the
fallback when the vision agent cannot complete the post. Both print a JSON
result as the last stdout line; the publisher parses it.
"""

import json
import os
import sys

SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, SRC)
# The script dir (src/uploaders) contains our local tiktok_uploader.py, which
# would shadow the installed tiktok_uploader package on sys.path. Remove it so
# `from tiktok_uploader import config` resolves to the real package when the
# legacy fallback needs it.
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR in sys.path:
    sys.path.remove(SCRIPT_DIR)

from uploaders.tiktok_uploader import TikTokUploader, TikTokUploaderVision
from cookie_manager import load_cookies


def main() -> int:
    video_path, caption, website_link, comment_link = sys.argv[1:5]

    # Primary: browser-use vision agent (anti-detect host, CPU rendering).
    cookies = load_cookies("tiktok")
    vision = TikTokUploaderVision(cookies=cookies, headless=True)
    result = vision.upload_video(
        video_path=video_path,
        caption=caption,
        visibility="everyone",
        num_retries=1,
        website_link=website_link or None,
        comment_link=comment_link or None,
    )
    if result.get("success"):
        print(json.dumps(result), flush=True)
        return 0

    print("  [!] vision upload failed — falling back to legacy Playwright path", flush=True)

    # Fallback: legacy tiktok-uploader (Playwright chromium), same cookies.
    from tiktok_uploader import config

    config.implicit_wait = 90
    uploader = TikTokUploader(cookies=cookies, headless=True)
    legacy = uploader.upload_video_legacy(
        video_path=video_path,
        caption=caption,
        visibility="everyone",
        num_retries=3,
        website_link=website_link or None,
        comment_link=comment_link or None,
    )
    print(json.dumps(legacy), flush=True)
    return 0 if legacy.get("success") else 1


if __name__ == "__main__":
    sys.exit(main())
