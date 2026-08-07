"""Snapchat publisher — automates Spotlight upload via my.snapchat.com.

Falls back to the manual caption file when the browser session can't upload
(no valid session / portal unavailable), so the post is never silently lost.
"""

import os
import time

from uploaders.snapchat_uploader import SnapchatUploader
from .base_publisher import BasePublisher


class SnapchatPublisher(BasePublisher):
    """Publish videos to Snapchat (Spotlight/Story) via the web portal."""

    PLATFORM_NAME = "snapchat"
    HOME_URL = "https://web.snapchat.com/"

    def _write_manual_caption(self, caption: str) -> None:
        content_dir = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
            "content",
        )
        os.makedirs(content_dir, exist_ok=True)
        out_path = os.path.join(content_dir, "snapchat_caption.txt")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(caption + "\n")
        print(f"  [Snapchat] Manual post required (no valid web session).")
        print(f"  [Snapchat] Caption ready → {out_path}")

    def publish(self, video_path: str, caption: str) -> bool:
        """Concrete implementation required by BasePublisher; run() does the work."""
        return self.run(video_path, caption)

    def run(self, video_path: str, caption: str) -> bool:
        print(f"  [{self.PLATFORM_NAME}] Starting publish...")
        try:
            from cookie_manager import has_valid_cookies, load_cookies

            if not has_valid_cookies(self.PLATFORM_NAME):
                print(f"  [{self.PLATFORM_NAME}] No cookies — manual fallback")
                self._write_manual_caption(caption)
                return False

            uploader = SnapchatUploader(headless=self.headless)
            uploader.driver = uploader._create_driver()
            try:
                if not uploader._load_cookies():
                    print(f"  [{self.PLATFORM_NAME}] Cookies unusable — manual fallback")
                    self._write_manual_caption(caption)
                    return False
                uploader.driver.refresh()
                time.sleep(2)
                success = uploader.publish(video_path, caption)
                if success:
                    print(f"  [✓] {self.PLATFORM_NAME} posted successfully")
                else:
                    print(f"  [✗] {self.PLATFORM_NAME} post failed — manual fallback")
                    self._write_manual_caption(caption)
                return success
            finally:
                if uploader.driver:
                    try:
                        uploader.driver.quit()
                    except Exception:
                        pass
        except Exception as e:
            print(f"  [✗] {self.PLATFORM_NAME} error: {e}")
            self._write_manual_caption(caption)
            return False
