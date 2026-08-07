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

    def publish(self, video_path: str, caption: str = "", page_url: str = "") -> bool:
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

        # Attach the video file
        try:
            file_input = WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, 'input[type="file"][accept*="video"], input[type="file"]')
                )
            )
            file_input.send_keys(os.path.abspath(video_path))
            time.sleep(6)
        except Exception as e:
            print(f"  [!] Could not find file input: {e}")
            return False

        # Wait for upload/processing to finish
        time.sleep(10)

        # Enter caption
        try:
            caption_selectors = [
                'div[role="textbox"][aria-label*="on your mind"]',
                'div[role="textbox"][aria-label*="Say something"]',
                'div[role="textbox"][contenteditable="true"]',
                'div[contenteditable="true"]',
                'div[aria-label*="Say something about this video"]',
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

        # Click Post — FB disables the button while the video is processing,
        # so poll until it becomes clickable (up to ~2.5 min).
        try:
            post_selectors = [
                'div[aria-label="Post"]',
                'button:has(span:text("Post"))',
                '//div[@aria-label="Post"]',
                '//button[contains(text(), "Post")]',
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
