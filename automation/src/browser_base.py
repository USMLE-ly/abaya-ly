import os
import sys
import time
from abc import ABC, abstractmethod
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from webdriver_manager.firefox import GeckoDriverManager

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT_DIR)
from cookie_manager import load_cookies


class BasePublisher(ABC):
    """Base class for all platform publishers."""

    PLATFORM_NAME = "base"
    MAX_RETRIES = 3

    def __init__(self, headless: bool = True):
        self.headless = headless
        self.driver = None

    def _create_driver(self) -> webdriver.Firefox:
        """Create a Firefox WebDriver instance."""
        # Container fix: Firefox content processes segfault (marionette decode
        # error) when the content sandbox is enabled in restricted containers.
        os.environ.setdefault("MOZ_DISABLE_CONTENT_SANDBOX", "1")
        os.environ.setdefault("MOZ_HEADLESS", "1")
        options = Options()
        firefox_bin = os.environ.get("FIREFOX_BIN") or "/opt/firefox-arm64/firefox"
        if os.path.exists(firefox_bin):
            options.binary_location = firefox_bin
        if self.headless:
            options.add_argument("--headless")
        options.add_argument("--width=1920")
        options.add_argument("--height=1080")
        # Avoid IPv6 timeouts against flaky CDN edges (some Akamai ranges for
        # TikTok only answer IPv4 reliably from this datacenter).
        options.set_preference("network.dns.disableIPv6", True)

        service = Service(GeckoDriverManager().install())
        driver = webdriver.Firefox(service=service, options=options)
        driver.implicitly_wait(10)
        return driver

    def _normalize_cookie(self, raw: dict) -> dict | None:
        """Map common export formats (Cookie-Editor/EditThisCookie) to Selenium's add_cookie."""
        name = raw.get("name")
        value = raw.get("value")
        if not name or value is None:
            return None
        cookie = {"name": name, "value": value, "path": raw.get("path", "/")}
        if raw.get("domain"):
            cookie["domain"] = raw["domain"]
        if raw.get("secure"):
            cookie["secure"] = True
        expiry = raw.get("expirationDate") or raw.get("expiry")
        if expiry:
            cookie["expiry"] = int(expiry)
        return cookie

    def _load_cookies(self) -> bool:
        """Load cookies for this platform. Returns True if cookies loaded.

        Selenium requires the browser to already be on the cookie's domain before
        add_cookie() succeeds, so we park on the platform host first.
        """
        cookies = load_cookies(self.PLATFORM_NAME)
        if not cookies:
            print(f"  [!] No cookies found for {self.PLATFORM_NAME}")
            return False

        self._safe_get(self.HOME_URL)
        time.sleep(2)

        for raw in cookies:
            cookie = self._normalize_cookie(raw)
            if not cookie:
                continue
            try:
                self.driver.add_cookie(cookie)
            except Exception:
                continue
        return True

    def _safe_get(self, url: str, retries: int = 4, pause: float = 6.0) -> None:
        """Navigate with retries — CDN edges (esp. TikTok/Akamai) intermittently
        drop the first connection from datacenter IPs; a retry usually lands."""
        from selenium.common.exceptions import WebDriverException, TimeoutException
        last = None
        for attempt in range(1, retries + 1):
            try:
                self.driver.set_page_load_timeout(60)
                self.driver.get(url)
                return
            except (WebDriverException, TimeoutException) as e:
                last = e
                print(f"  [!] Navigation retry {attempt}/{retries} ({url}): {e}")
                time.sleep(pause)
        raise last

    @abstractmethod
    def publish(self, video_path: str, caption: str) -> bool:
        """Publish content to the platform. Returns True on success."""
        pass

    def run(self, video_path: str, caption: str) -> bool:
        """Run the full publish flow with error handling."""
        print(f"  [{self.PLATFORM_NAME}] Starting publish...")
        try:
            self.driver = self._create_driver()

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
            if self.driver:
                try:
                    self.driver.quit()
                except Exception:
                    pass
