import os

from uploaders.facebook_uploader import FacebookUploader
from .base_publisher import BasePublisher


class FacebookPublisher(BasePublisher):
    """Publish videos to Facebook Pages using cookie-based automation."""

    PLATFORM_NAME = "facebook"
    HOME_URL = "https://www.facebook.com/"

    def __init__(self, headless: bool = True, page_url: str = ""):
        super().__init__(headless)
        self.page_url = page_url

    def publish(self, video_path: str, caption: str) -> bool:
        if not os.path.exists(video_path):
            print(f"  [!] Video not found: {video_path}")
            return False
        # run() (from BasePublisher) already created self.driver and loaded
        # cookies — reuse that browser instead of spawning a second one.
        uploader = FacebookUploader(headless=self.headless, page_url=self.page_url)
        uploader.driver = self.driver
        return uploader.publish(video_path, caption)
