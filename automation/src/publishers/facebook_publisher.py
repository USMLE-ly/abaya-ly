import os

from uploaders.facebook_uploader import FacebookUploader
from .base_publisher import BasePublisher


class FacebookPublisher(BasePublisher):
    """Publish videos to Facebook using the browser-use vision uploader.

    Overrides run() because this backend is browser-use on the anti-detect
    Chromium host (CDP) — no Selenium/Firefox driver is involved.
    """

    PLATFORM_NAME = "facebook"
    HOME_URL = "https://www.facebook.com/"

    def __init__(self, headless: bool = True, page_url: str = ""):
        super().__init__(headless)
        self.page_url = page_url

    def publish(self, video_path: str, caption: str) -> bool:
        """Concrete BasePublisher.publish; run() does the work."""
        return self.run(video_path, caption)

    def run(self, video_path: str, caption: str, product_url: str | None = None, dry_run: bool = False) -> bool:
        print(f"  [{self.PLATFORM_NAME}] Starting publish (browser-use)...")
        try:
            if not os.path.exists(video_path):
                print(f"  [!] Video not found: {video_path}")
                return False
            uploader = FacebookUploader(headless=self.headless, page_url=self.page_url)
            return uploader.publish(video_path, caption, dry_run=dry_run)
        except Exception as e:
            print(f"  [✗] {self.PLATFORM_NAME} error: {e}")
            return False
