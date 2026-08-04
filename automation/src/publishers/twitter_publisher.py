import os
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from .base_publisher import BasePublisher


class TwitterPublisher(BasePublisher):
    """Publish video tweets to Twitter/X using cookie-based Selenium."""

    PLATFORM_NAME = "twitter"
    HOME_URL = "https://x.com/"
    COMPOSE_URL = "https://x.com/compose/post"

    def publish(self, video_path: str, caption: str) -> bool:
        if not os.path.exists(video_path):
            print(f"  [!] Video not found: {video_path}")
            return False

        self.driver.get(self.COMPOSE_URL)
        time.sleep(5)

        # Upload video
        try:
            file_input = self.driver.find_element(By.CSS_SELECTOR, 'input[type="file"][accept*="video"]')
            file_input.send_keys(os.path.abspath(video_path))
            time.sleep(3)
        except Exception:
            try:
                file_input = self.driver.find_element(By.CSS_SELECTOR, 'input[type="file"]')
                file_input.send_keys(os.path.abspath(video_path))
                time.sleep(3)
            except Exception as e:
                print(f"  [!] Could not find file input: {e}")
                return False

        # Wait for video to upload
        time.sleep(8)

        # Enter caption in tweet text box
        try:
            text_selectors = [
                'div[data-testid="tweetTextarea_0"][role="textbox"]',
                'div[role="textbox"]',
                'div[contenteditable="true"]',
            ]
            text_box = None
            for selector in text_selectors:
                try:
                    text_box = WebDriverWait(self.driver, 10).until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                    )
                    break
                except Exception:
                    continue

            if text_box:
                text_box.click()
                time.sleep(1)
                text_box.send_keys(Keys.CONTROL + "a")
                text_box.send_keys(Keys.DELETE)
                time.sleep(0.5)
                # Twitter has 280 char limit for text, but video tweets allow more
                truncated = caption[:2200]
                text_box.send_keys(truncated)
                time.sleep(2)
        except Exception as e:
            print(f"  [!] Could not set caption: {e}")
            return False

        # Click Post button
        try:
            post_selectors = [
                'button[data-testid="tweetButtonInline"]',
                'button[data-testid="tweetButton"]',
                '//button[contains(text(), "Post")]',
            ]
            for selector in post_selectors:
                try:
                    if selector.startswith('//'):
                        post_btn = WebDriverWait(self.driver, 10).until(
                            EC.element_to_be_clickable((By.XPATH, selector))
                        )
                    else:
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
