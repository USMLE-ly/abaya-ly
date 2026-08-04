import os
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from .base_publisher import BasePublisher


class TikTokPublisher(BasePublisher):
    """Publish videos to TikTok using cookie-based Selenium."""

    PLATFORM_NAME = "tiktok"
    HOME_URL = "https://www.tiktok.com/"
    UPLOAD_URL = "https://www.tiktok.com/creator#/upload?scene=creator_center"

    def publish(self, video_path: str, caption: str) -> bool:
        if not os.path.exists(video_path):
            print(f"  [!] Video not found: {video_path}")
            return False

        self.driver.get(self.UPLOAD_URL)
        time.sleep(5)

        # Find and upload video file
        try:
            file_input = self.driver.find_element(By.CSS_SELECTOR, 'input[type="file"]')
            file_input.send_keys(os.path.abspath(video_path))
        except Exception as e:
            print(f"  [!] Could not find file input: {e}")
            return False

        # Wait for upload to complete
        time.sleep(15)

        # Find caption/description field and type caption
        try:
            desc_selectors = [
                'div[data-testid="post-description"]',
                'div[contenteditable="true"]',
                'div[role="textbox"]',
            ]
            desc_field = None
            for selector in desc_selectors:
                try:
                    desc_field = WebDriverWait(self.driver, 10).until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                    )
                    break
                except Exception:
                    continue

            if desc_field:
                desc_field.click()
                time.sleep(1)
                # Clear existing text
                desc_field.send_keys(Keys.CONTROL + "a")
                desc_field.send_keys(Keys.DELETE)
                time.sleep(0.5)
                # Type caption (TikTok has a char limit, trim if needed)
                truncated = caption[:2200]
                desc_field.send_keys(truncated)
                time.sleep(2)
        except Exception as e:
            print(f"  [!] Could not set caption: {e}")
            return False

        # Click Post button
        try:
            post_selectors = [
                'button[data-testid="upload-post"]',
                'button[type="submit"]',
            ]
            for selector in post_selectors:
                try:
                    post_btn = WebDriverWait(self.driver, 10).until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                    )
                    post_btn.click()
                    break
                except Exception:
                    continue
            time.sleep(5)
        except Exception as e:
            print(f"  [!] Could not click Post: {e}")
            return False

        return True
