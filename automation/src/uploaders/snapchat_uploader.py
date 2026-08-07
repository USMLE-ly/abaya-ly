"""Snapchat uploader — Selenium (geckodriver) against my.snapchat.com.

Snapchat's web creator portal supports uploading videos to Spotlight/Story
from a browser. We authenticate with the exported session cookies (shared
.snapchat.com domain) instead of username/password + SMS verification.
"""

import os
import time

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from browser_base import BasePublisher


class SnapchatUploader(BasePublisher):
    """Upload a video to Snapchat Spotlight/Story via the web creator portal."""

    PLATFORM_NAME = "snapchat"
    HOME_URL = "https://web.snapchat.com/"
    PORTAL_URL = "https://my.snapchat.com/"

    def _login_with_credentials(self) -> bool:
        """Best-effort SSO login using cookies/account.json credentials.

        Snapchat frequently requires an email/SMS verification code after the
        password step; when that happens we time out and return False so the
        publisher falls back to the manual caption file.
        """
        import json

        from selenium.webdriver.common.keys import Keys

        account_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
            "cookies",
            "account.json",
        )
        if not os.path.exists(account_path):
            return False
        with open(account_path, "r", encoding="utf-8") as f:
            creds = json.load(f)
        email, password = creds.get("email"), creds.get("password")
        if not email or not password:
            return False

        try:
            # Email/username step
            email_input = WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, "input[name='accountIdentifier'], input[type='email'], input[name='username'], input[name='email']")
                )
            )
            email_input.clear()
            email_input.send_keys(email)
            email_input.send_keys(Keys.RETURN)
            time.sleep(4)
            try:
                next_btn = self.driver.find_element(
                    By.CSS_SELECTOR, "button[type='submit']"
                )
                next_btn.click()
            except Exception:
                pass
            time.sleep(4)

            # Password step
            pwd_input = WebDriverWait(self.driver, 20).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password']"))
            )
            pwd_input.clear()
            pwd_input.send_keys(password)
            pwd_input.send_keys(Keys.RETURN)
            print("  [Snapchat] credentials submitted — waiting for portal (OTP may block this)")
        except Exception as e:
            print(f"  [!] Snapchat login form error: {e}")
            return False

        # Wait for the portal to load past login (or an OTP wall)
        deadline = time.time() + 60
        while time.time() < deadline:
            url = self.driver.current_url
            if "my.snapchat.com" in url and "login" not in url and "accounts.snapchat" not in url:
                time.sleep(3)
                return True
            if "verification" in url.lower() or "code" in url.lower() or "2fa" in url.lower():
                return False
            time.sleep(2)
        return False

    def publish(self, video_path: str, caption: str = "") -> bool:
        if not os.path.exists(video_path):
            print(f"  [!] Video not found: {video_path}")
            return False

        self._safe_get(self.PORTAL_URL)
        time.sleep(4)

        if "login" in self.driver.current_url.lower() or "accounts.snapchat" in self.driver.current_url:
            print("  [!] Snapchat session not valid for the creator portal — trying SSO login")
            if not self._login_with_credentials():
                print("  [!] Snapchat login failed (OTP/2FA likely required)")
                return False

        # Upload the video file
        try:
            file_input = WebDriverWait(self.driver, 20).until(
                EC.presence_of_element_located(
                    (By.CSS_SELECTOR, "input[type='file']")
                )
            )
            file_input.send_keys(os.path.abspath(video_path))
            time.sleep(12)
        except Exception as e:
            print(f"  [!] Snapchat upload input not found: {e}")
            return False

        # Description / topics
        try:
            desc = WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located(
                    (By.XPATH,
                     "//textarea[contains(@placeholder, 'description') "
                     "or contains(@placeholder, 'Add a')]")
                )
            )
            desc.send_keys(caption[:1500])
            time.sleep(1)
        except Exception as e:
            print(f"  [!] Could not set Snapchat description: {e}")
            return False

        # Agree to Spotlight terms if the dialog appears
        try:
            agree = WebDriverWait(self.driver, 8).until(
                EC.element_to_be_clickable(
                    (By.XPATH, "//button[contains(text(), 'Agree to Spotlight Terms')]")
                )
            )
            agree.click()
            time.sleep(1)
        except Exception:
            pass

        # Post
        try:
            post_btn = WebDriverWait(self.driver, 15).until(
                EC.element_to_be_clickable(
                    (By.XPATH,
                     "//button[contains(text(), 'Post to Snapchat') "
                     "or contains(text(), 'Post')]")
                )
            )
            post_btn.click()
        except Exception as e:
            print(f"  [!] Could not click Snapchat Post: {e}")
            return False

        # Success confirmation (generous window — upload+processing can be slow)
        try:
            WebDriverWait(self.driver, 150).until(
                EC.presence_of_element_located(
                    (By.XPATH, "//*[contains(text(), 'Yay!') or contains(text(), 'live!')]")
                )
            )
            print("  [✓] Snapchat: post is live")
        except Exception:
            print("  [!] Snapchat: no success confirmation (may still be processing)")

        return True
