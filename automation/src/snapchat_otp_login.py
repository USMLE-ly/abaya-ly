"""Interactive Snapchat SSO login with OTP support.

Runs the SSO login flow and, when Snapchat asks for a verification code,
waits for the code on stdin (typed by the operator). On success it saves the
fresh session cookies back to cookies/snapchat.json so the publisher works
without OTP afterwards.
"""
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from browser_base import BasePublisher
from cookie_manager import save_cookies, load_cookies

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main() -> int:
    print("=== Snapchat OTP login ===", flush=True)
    from uploaders.snapchat_uploader import SnapchatUploader
    uploader = SnapchatUploader(headless=True)
    driver = uploader._create_driver()
    try:
        driver.get("https://my.snapchat.com/")
        time.sleep(4)
        print("URL after load:", driver.current_url, flush=True)

        # If cookies already grant a session, we're done.
        if "login" not in driver.current_url.lower() and "accounts.snapchat" not in driver.current_url:
            print("Already logged in — saving cookies", flush=True)
            save_cookies("snapchat", driver.get_cookies())
            return 0

        creds = json.load(open(os.path.join(ROOT, "cookies", "account.json")))
        email, password = creds["email"], creds["password"]

        email_input = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR,
                 "input[name='accountIdentifier'], input[type='email'], input[name='username'], input[name='email']")
            )
        )
        email_input.send_keys(email)
        email_input.send_keys(Keys.RETURN)
        time.sleep(4)
        try:
            driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        except Exception:
            pass
        time.sleep(4)

        pwd_input = WebDriverWait(driver, 20).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='password']"))
        )
        pwd_input.send_keys(password)
        pwd_input.send_keys(Keys.RETURN)
        print("Credentials submitted — waiting for OTP screen...", flush=True)
        time.sleep(6)
        print("URL now:", driver.current_url, flush=True)

        # The portal URL with an SSO ticket means login already succeeded —
        # save cookies and finish without waiting for any OTP field.
        def logged_in() -> bool:
            return (
                "login" not in driver.current_url.lower()
                and "accounts.snapchat" not in driver.current_url.lower()
                and "snap-posting-web" in driver.current_url
            )

        # Give any OTP challenge a short chance to appear; if the portal loads
        # first, we're done.
        deadline = time.time() + 90
        otp_seen = False
        while time.time() < deadline and not logged_in():
            try:
                if driver.find_elements(
                    By.CSS_SELECTOR,
                    "input[name='code'], input[type='tel'], input[placeholder*='code'], "
                    "input[placeholder*='رمز'], input[maxlength='6'], input[autocomplete='one-time-code']",
                ):
                    otp_seen = True
                    break
            except Exception:
                pass
            time.sleep(2)
        if logged_in():
            save_cookies("snapchat", driver.get_cookies())
            print("✅ Already logged in via SSO — cookies saved to cookies/snapchat.json", flush=True)
            return 0
        if not otp_seen:
            print("⚠️ No OTP field and not logged in after 90s — dumping cookies anyway", flush=True)
            save_cookies("snapchat", driver.get_cookies())
            return 1

        code_input = WebDriverWait(driver, 90).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR,
                 "input[name='code'], input[type='tel'], input[placeholder*='code'], "
                 "input[placeholder*='رمز'], input[maxlength='6'], input[autocomplete='one-time-code']")
            )
        )
        print("OTP FIELD READY — send the code and I will type it", flush=True)
        code = sys.stdin.readline().strip()
        if not code:
            print("No code provided — aborting", flush=True)
            return 1
        code_input.send_keys(code)
        time.sleep(3)
        try:
            driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        except Exception:
            code_input.send_keys(Keys.RETURN)
        print("Code submitted — waiting for the portal...", flush=True)

        deadline = time.time() + 45
        while time.time() < deadline:
            if "login" not in driver.current_url.lower() and "accounts.snapchat" not in driver.current_url:
                time.sleep(3)
                save_cookies("snapchat", driver.get_cookies())
                print("✅ Logged in — cookies saved to cookies/snapchat.json", flush=True)
                return 0
            time.sleep(2)
        print("⚠️ Still on login after 45s — dumping cookies anyway", flush=True)
        save_cookies("snapchat", driver.get_cookies())
        return 1
    finally:
        driver.quit()


if __name__ == "__main__":
    sys.exit(main())
