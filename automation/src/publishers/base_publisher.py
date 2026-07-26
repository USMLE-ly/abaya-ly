import os
import sys
import time
from abc import ABC, abstractmethod
from selenium import webdriver
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.firefox.service import Service
from webdriver_manager.firefox import GeckoDriverManager

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
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
        options = Options()
        if self.headless:
            options.add_argument("--headless")
        options.add_argument("--width=1920")
        options.add_argument("--height=1080")

        service = Service(GeckoDriverManager().install())
        driver = webdriver.Firefox(service=service, options=options)
        driver.implicitly_wait(10)
        return driver

    def _load_cookies(self) -> bool:
        """Load cookies for this platform. Returns True if cookies loaded."""
        cookies = load_cookies(self.PLATFORM_NAME)
        if not cookies:
            print(f"  [!] No cookies found for {self.PLATFORM_NAME}")
            return False

        for cookie in cookies:
            try:
                self.driver.add_cookie(cookie)
            except Exception:
                continue
        return True

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
