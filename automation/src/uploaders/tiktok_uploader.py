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


def _comment_on_video(page, url: str) -> None:
    """Best-effort: comment the link on the just-posted TikTok video.

    TikTok has no API in this stack for comments, so we open the posted video
    (from the success dialog's link) and type the URL into the comment box.
    """
    try:
        # Grab the posted video link from the success dialog, if visible.
        view_link = page.locator("//a[contains(@href, '/video/')]").first
        if view_link.is_visible(timeout=8000):
            href = view_link.get_attribute("href") or ""
            target = href if href.startswith("http") else f"https://www.tiktok.com{href}"
            page.goto(target)
            time.sleep(3)

        # TikTok's comment box is a contenteditable div with a placeholder.
        comment_box = None
        for selector in (
            "//div[@contenteditable='true' and contains(@data-placeholder, 'comment')]",
            "//div[@contenteditable='true' and contains(@data-placeholder, 'تعليق')]",
            "//div[@contenteditable='true']",
            "//textarea[contains(@placeholder, 'comment')]",
        ):
            candidate = page.locator(selector).first
            if candidate.is_visible(timeout=3000):
                comment_box = candidate
                break
        if comment_box is None:
            print("  [!] TikTok: comment box not found — skipping comment")
            return
        comment_box.click()
        comment_box.fill(url)
        page.keyboard.press("Enter")
        time.sleep(2)
        print("  [✓] TikTok comment posted")
    except Exception as e:
        print(f"  [!] TikTok comment skipped ({e})")


def _robust_post_video(page, timeout_sec: int = 300) -> None:
    """Wait for the upload to finish, then click TikTok's real Post button.

    The packaged _post_video clicks before the upload completes and falls back
    to `.TUXButton--primary`, which no longer exists in TikTok's creator UI
    (the live button is `data-e2e='post_video_button'`). We poll until the
    upload progress clears, wait for the button to enable, click it, handle
    the "Post now" dialog, and verify the success confirmation.
    """
    deadline = time.time() + timeout_sec

    # 1) Wait until the upload progress text disappears.
    while time.time() < deadline:
        try:
            body = page.locator("body").inner_text(timeout=5000)
            if "Uploading" not in body and "uploading" not in body and "left" not in body:
                break
        except Exception:
            break
        time.sleep(3)

    # 2) Wait for the post button to become enabled.
    post_btn = page.locator("//button[@data-e2e='post_video_button']").first
    while time.time() < deadline:
        try:
            disabled = post_btn.get_attribute("data-disabled")
            if disabled == "false" or disabled is None:
                break
        except Exception:
            pass
        time.sleep(2)

    # 3) Click the real button (JS fallback bypasses actionability waits).
    try:
        post_btn.click(timeout=20000)
    except Exception:
        page.evaluate(
            'document.querySelector(\'button[data-e2e="post_video_button"]\').click()'
        )
    time.sleep(2)

    # 4) "Post now" confirmation dialog, when shown.
    try:
        post_now = page.locator("//button[.//div[text()='Post now']]").first
        if post_now.is_visible(timeout=5000):
            post_now.click()
            time.sleep(2)
    except Exception:
        pass

    # 5) Verify the success confirmation.
    try:
        page.locator(
            "//div[contains(text(), 'Your video has been uploaded')"
            " or contains(text(), 'Video published')]"
        ).wait_for(state="attached", timeout=90000)
        print("  [✓] TikTok upload confirmed")
    except Exception as e:
        raise RuntimeError(f"TikTok post confirmation not seen: {e}")


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

    def upload_video_legacy(
        self,
        video_path: str,
        caption: str = "",
        visibility: str = "everyone",
        num_retries: int = 3,
        website_link: Optional[str] = None,
        comment_link: Optional[str] = None,
    ) -> dict:
        if not os.path.exists(video_path):
            raise FileNotFoundError(video_path)

        # Inject the link step + robust post right before the package posts.
        import tiktok_uploader.upload as tu

        original_post = tu._post_video

        def post_with_link(page):
            if website_link:
                _add_website_link(page, website_link)
            _robust_post_video(page)

        tu._post_video = post_with_link
        try:
            with self._client() as uploader:
                ok = uploader.upload_video(
                    filename=os.path.abspath(video_path),
                    description=caption[:2200],
                    visibility=visibility,
                    num_retries=num_retries,
                )
                if ok and comment_link:
                    _comment_on_video(uploader.page, comment_link)
                return {"success": bool(ok)}
        finally:
            tu._post_video = original_post


def _build_upload_task(
    video_path: str,
    caption: str,
    website_link: str | None,
    comment_link: str | None,
) -> str:
    """Prompt for the browser-use agent: see the upload page and post the video."""
    caption_for_task = caption[:1800]
    link_step = (
        f"7. If the account supports it, click the 'Add link' option and paste this URL "
        f"in the Website field, confirm: {website_link}\n"
        if website_link
        else ""
    )
    comment_step = (
        f"10. If you can reach the just-posted video page, post this link as the first "
        f"comment on the video: {comment_link}\n"
        if comment_link
        else ""
    )
    return f"""You are logged in to TikTok Studio. Post the attached video.

1. Go to https://www.tiktok.com/tiktokstudio/upload/video (or creator-center/upload/video).
2. If a login page appears instead of the upload page, reply with exactly LOGIN_FAILED and stop.
3. If the upload area shows a loading spinner for more than ~30 seconds, reload the page
   (navigate to the URL again) and retry, up to 3 times, until the dropzone with
   'Select video to upload' appears. If after 3 reloads the dropzone still has not
   appeared, reply with exactly POST_FAILED (TikTok upload page did not load) and stop -
   do NOT keep retrying.
4. Upload the video file "{video_path}" - find the file input (it may be inside an
   iframe) / upload dropzone and upload it (use the upload_file action with that path).
5. Wait until the upload finishes (no 'Uploading' progress text remains).
6. Type this caption into the caption/description box (replace nothing, type it as-is):
{caption_for_task}
{link_step}8. Click the Post button (button[data-e2e="post_video_button"] or the visible Post button);
   if a 'Post now' dialog appears, confirm it.
9. Wait for the success confirmation ('Your video has been uploaded' / 'Video published' /
   'Your post is being published').
{comment_step}On the very last line report exactly: POSTED_OK or POST_FAILED, plus one short sentence.
"""


class TikTokUploaderVision:
    """browser-use (LLM vision) TikTok uploader on the anti-detect browser host."""

    def __init__(self, cookies: Optional[list[dict]] = None, headless: bool = True):
        self.cookies = cookies or []
        self.headless = headless

    def upload_video(
        self,
        video_path: str,
        caption: str = "",
        visibility: str = "everyone",
        num_retries: int = 1,
        website_link: Optional[str] = None,
        comment_link: Optional[str] = None,
    ) -> dict:
        from vision_agent import vision_agent_run

        if not os.path.exists(video_path):
            return {"success": False, "error": f"file not found: {video_path}"}

        last = "no agent output"
        for attempt in range(1, 3):
            task = _build_upload_task(video_path, caption, website_link, comment_link)
            result = vision_agent_run(
                task,
                cookies=self.cookies,
                max_steps=60,
                headless=self.headless,
                allowed_domains=["*.tiktok.com", "tiktok.com"],
                timeout_sec=1500,
                available_file_paths=[os.path.abspath(video_path)],
            )
            last = result or last
            ok = "POSTED_OK" in result and "LOGIN_FAILED" not in result
            detail = result[-400:] if result else "no agent output"
            print(f"  [vision tiktok] attempt {attempt}/2 {'OK' if ok else 'FAILED'}: {detail[:250]}")
            if ok:
                return {"success": True, "detail": detail}
            if "LOGIN_FAILED" in result:
                return {"success": False, "error": "login_failed"}
        return {"success": False, "detail": last[-400:] if last else "no agent output"}
