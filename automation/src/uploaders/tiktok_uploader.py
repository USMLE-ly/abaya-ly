"""TikTok uploader — Playwright backend via the `tiktok-uploader` package.

The package's default user-agent is an ancient Chrome/58 string that triggers
TikTok's bot checks, so we override it with a modern UA before launching.
Navigation happens against the current Creator Center URL, with the package's
own retries (num_retries) and real success confirmation.

Website link sticker: TikTok's upload dialog has an "Add link" button (business
accounts). We inject a Playwright step right before the package posts the video
so the link sticker lands on the live post. The step is best-effort — if the
account doesn't show the option (or the UI is localized differently), the video
still posts, just without the link.
"""

import os
import time
from typing import Optional

from .cookies import to_playwright_cookies

MODERN_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
)


def _add_website_link(page, url: str) -> None:
    """Best-effort: click 'Add link' in the TikTok upload dialog and paste a URL."""
    try:
        add_link_button = page.locator(
            "//button[contains(@class, 'Button__root') and (contains(., 'Add link') or contains(., 'Add'))]"
        )
        add_link_button.first.click(timeout=8000)
        time.sleep(1.5)

        # Website tab, when present (product accounts show Product/Website tabs).
        for label in ("Website", "Link", "الموقع", "الرابط"):
            tab = page.locator(f"//div[contains(text(), '{label}')]").first
            if tab.is_visible(timeout=1500):
                tab.click()
                time.sleep(0.5)
                break

        # The URL input — try common selectors/placeholders.
        url_input = None
        for selector in (
            "//input[@type='url']",
            "//input[contains(@placeholder, 'link') or contains(@placeholder, 'Link')]",
            "//input[contains(@placeholder, 'https')]",
            "//input[@type='text']",
        ):
            candidate = page.locator(selector).first
            if candidate.is_visible(timeout=1500):
                url_input = candidate
                break
        if url_input is None:
            print("  [!] TikTok: no website input found — skipping link sticker")
            return

        url_input.click()
        url_input.fill(url)
        time.sleep(0.5)

        # Confirm: primary 'Add' / 'Next' / 'Done' button.
        for label in ("Add", "Next", "Done", "أضف", "التالي"):
            btn = page.locator(
                f"//button[contains(@class, 'TUXButton--primary') and .//div[contains(text(), '{label}')]]"
            ).first
            if btn.is_visible(timeout=1500):
                btn.click()
                time.sleep(1)
                break
        print("  [✓] TikTok link sticker added")
    except Exception as e:
        print(f"  [!] TikTok link sticker skipped ({e})")


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
        website_link: Optional[str] = None,
    ) -> dict:
        if not os.path.exists(video_path):
            raise FileNotFoundError(video_path)

        if website_link:
            # Inject the link step right before the package posts the video.
            import tiktok_uploader.upload as tu

            original_post = tu._post_video

            def post_with_link(page):
                _add_website_link(page, website_link)
                original_post(page)

            tu._post_video = post_with_link
            try:
                with self._client() as uploader:
                    ok = uploader.upload_video(
                        filename=os.path.abspath(video_path),
                        description=caption[:2200],
                        visibility=visibility,
                        num_retries=num_retries,
                    )
            finally:
                tu._post_video = original_post
            return {"success": bool(ok)}

        with self._client() as uploader:
            ok = uploader.upload_video(
                filename=os.path.abspath(video_path),
                description=caption[:2200],
                visibility=visibility,
                num_retries=num_retries,
            )
        return {"success": bool(ok)}
