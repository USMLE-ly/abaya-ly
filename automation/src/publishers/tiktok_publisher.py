import os
import re

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
            from cookie_manager import has_valid_cookies, load_cookies

            if not has_valid_cookies(self.PLATFORM_NAME):
                print(f"  [{self.PLATFORM_NAME}] Skipping — no valid cookies")
                return False

            uploader = TikTokUploader(
                cookies=load_cookies(self.PLATFORM_NAME),
                headless=self.headless,
            )
            link = product_url or self._product_url(caption)
            result = uploader.upload_video(
                video_path=video_path,
                caption=caption,
                visibility="everyone",
                num_retries=3,
                website_link=link,
                comment_link=link,
            )
            success = bool(result.get("success"))
            print(
                f"  [{'✓' if success else '✗'}] {self.PLATFORM_NAME} "
                f"{'posted successfully' if success else 'post failed'}"
            )
            return success
        except Exception as e:
            print(f"  [✗] {self.PLATFORM_NAME} error: {e}")
            return False
