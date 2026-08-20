import os
import re
import time

from .base_publisher import BasePublisher


def _build_ig_task(
    video_path: str,
    caption: str,
    dry_run: bool = False,
    page_url: str = "https://www.instagram.com/reels/upload/",
) -> str:
    """Prompt for the browser-use agent: publish the Reel on Instagram."""
    caption_for_task = caption[:2200]
    post_step = (
        "8. Click the Share button to publish the Reel.\n"
        "9. Wait for the post confirmation / the Reels feed to load.\n"
        "10. On the very last line report exactly: IG_POSTED_OK, plus one short sentence.\n"
    ) if not dry_run else (
        "8. STOP NOW — dry run. Do NOT click Share, do NOT publish anything.\n"
        "9. On the very last line report exactly: IG_DRY_RUN_READY, plus one short sentence.\n"
    )
    return f"""You are logged in to Instagram. Publish a Reel.

1. Go to {page_url}.
2. If you see the Instagram login screen instead of the upload page, reply with
   exactly IG_LOGIN_FAILED and stop.
3. Find the file input (input[type="file"]) and upload the video "{video_path}"
   (use the upload_file action with that exact path).
4. Wait for the video to process (spinner disappears).
5. Click Next through the upload flow until you reach the caption screen
   (usually 1-3 Next clicks; stop when a caption field appears).
6. Click the caption textarea (role="textbox") and type this exact caption, replace nothing:
{caption_for_task}
7. (Optional) Add a location if the screen asks — you can skip it.
{post_step}If you cannot complete a step, report IG_POST_FAILED with the reason on the last line.
"""


class InstagramPublisher(BasePublisher):
    """Publish Reels to Instagram — instagrapi primary, browser-use vision fallback."""

    PLATFORM_NAME = "instagram"
    HOME_URL = "https://www.instagram.com/"
    UPLOAD_URL = "https://www.instagram.com/reels/upload/"

    @staticmethod
    def _product_url(caption: str) -> str | None:
        m = re.search(r"https?://[^\s]+", caption)
        return m.group(0) if m else None

    def publish(self, video_path: str, caption: str, product_url: str | None = None,
                 trial: bool = False, location_name: str | None = None) -> bool:
        if not os.path.exists(video_path):
            print(f"  [!] Video not found: {video_path}")
            return False

        # Preferred path: instagrapi with the sessionid cookie (stable, no browser).
        from cookie_manager import load_cookies
        from uploaders.instagram_uploader import InstagramUploader

        sessionid = self._get_sessionid()
        uploader = InstagramUploader(sessionid=sessionid)
        if sessionid:
            try:
                link = product_url or self._product_url(caption)
                result = uploader.upload_reel(video_path, caption, link=link,
                                               trial=trial, location_name=location_name)
                print(f"  [✓] Instagram posted → {result['url']}")
                if link and result.get('link'):
                    print(f"  [✓] Reel link sticker attached")
                if link:
                    time.sleep(5)  # avoid posting the comment too fast
                    try:
                        uploader.comment(result["pk"], link)
                        print("  [✓] Instagram comment with link posted")
                    except Exception as ce:
                        print(f"  [!] Instagram comment failed ({ce})")
                return True
            except Exception as e:
                print(f"  [!] instagrapi failed ({e}) — falling back to vision agent")

        return self._publish_vision(video_path, caption)

    def run(self, video_path: str, caption: str, product_url: str | None = None,
             trial: bool = False, location_name: str | None = None) -> bool:
        """Run the publish flow. No browser is spawned for the instagrapi path;
        the vision fallback launches its own browser-use host if needed."""
        print(f"  [{self.PLATFORM_NAME}] Starting publish...")
        try:
            success = self.publish(video_path, caption, product_url=product_url,
                                   trial=trial, location_name=location_name)
            if success:
                print(f"  [✓] {self.PLATFORM_NAME} posted successfully")
            else:
                print(f"  [✗] {self.PLATFORM_NAME} post failed")
            return success
        except Exception as e:
            print(f"  [✗] {self.PLATFORM_NAME} error: {e}")
            return False

    def _get_sessionid(self) -> str | None:
        from cookie_manager import load_cookies
        from uploaders.cookies import extract_cookie
        return extract_cookie(load_cookies(self.PLATFORM_NAME), "sessionid")

    def _publish_vision(
        self,
        video_path: str,
        caption: str,
        product_url: str | None = None,
        dry_run: bool = False,
    ) -> bool:
        """browser-use vision fallback on the anti-detect Chromium host."""
        from vision_agent import vision_agent_run

        task = _build_ig_task(video_path, caption, dry_run=dry_run)
        result = vision_agent_run(
            task,
            platform=self.PLATFORM_NAME,
            max_steps=60,
            headless=self.headless,
            allowed_domains=["*.instagram.com", "instagram.com", "www.instagram.com"],
            timeout_sec=1500,
            available_file_paths=[os.path.abspath(video_path)],
        ) or ""
        detail = result[-400:] if result else "no agent output"
        print(f"  [instagram vision] {detail[:250]}")

        if dry_run:
            ok = "IG_DRY_RUN_READY" in result and "IG_LOGIN_FAILED" not in result
        else:
            ok = (
                "IG_POSTED_OK" in result
                and "IG_POST_FAILED" not in result
                and "IG_LOGIN_FAILED" not in result
            )
        print(f"  [{'✓' if ok else '✗'}] instagram vision "
              f"{'ready (dry run)' if dry_run else 'posted successfully' if ok else 'failed'}")
        return ok
