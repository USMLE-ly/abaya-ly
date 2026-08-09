"""Interactive Snapchat SSO login with OTP support (Playwright / browser-use host).

Replaces the old Selenium/Firefox driver: the anti-detect Chromium host
(browser_host) restores any existing session cookies; if Snapchat asks for a
verification code, we wait for the code on stdin (typed by the operator). On
success the fresh session cookies are saved back to cookies/snapchat.json so
the publisher works without OTP afterwards.
"""
import json
import os
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from browser_host import launch_and_wait, stop
from cookie_manager import save_cookies
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

_LOGIN_BLOCKERS = ("login", "accounts.snapchat", "verification", "verify")


def _is_logged_in(url: str) -> bool:
    u = url.lower()
    return not any(b in u for b in _LOGIN_BLOCKERS)


def main() -> int:
    print("=== Snapchat OTP login (browser-use host) ===", flush=True)
    launched = launch_and_wait("snapchat", keepalive_sec=60 * 15)
    if not launched:
        print("Browser host failed to launch", flush=True)
        return 1
    proc, port = launched
    pw = None
    try:
        pw = sync_playwright().start()
        browser = pw.chromium.connect_over_cdp(f"http://127.0.0.1:{port}")
        page = browser.contexts[0].pages[0]
        page.set_default_timeout(90000)
        page.goto("https://my.snapchat.com/", wait_until="domcontentloaded")
        time.sleep(6)
        print("URL after load:", page.url, flush=True)

        # If cookies already grant a session, we're done.
        if _is_logged_in(page.url):
            print("Already logged in — saving cookies", flush=True)
            save_cookies("snapchat", page.context.cookies())
            return 0

        creds = json.load(open(os.path.join(ROOT, "cookies", "account.json")))
        email, password = creds["email"], creds["password"]

        # Email/username step
        email_input = page.wait_for_selector(
            "input[name='accountIdentifier'], input[type='email'], "
            "input[name='username'], input[name='email']",
            timeout=30000,
        )
        email_input.fill(email)
        email_input.press("Enter")
        time.sleep(4)
        try:
            page.click("button[type='submit']", timeout=5000)
        except Exception:
            pass
        time.sleep(4)

        # Password step
        pwd_input = page.wait_for_selector(
            "input[type='password']", timeout=30000
        )
        pwd_input.fill(password)
        pwd_input.press("Enter")
        print("Credentials submitted — waiting for OTP screen...", flush=True)
        time.sleep(6)
        print("URL now:", page.url, flush=True)

        if _is_logged_in(page.url):
            save_cookies("snapchat", page.context.cookies())
            print("✅ Already logged in via SSO — cookies saved to cookies/snapchat.json", flush=True)
            return 0

        # Give any OTP challenge a chance to appear.
        deadline = time.time() + 90
        otp_seen = False
        while time.time() < deadline and not _is_logged_in(page.url):
            try:
                if page.query_selector(
                    "input[name='code'], input[type='tel'], "
                    "input[placeholder*='code' i], input[placeholder*='رمز' i], "
                    "input[maxlength='6'], input[autocomplete='one-time-code']"
                ):
                    otp_seen = True
                    break
            except Exception:
                pass
            time.sleep(2)
        if _is_logged_in(page.url):
            save_cookies("snapchat", page.context.cookies())
            print("✅ Already logged in via SSO — cookies saved to cookies/snapchat.json", flush=True)
            return 0
        if not otp_seen:
            print("⚠️ No OTP field and not logged in after 90s — dumping cookies anyway", flush=True)
            save_cookies("snapchat", page.context.cookies())
            return 1

        code_input = page.wait_for_selector(
            "input[name='code'], input[type='tel'], "
            "input[placeholder*='code' i], input[placeholder*='رمز' i], "
            "input[maxlength='6'], input[autocomplete='one-time-code']",
            timeout=90000,
        )
        print("OTP FIELD READY — send the code and I will type it", flush=True)
        code = sys.stdin.readline().strip()
        if not code:
            print("No code provided — aborting", flush=True)
            return 1
        code_input.fill(code)
        time.sleep(3)
        try:
            page.click("button[type='submit']", timeout=5000)
        except Exception:
            code_input.press("Enter")
        print("Code submitted — waiting for the portal...", flush=True)

        deadline = time.time() + 45
        while time.time() < deadline:
            if _is_logged_in(page.url):
                time.sleep(3)
                save_cookies("snapchat", page.context.cookies())
                print("✅ Logged in — cookies saved to cookies/snapchat.json", flush=True)
                return 0
            time.sleep(2)
        print("⚠️ Still on login after 45s — dumping cookies anyway", flush=True)
        save_cookies("snapchat", page.context.cookies())
        return 1
    finally:
        if pw:
            try:
                pw.stop()
            except Exception:
                pass
        stop(proc)


if __name__ == "__main__":
    sys.exit(main())
