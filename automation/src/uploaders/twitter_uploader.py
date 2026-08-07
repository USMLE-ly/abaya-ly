"""X/Twitter uploader — hardened Selenium (geckodriver) flow.

Same base as the Facebook uploader: container-safe Firefox, navigation retries
(_safe_get), explicit waits around the composer, and a retry on the file input
because X's composer sometimes needs a beat to mount the upload button.
"""

import os
import time

from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from browser_base import BasePublisher


class TwitterUploader(BasePublisher):
    """Upload a video tweet using session cookies."""

    PLATFORM_NAME = "twitter"
    HOME_URL = "https://x.com/"
    COMPOSE_URL = "https://x.com/compose/post"

    def publish(self, video_path: str, caption: str = "") -> bool:
        if not os.path.exists(video_path):
            print(f"  [!] Video not found: {video_path}")
            return False

        self._safe_get(self.COMPOSE_URL)
        time.sleep(4)

        # Attach the video file (retry: composer mounts lazily)
        try:
            file_input = WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, 'input[type="file"][accept*="video"], input[type="file"]')
                )
            )
            file_input.send_keys(os.path.abspath(video_path))
            time.sleep(4)
        except Exception as e:
            print(f"  [!] Could not find file input: {e}")
            return False

        # Wait for upload to process
        time.sleep(8)

        # Enter caption
        try:
            text_selectors = [
                'div[data-testid="tweetTextarea_0"][role="textbox"]',
                'div[role="textbox"]',
                'div[contenteditable="true"]',
            ]
            typed = False
            for selector in text_selectors:
                try:
                    text_box = WebDriverWait(self.driver, 10).until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                    )
                    text_box.click()
                    time.sleep(1)
                    text_box.send_keys(Keys.CONTROL + "a")
                    text_box.send_keys(Keys.DELETE)
                    time.sleep(0.5)
                    text_box.send_keys(caption[:2200])
                    typed = True
                    break
                except Exception:
                    continue
            if not typed:
                print("  [!] Could not set caption")
                return False
            time.sleep(2)
        except Exception as e:
            print(f"  [!] Caption error: {e}")
            return False

        # Click Post
        try:
            post_selectors = [
                'button[data-testid="tweetButtonInline"]',
                'button[data-testid="tweetButton"]',
                '//button[contains(text(), "Post")]',
            ]
            clicked = False
            for selector in post_selectors:
                try:
                    if selector.startswith("//"):
                        btn = WebDriverWait(self.driver, 10).until(
                            EC.element_to_be_clickable((By.XPATH, selector))
                        )
                    else:
                        btn = WebDriverWait(self.driver, 10).until(
                            EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                        )
                    btn.click()
                    clicked = True
                    break
                except Exception:
                    continue
            if not clicked:
                print("  [!] Could not click Post button")
                return False
            time.sleep(6)
        except Exception as e:
            print(f"  [!] Post error: {e}")
            return False

        return True
