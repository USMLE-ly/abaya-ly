import os

from uploaders.twitter_uploader import TwitterUploader
from .base_publisher import BasePublisher


class TwitterPublisher(BasePublisher):
    """Publish video tweets to X/Twitter using the browser-use uploader.

    Overrides run() because this backend is Playwright on the anti-detect
    Chromium host (CDP) + browser-use vision fallback — no Selenium/Firefox.
    """

    PLATFORM_NAME = "twitter"
    HOME_URL = "https://x.com/"
    COMPOSE_URL = "https://x.com/compose/post"

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
            uploader = TwitterUploader(headless=self.headless, page_url=self.page_url)
            return uploader.publish(video_path, caption, dry_run=dry_run)
        except Exception as e:
            print(f"  [✗] {self.PLATFORM_NAME} error: {e}")
            return False
