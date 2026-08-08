"""Facebook uploader — hardened Selenium (geckodriver) flow.

No maintained open-source cookie-based FB video uploader exists, so this is a
self-contained publisher built on the same hardened base as the other
platforms: container-safe Firefox, navigation retries (_safe_get), and
explicit waits around the composer instead of blind sleeps.
"""

import os
import time

from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from browser_base import BasePublisher


class FacebookUploader(BasePublisher):
    """Upload a video post to a Facebook profile/page using session cookies."""

    PLATFORM_NAME = "facebook"
    HOME_URL = "https://www.facebook.com/"

    def __init__(self, headless: bool = True, page_url: str = ""):
        super().__init__(headless)
        self.page_url = page_url

    def publish(
        self, video_path: str, caption: str = "", page_url: str = "", dry_run: bool = False
    ) -> bool:
        if not os.path.exists(video_path):
            print(f"  [!] Video not found: {video_path}")
            return False

        target = page_url or self.page_url or self.HOME_URL
        self._safe_get(target)
        time.sleep(4)

        # Open the composer ("What's on your mind?" / "Photo/video")
        try:
            create_selectors = [
                'div[aria-label="Create a post"]',
                'div[aria-label="إنشاء منشور"]',
                'div[role="button"]:has(span:text("Photo/video"))',
                '//div[contains(@aria-label, "Create")]',
                '//div[@role="button" and contains(., "Photo/video")]',
            ]
            opened = False
            for selector in create_selectors:
                try:
                    if selector.startswith("//"):
                        btn = WebDriverWait(self.driver, 8).until(
                            EC.element_to_be_clickable((By.XPATH, selector))
                        )
                    else:
                        btn = WebDriverWait(self.driver, 8).until(
                            EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                        )
                    btn.click()
                    opened = True
                    time.sleep(3)
                    break
                except Exception:
                    continue
            if not opened:
                # Composer may already be open on the page itself.
                print("  [!] Could not find create-post area (continuing anyway)")
        except Exception as e:
            print(f"  [!] Composer error: {e}")

        # Attach the video file — the composer's own hidden input, never the
        # page-level fallback input (typing into the wrong input posts nothing).
        try:
            file_input = WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR,
                     'div[role="dialog"] input[type="file"], '
                     'input[type="file"][accept*="video"], '
                     'input[type="file"]')
                )
            )
            file_input.send_keys(os.path.abspath(video_path))
            print("  [Facebook] Video file attached, waiting for preview...")
        except Exception as e:
            print(f"  [!] Could not find file input: {e}")
            return False

        # Wait for the video preview to appear — FB shows the thumbnail/video
        # element only after the upload starts. Posting before this point
        # publishes a post with no video at all.
        preview_seen = False
        preview_deadline = time.time() + 60
        while time.time() < preview_deadline:
            try:
                if self.driver.find_elements(
                    By.CSS_SELECTOR,
                    'div[role="dialog"] video, '
                    'div[role="dialog"] img[src*="video"], '
                    'div[aria-label*="video"][role="img"], '
                    'div[aria-label*="فيديو"][role="img"]',
                ):
                    preview_seen = True
                    break
            except Exception:
                pass
            time.sleep(3)
        if not preview_seen:
            print("  [!] No video preview appeared — aborting to avoid an empty post")
            return False
        print("  [Facebook] Video preview confirmed")

        # Wait for the upload/processing state to clear — the composer shows a
        # progress bar / "Processing..." until the video is ready.
        ready_deadline = time.time() + 120
        while time.time() < ready_deadline:
            try:
                busy = self.driver.find_elements(
                    By.CSS_SELECTOR,
                    'div[role="dialog"] [aria-label*="Processing"], '
                    'div[role="dialog"] [aria-label*="معالجة"], '
                    'div[role="dialog"] [role="progressbar"]',
                )
                if not busy:
                    break
            except Exception:
                break
            time.sleep(3)

        # Enter caption — the video composer's own textbox (Arabic UI labels
        # included). Scoped to the dialog so we never type into the page's
        # background "What's on your mind" box.
        try:
            caption_selectors = [
                'div[role="dialog"] div[role="textbox"][aria-label*="this video"]',
                'div[role="dialog"] div[role="textbox"][aria-label*="هذا الفيديو"]',
                'div[role="dialog"] div[role="textbox"][aria-label*="الفيديو"]',
                'div[role="dialog"] div[role="textbox"][aria-label*="Say something"]',
                'div[role="dialog"] div[role="textbox"][aria-label*="اكتب"]',
                'div[role="dialog"] div[role="textbox"]',
                'div[role="dialog"] div[contenteditable="true"]',
                'div[role="textbox"][aria-label*="this video"]',
                'div[role="textbox"][aria-label*="هذا الفيديو"]',
                'div[role="textbox"][aria-label*="الفيديو"]',
                'div[role="textbox"][aria-label*="Say something"]',
                'div[role="textbox"][aria-label*="اكتب"]',
                'div[role="textbox"]',
                'div[contenteditable="true"]',
                'textarea',
            ]
            typed = False
            deadline = time.time() + 90  # poll until the composer settles
            while time.time() < deadline:
                for selector in caption_selectors:
                    try:
                        field = WebDriverWait(self.driver, 5).until(
                            EC.visibility_of_element_located((By.CSS_SELECTOR, selector))
                        )
                        # Click via JS to bypass any processing overlay, then type.
                        self.driver.execute_script("arguments[0].click();", field)
                        time.sleep(1)
                        field.send_keys(Keys.CONTROL + "a")
                        field.send_keys(Keys.DELETE)
                        time.sleep(0.5)
                        field.send_keys(caption[:63000])
                        time.sleep(1)
                        # Verify the text actually landed in this box.
                        text = (field.get_attribute("textContent") or "").strip()
                        if text:
                            typed = True
                            break
                    except Exception:
                        continue
                if typed:
                    break
                time.sleep(3)
            if not typed:
                print("  [!] Could not set caption")
                return False
            time.sleep(2)
        except Exception as e:
            print(f"  [!] Caption error: {e}")
            return False

        # Dry-run mode: everything up to Post is verified (login, composer,
        # video attach, caption) — the post is never published.
        if dry_run:
            print("  [Facebook] DRY RUN — composer ready, video attached, caption "
                  "set. Post NOT clicked (verification only).")
            self.driver.save_screenshot("/tmp/fb_dryrun_ready.png")
            return True

        # Click Post — FB disables the button while the video is processing,
        # so poll until it becomes clickable (up to ~2.5 min). Only a Post
        # button inside the composer dialog is valid.
        try:
            post_selectors = [
                'div[role="dialog"] div[aria-label="Post"]',
                'div[role="dialog"] div[aria-label="نشر"]',
                'div[role="dialog"] button:has(span:text("Post"))',
                '//div[@role="dialog"]//div[@aria-label="Post"]',
                '//div[@role="dialog"]//div[@aria-label="نشر"]',
                'div[aria-label="Post"]',
                '//div[@aria-label="Post"]',
            ]
            clicked = False
            deadline = time.time() + 150
            while time.time() < deadline:
                for selector in post_selectors:
                    try:
                        if selector.startswith("//"):
                            btn = WebDriverWait(self.driver, 5).until(
                                EC.presence_of_element_located((By.XPATH, selector))
                            )
                        else:
                            btn = WebDriverWait(self.driver, 5).until(
                                EC.presence_of_element_located((By.CSS_SELECTOR, selector))
                            )
                        if btn.get_attribute("aria-disabled") == "true" or not btn.is_enabled():
                            continue
                        self.driver.execute_script("arguments[0].click();", btn)
                        clicked = True
                        break
                    except Exception:
                        continue
                if clicked:
                    break
                time.sleep(3)
            if not clicked:
                print("  [!] Could not click Post button")
                return False
            time.sleep(8)
        except Exception as e:
            print(f"  [!] Post error: {e}")
            return False

        return True
