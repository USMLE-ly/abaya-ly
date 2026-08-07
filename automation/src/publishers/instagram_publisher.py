import os
import re
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

    @staticmethod
    def _product_url(caption: str) -> str | None:
        m = re.search(r"https?://[^\s]+", caption)
        return m.group(0) if m else None

    def publish(self, video_path: str, caption: str, product_url: str | None = None) -> bool:
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
                result = uploader.upload_reel(video_path, caption, link=link)
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
                print(f"  [!] instagrapi failed ({e}) — falling back to Selenium")

        return self._publish_selenium(video_path, caption)

    def run(self, video_path: str, caption: str, product_url: str | None = None) -> bool:
        """BasePublisher.run with product_url support (link sticker + comment)."""
        print(f"  [{self.PLATFORM_NAME}] Starting publish...")
        try:
            self.driver = self._create_driver()

            if not self._load_cookies():
                print(f"  [{self.PLATFORM_NAME}] Skipping — no valid cookies")
                return False

            self.driver.refresh()
            time.sleep(2)

            success = self.publish(video_path, caption, product_url=product_url)

            if success:
                print(f"  [✓] {self.PLATFORM_NAME} posted successfully")
            else:
                print(f"  [✗] {self.PLATFORM_NAME} post failed")

            return success
        except Exception as e:
            print(f"  [✗] {self.PLATFORM_NAME} error: {e}")
            return False
        finally:
            if self.driver:
                try:
                    self.driver.quit()
                except Exception:
                    pass

    def _get_sessionid(self) -> str | None:
        from cookie_manager import load_cookies
        from uploaders.cookies import extract_cookie
        return extract_cookie(load_cookies(self.PLATFORM_NAME), "sessionid")

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
