import os
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from .base_publisher import BasePublisher


class FacebookPublisher(BasePublisher):
    """Publish videos to Facebook Pages using cookie-based Selenium."""

    PLATFORM_NAME = "facebook"

    def __init__(self, headless: bool = True, page_url: str = ""):
        super().__init__(headless)
        self.page_url = page_url

    def publish(self, video_path: str, caption: str) -> bool:
        if not os.path.exists(video_path):
            print(f"  [!] Video not found: {video_path}")
            return False

        # Navigate to the Facebook page
        if self.page_url:
            self.driver.get(self.page_url)
        else:
            self.driver.get("https://www.facebook.com/")
        time.sleep(5)

        # Find the "Photo/Video" or "Create Post" area
        try:
            create_selectors = [
                'div[aria-label="Create a post"]',
                'div[role="button"]:has(span:text("Photo/video"))',
                '//div[contains(@aria-label, "Create")]',
            ]
            for selector in create_selectors:
                try:
                    if selector.startswith('//'):
                        create_btn = WebDriverWait(self.driver, 10).until(
                            EC.element_to_be_clickable((By.XPATH, selector))
                        )
                    else:
                        create_btn = WebDriverWait(self.driver, 10).until(
                            EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                        )
                    create_btn.click()
                    time.sleep(3)
                    break
                except Exception:
                    continue
        except Exception as e:
            print(f"  [!] Could not find create post area: {e}")
            return False

        # Upload video
        try:
            file_input = self.driver.find_element(By.CSS_SELECTOR, 'input[type="file"][accept*="video"]')
            file_input.send_keys(os.path.abspath(video_path))
            time.sleep(5)
        except Exception:
            try:
                file_input = self.driver.find_element(By.CSS_SELECTOR, 'input[type="file"]')
                file_input.send_keys(os.path.abspath(video_path))
                time.sleep(5)
            except Exception as e:
                print(f"  [!] Could not find file input: {e}")
                return False

        # Wait for video to process
        time.sleep(10)

        # Enter caption
        try:
            caption_selectors = [
                'div[role="textbox"][aria-label*="on your mind"]',
                'div[role="textbox"][contenteditable="true"]',
                'div[contenteditable="true"]',
            ]
            for selector in caption_selectors:
                try:
                    caption_field = WebDriverWait(self.driver, 10).until(
                        EC.element_to_be_clickable((By.CSS_SELECTOR, selector))
                    )
                    caption_field.click()
                    time.sleep(1)
                    caption_field.send_keys(Keys.CONTROL + "a")
                    caption_field.send_keys(Keys.DELETE)
                    time.sleep(0.5)
                    truncated = caption[:63000]
                    caption_field.send_keys(truncated)
                    break
                except Exception:
                    continue
            time.sleep(2)
        except Exception as e:
            print(f"  [!] Could not set caption: {e}")
            return False

        # Click Post button
        try:
            post_selectors = [
                'div[aria-label="Post"]',
                'button:has(span:text("Post"))',
                '//div[@aria-label="Post"]',
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
