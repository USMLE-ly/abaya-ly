"""TikTok uploader — Playwright backend via the `tiktok-uploader` package.

The package's default user-agent is an ancient Chrome/58 string that triggers
TikTok's bot checks, so we override it with a modern UA before launching.
Navigation happens against the current Creator Center URL, with the package's
own retries (num_retries) and real success confirmation.
"""

import os
from typing import Optional

from .cookies import to_playwright_cookies

MODERN_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
)


class TikTokUploader:
    """Playwright-based TikTok video uploader (wraps tiktok-uploader)."""

    def __init__(
        self,
        cookies: Optional[list[dict]] = None,
        cookies_file: Optional[str] = None,
        headless: bool = True,
        browser: str = "chromium",
    ):
        if cookies is None and cookies_file:
            import json

            with open(cookies_file, "r", encoding="utf-8") as f:
                cookies = json.load(f)
        self.cookies_list = to_playwright_cookies(cookies or [], default_domain=".tiktok.com")
        self.headless = headless
        self.browser = browser

    def _client(self):
        from tiktok_uploader import config
        from tiktok_uploader.upload import TikTokUploader as LibUploader

        # Modern UA: the bundled default (Chrome 58) gets flagged by TikTok.
        config.disguising.user_agent = MODERN_UA
        return LibUploader(
            cookies_list=self.cookies_list,
            browser=self.browser,
            headless=self.headless,
        )

    def check_auth(self, retries: int = 3) -> bool:
        """Launch the browser, load cookies, and confirm we land logged-in.

        Raises on auth failure; returns True when the session is usable.
        """
        from playwright.sync_api import TimeoutError as PlaywrightTimeout

        last = None
        for attempt in range(1, retries + 1):
            try:
                with self._client() as uploader:
                    page = uploader.page  # triggers cookie load + login check
                    return "login" not in page.url
            except (PlaywrightTimeout, Exception) as e:  # flaky Akamai edge
                last = e
                print(f"  [!] TikTok auth retry {attempt}/{retries}: {e}")
        raise last

    def upload_video(
        self,
        video_path: str,
        caption: str = "",
        visibility: str = "everyone",
        num_retries: int = 3,
    ) -> dict:
        if not os.path.exists(video_path):
            raise FileNotFoundError(video_path)
        with self._client() as uploader:
            ok = uploader.upload_video(
                filename=os.path.abspath(video_path),
                description=caption[:2200],
                visibility=visibility,
                num_retries=num_retries,
            )
        return {"success": bool(ok)}
