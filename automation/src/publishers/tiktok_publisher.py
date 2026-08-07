import os
import re
import time

from uploaders.tiktok_uploader import TikTokUploader
from .base_publisher import BasePublisher


class TikTokPublisher(BasePublisher):
    """Publish videos to TikTok via the Playwright-based tiktok-uploader.

    Overrides run() because this backend uses Playwright (chromium), not the
    Selenium driver from BasePublisher — no need to spawn Firefox here.
    """

    PLATFORM_NAME = "tiktok"
    HOME_URL = "https://www.tiktok.com/"

    @staticmethod
    def _product_url(caption: str) -> str | None:
        m = re.search(r"https?://[^\s]+", caption)
        return m.group(0) if m else None

    def publish(self, video_path: str, caption: str, product_url: str | None = None) -> bool:
        """Concrete implementation required by BasePublisher; run() does the work."""
        return self.run(video_path, caption, product_url=product_url)

    def run(self, video_path: str, caption: str, product_url: str | None = None) -> bool:
        print(f"  [{self.PLATFORM_NAME}] Starting publish...")
        try:
            import json
            import subprocess
            import sys

            from cookie_manager import has_valid_cookies

            if not has_valid_cookies(self.PLATFORM_NAME):
                print(f"  [{self.PLATFORM_NAME}] Skipping — no valid cookies")
                return False

            link = product_url or self._product_url(caption)
            worker = os.path.join(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                "uploaders",
                "tiktok_worker.py",
            )
            last_error = "no output"
            for attempt in range(1, 3):
                try:
                    proc = subprocess.run(
                        [sys.executable, worker, video_path, caption, link or "", link or ""],
                        capture_output=True,
                        text=True,
                        timeout=45 * 60,
                    )
                    out = (proc.stdout or "").strip()
                    if out:
                        print(out[-1500:])
                        try:
                            with open("/tmp/tt_worker.log", "a", encoding="utf-8") as _lf:
                                _lf.write(f"\n===== attempt {attempt} =====\n" + out + "\n")
                        except Exception:
                            pass
                    try:
                        success = bool(json.loads((out.splitlines() or ["{}"])[-1]).get("success"))
                    except Exception:
                        success = False
                    if success:
                        print(f"  [✓] {self.PLATFORM_NAME} posted successfully")
                        return True
                    last_error = (proc.stderr or "").strip()[-500:] or "post failed"
                    print(
                        f"  [✗] {self.PLATFORM_NAME} attempt {attempt}/2 failed: {last_error}"
                    )
                except subprocess.TimeoutExpired:
                    last_error = "timeout after 45 min"
                    print(f"  [✗] {self.PLATFORM_NAME} attempt {attempt}/2 {last_error}")
                time.sleep(20 * attempt)
            print(f"  [✗] {self.PLATFORM_NAME} failed after 2 attempts")
            return False
        except Exception as e:
            print(f"  [✗] {self.PLATFORM_NAME} error: {e}")
            return False
