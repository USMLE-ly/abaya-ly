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
        if uploader.publish(video_path, caption):
            return True

        # Vision fallback: the fixed selectors failed (Facebook UI drift).
        # Let the LLM see the page and finish the post with the same cookies.
        print("  [!] facebook selectors failed — trying vision fallback")
        try:
            from cookie_manager import load_cookies
            from vision_agent import vision_agent_run

            cookies = load_cookies(self.PLATFORM_NAME)
            task = (
                f"You are on Facebook, logged in. Create a video post:\n"
                f"1. If the photo/video composer is not open, click 'Photo/video' "
                f"(or the equivalent button) to open it.\n"
                f"2. Attach the video file at: {os.path.abspath(video_path)}\n"
                f"3. Wait for the video to finish uploading (see the preview).\n"
                f"4. Type this exact caption into the caption box (the text area "
                f"that says something like 'Say something about this video'):\n"
                f"{caption[:2000]}\n"
                f"5. Click the Post button (not 'Save draft').\n"
                f"6. Confirm the post was created.\n"
                f"If you see a Facebook login screen instead of the logged-in feed, "
                f"stop and report FB_LOGIN_FAILED.\n"
                f"On the very last line report exactly: FB_POSTED_OK or FB_POST_FAILED, "
                f"plus one short sentence."
            )
            result = vision_agent_run(
                task,
                cookies=cookies,
                max_steps=50,
                headless=self.headless,
                allowed_domains=["*.facebook.com", "facebook.com"],
                timeout_sec=1200,
                available_file_paths=[os.path.abspath(video_path)],
            )
            ok = "FB_POSTED_OK" in result and "FB_POST_FAILED" not in result
            print(f"  [{'✓' if ok else '✗'}] facebook vision fallback "
                  f"{'posted successfully' if ok else 'failed'}")
            print(f"  [vision] {result[:400]}")
            return ok
        except Exception as e:
            print(f"  [✗] facebook vision fallback error: {e}")
            return False
