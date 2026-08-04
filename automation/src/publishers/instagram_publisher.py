import os
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from .base_publisher import BasePublisher


class InstagramPublisher(BasePublisher):
    """Publish Reels to Instagram using cookie-based Selenium."""

    PLATFORM_NAME = "instagram"
    HOME_URL = "https://www.instagram.com/"
    UPLOAD_URL = "https://www.instagram.com/reels/upload/"

    def publish(self, video_path: str, caption: str) -> bool:
        if not os.path.exists(video_path):
            print(f"  [!] Video not found: {video_path}")
            return False

        # Preferred path: instagrapi with the sessionid cookie (stable, no browser).
        sessionid = self._get_sessionid()
        if sessionid:
            try:
                return self._publish_instagrapi(video_path, caption, sessionid)
            except Exception as e:
                print(f"  [!] instagrapi failed ({e}) — falling back to Selenium")

        return self._publish_selenium(video_path, caption)

    def _get_sessionid(self) -> str | None:
        from cookie_manager import load_cookies
        for raw in load_cookies(self.PLATFORM_NAME):
            if raw.get("name") == "sessionid" and raw.get("value"):
                return raw["value"]
        return None

    def _publish_instagrapi(self, video_path: str, caption: str, sessionid: str) -> bool:
        from instagrapi import Client
        client = Client()
        client.login_by_sessionid(sessionid)
        media = client.clip_upload(os.path.abspath(video_path), caption[:2200])
        print(f"  [✓] Instagram posted → https://www.instagram.com/reel/{media.pk}/")
        return True

    def _publish_selenium(self, video_path: str, caption: str) -> bool:
        self.driver.get("https://www.instagram.com/")
        time.sleep(3)

        # Navigate to Reels upload
        self.driver.get(self.UPLOAD_URL)
        time.sleep(5)

        # Upload video
        try:
            file_input = WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, 'input[type="file"][accept*="video"]'))
            )
            file_input.send_keys(os.path.abspath(video_path))
        except Exception:
            try:
                file_input = self.driver.find_element(By.CSS_SELECTOR, 'input[type="file"]')
                file_input.send_keys(os.path.abspath(video_path))
            except Exception as e:
                print(f"  [!] Could not find file input: {e}")
                return False

        # Wait for video to process
        time.sleep(10)

        # Click Next through the upload flow
        for _ in range(3):
            try:
                next_btn = WebDriverWait(self.driver, 10).until(
                    EC.element_to_be_clickable((By.XPATH, '//button[contains(text(), "Next")]'))
                )
                next_btn.click()
                time.sleep(3)
            except Exception:
                break

        # Enter caption
        try:
            caption_selectors = [
                'textarea[aria-label]',
                'div[role="textbox"]',
                'textarea',
            ]
            for selector in caption_selectors:
                try:
                    caption_field = WebDriverWait(self.driver, 5).until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                    )
                    caption_field.click()
                    time.sleep(0.5)
                    caption_field.send_keys(Keys.CONTROL + "a")
                    caption_field.send_keys(Keys.DELETE)
                    time.sleep(0.3)
                    truncated = caption[:2200]
                    caption_field.send_keys(truncated)
                    break
                except Exception:
                    continue
            time.sleep(2)
        except Exception as e:
            print(f"  [!] Could not set caption: {e}")
            return False

        # Click Share button
        try:
            share_selectors = [
                'button:has(div:text("Share"))',
                '//button[contains(text(), "Share")]',
                'div[role="button"]:has(div:text("Share"))',
            ]
            for selector in share_selectors:
                try:
                    if selector.startswith('//'):
                        share_btn = WebDriverWait(self.driver, 10).until(
                            EC.element_to_be_clickable((By.XPATH, selector))
                        )
                    else:
                        share_btn = WebDriverWait(self.driver, 10).until(
                            EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                        )
                    share_btn.click()
                    break
                except Exception:
                    continue
            time.sleep(5)
        except Exception as e:
            print(f"  [!] Could not click Share: {e}")
            return False

        return True
