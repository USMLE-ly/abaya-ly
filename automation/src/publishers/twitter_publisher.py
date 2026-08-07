import os

from uploaders.twitter_uploader import TwitterUploader
from .base_publisher import BasePublisher


class TwitterPublisher(BasePublisher):
    """Publish video tweets to X/Twitter using cookie-based automation."""

    PLATFORM_NAME = "twitter"
    HOME_URL = "https://x.com/"
    COMPOSE_URL = "https://x.com/compose/post"

    def publish(self, video_path: str, caption: str) -> bool:
        if not os.path.exists(video_path):
            print(f"  [!] Video not found: {video_path}")
            return False
        # run() (from BasePublisher) already created self.driver and loaded
        # cookies — reuse that browser instead of spawning a second one.
        uploader = TwitterUploader(headless=self.headless)
        uploader.driver = self.driver
        return uploader.publish(video_path, caption)
