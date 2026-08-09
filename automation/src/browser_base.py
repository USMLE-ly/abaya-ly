"""Base class for platform publishers — Playwright over the anti-detect Chromium host.

Selenium/Firefox replacement: the browser is the anti-detect chromium from
browser_host (modern UA, `navigator.webdriver` masked, session cookies
restored, CPU-only SwiftShader rendering), attached over CDP. Platform
subclasses implement `publish()`; `run()` handles the full lifecycle.
"""

import os
import sys
import time
from abc import ABC, abstractmethod

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT_DIR)
from cookie_manager import load_cookies


class BasePublisher(ABC):
    """Base class for all platform publishers."""

    PLATFORM_NAME = "base"
    MAX_RETRIES = 3

    def __init__(self, headless: bool = True):
        self.headless = headless
        self.driver = None       # Playwright Page attached over CDP
        self._pw = None          # sync_playwright instance (keeps the loop alive)
        self._host_proc = None   # browser_host subprocess
        self._host_port = None   # CDP port

    def _create_driver(self) -> "object | None":
        """Launch the anti-detect chromium host and attach a Page over CDP."""
        import browser_host
        from playwright.sync_api import sync_playwright

        launched = browser_host.launch_and_wait(
            self.PLATFORM_NAME, keepalive_sec=60 * 30
        )
        if not launched:
            print("  [!] Could not launch anti-detect browser host")
            return None
        proc, port = launched
        pw = sync_playwright().start()
        browser = pw.chromium.connect_over_cdp(f"http://127.0.0.1:{port}")
        page = browser.contexts[0].pages[0]
        page.set_default_timeout(90000)
        self._pw = pw
        self._host_proc = proc
        self._host_port = port
        self.driver = page
        return page

    def _load_cookies(self) -> bool:
        """Cookies are restored by browser_host at launch; just verify them."""
        cookies = load_cookies(self.PLATFORM_NAME)
        if not cookies:
            print(f"  [!] No cookies found for {self.PLATFORM_NAME}")
            return False
        self._safe_get(self.HOME_URL)
        return True

    def _safe_get(self, url: str, retries: int = 4, pause: float = 6.0) -> None:
        """Navigate with retries — CDN edges (esp. TikTok/Akamai) intermittently
        drop the first connection from datacenter IPs; a retry usually lands."""
        last = None
        for attempt in range(1, retries + 1):
            try:
                self.driver.goto(url, wait_until="domcontentloaded", timeout=60000)
                return
            except Exception as e:
                last = e
                print(f"  [!] Navigation retry {attempt}/{retries} ({url}): {e}")
                time.sleep(pause)
        raise last

    def _quit(self) -> None:
        """Tear down the Playwright session and the browser host subprocess."""
        if self._pw:
            try:
                self._pw.stop()
            except Exception:
                pass
            self._pw = None
        if self._host_proc is not None:
            import browser_host
            try:
                browser_host.stop(self._host_proc)
            except Exception:
                pass
            self._host_proc = None
        self.driver = None

    @abstractmethod
    def publish(self, video_path: str, caption: str) -> bool:
        """Publish content to the platform. Returns True on success."""
        pass

    def run(self, video_path: str, caption: str, product_url: str | None = None) -> bool:
        """Run the full publish flow with error handling.

        ``product_url`` is accepted for API symmetry (TikTok/Instagram attach
        it as a link sticker/comment); publishers that don't use it ignore it.
        """
        print(f"  [{self.PLATFORM_NAME}] Starting publish...")
        try:
            if not self._create_driver():
                print(f"  [{self.PLATFORM_NAME}] Could not launch browser")
                return False

            if not self._load_cookies():
                print(f"  [{self.PLATFORM_NAME}] Skipping — no valid cookies")
                return False

            self.driver.refresh()
            time.sleep(2)

            success = self.publish(video_path, caption)

            if success:
                print(f"  [✓] {self.PLATFORM_NAME} posted successfully")
            else:
                print(f"  [✗] {self.PLATFORM_NAME} post failed")

            return success

        except Exception as e:
            print(f"  [✗] {self.PLATFORM_NAME} error: {e}")
            return False
        finally:
            self._quit()
