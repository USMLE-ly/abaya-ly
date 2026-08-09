"""Facebook uploader — Playwright controller + browser-use vision fallback.

The primary path is a deterministic Playwright controller driving the same
anti-detect Chromium host (cookies restored, webdriver masked) over CDP —
adapted from the ByamB4/fb-group-auto-post pattern (fill() on the composer's
contenteditable + aria-label Post click). Playwright's fill() works on
contenteditable boxes, unlike Selenium's textContent get_attribute which
throws on RTL/emoji text. If the DOM shifts, the browser-use LLM vision agent
takes over and finishes the post with the same cookies.
"""

import os
import time

_COMPOSER_SELECTORS = [
    'div[aria-label="Create a post"]',
    'div[aria-label="إنشاء منشور"]',
    'div[role="button"]:has(span:text("Photo/video"))',
    'div[aria-label="Photo/video"]',
    '//div[@role="button" and contains(., "Photo/video")]',
]
_CAPTION_SELECTORS = [
    'div[role="dialog"] div[contenteditable="true"]',
    'div[role="dialog"] div[role="textbox"]',
]
_POST_SELECTORS = [
    'div[role="dialog"] div[aria-label="Post"]',
    'div[role="dialog"] div[aria-label="نشر"]',
    'div[role="dialog"] button:has-text("Post")',
    '//div[@role="dialog"]//div[@aria-label="Post"]',
    '//div[@role="dialog"]//div[@aria-label="نشر"]',
]


def _build_fb_task(
    video_path: str,
    caption: str,
    dry_run: bool = False,
    page_url: str = "https://www.facebook.com/",
) -> str:
    """Prompt for the browser-use agent: create the video post on Facebook."""
    caption_for_task = caption[:2000]
    post_step = (
        "6. Click the Post button (not 'Save draft'). The button may be disabled "
        "while the video processes — wait for it to become clickable.\n"
        "7. Wait for the post confirmation / the feed to show the new post.\n"
        "8. On the very last line report exactly: FB_POSTED_OK, plus one short sentence.\n"
    ) if not dry_run else (
        "6. STOP NOW — dry run. Do NOT click Post, do NOT publish anything.\n"
        "7. On the very last line report exactly: FB_DRY_RUN_READY, plus one short sentence.\n"
    )
    return f"""You are logged in to Facebook. Create a video post.

1. Go to {page_url}.
2. If you see an account chooser page with a 'Continue as ...' / 'Continue' /
   'متابعة' button, click it first (this is NOT a failure — the session is
   valid, Facebook just asks which profile to use). Only if you see a real
   login form (email + password fields) reply with exactly FB_LOGIN_FAILED
   and stop.
3. Click 'Photo/video' (or the equivalent create-post button) to open the composer.
4. Upload the video file "{video_path}" — find the file input / upload control and
   upload it (use the upload_file action with that exact path).
5. Wait until the video preview appears and the upload finishes; then type this
   exact caption into the caption box (the field that says something like
   'Say something about this video' — replace nothing, type it as-is):
{caption_for_task}
{post_step}If you cannot complete a step, report FB_POST_FAILED with the reason on the last line.
"""


class FacebookUploader:
    """Facebook video uploader: deterministic Playwright + vision fallback."""

    PLATFORM_NAME = "facebook"
    HOME_URL = "https://www.facebook.com/"

    def __init__(self, headless: bool = True, page_url: str = ""):
        self.headless = headless
        self.page_url = page_url or self.HOME_URL

    # ------------------------------------------------------------------ #
    # Deterministic Playwright controller (primary)                      #
    # ------------------------------------------------------------------ #
    def _publish_playwright(
        self,
        video_path: str,
        caption: str,
        page_url: str,
        dry_run: bool = False,
    ) -> bool:
        import browser_host
        from playwright.sync_api import sync_playwright

        launched = browser_host.launch_and_wait(
            self.PLATFORM_NAME, keepalive_sec=60 * 30
        )
        if not launched:
            print("  [!] Could not launch anti-detect browser host")
            return False
        proc, port = launched
        pw = None
        try:
            pw = sync_playwright().start()
            browser = pw.chromium.connect_over_cdp(f"http://127.0.0.1:{port}")
            context = browser.contexts[0]
            page = context.pages[0]
            page.set_default_timeout(90000)

            # 1. Home + login check. Facebook sometimes shows an account
            # chooser ("Continue as ...") even with valid cookies — click
            # through it instead of treating it as a login failure.
            page.goto(page_url, wait_until="domcontentloaded")
            time.sleep(4)
            url = page.url
            if "/login" in url or "checkpoint" in url:
                print("  [!] facebook login screen — session not restored")
                return False
            for _ in range(3):
                cont = None
                for sel in (
                    'div[aria-label="Continue Nadine Luxor"]',
                    'div[role="button"][aria-label^="Continue"]',
                    'div[role="button"][aria-label^="متابعة"]',
                    'button:has-text("Continue")',
                    'div[role="button"]:has-text("Continue")',
                ):
                    try:
                        loc = page.locator(sel).first
                        if loc.count() and loc.is_visible():
                            cont = loc
                            break
                    except Exception:
                        continue
                if cont is None:
                    break
                try:
                    cont.click(timeout=6000)
                    print("  [facebook] clicked account chooser Continue")
                except Exception:
                    # Button disappeared mid-click (chooser already dismissed)
                    break
                # Wait for the chooser to clear before the next iteration.
                try:
                    page.locator('div[aria-label^="Continue"]').first.wait_for(
                        state="detached", timeout=15000
                    )
                except Exception:
                    pass
                time.sleep(2)
            # After the chooser, Facebook sometimes shows a
            # "Remove profiles from this browser" modal that blocks the
            # composer — dismiss any such dialog before proceeding.
            for _ in range(3):
                dismissed = False
                for sel in (
                    'div[role="dialog"] div[aria-label="Close"]',
                    'div[role="dialog"] button[aria-label="Close"]',
                    'div[role="dialog"] div[aria-label="إغلاق"]',
                    'div[role="dialog"] div[aria-label="Cancel"]',
                    'div[role="dialog"] div[aria-label="إلغاء"]',
                    'div[role="dialog"] div[role="button"]:has-text("Not now")',
                ):
                    try:
                        loc = page.locator(sel).first
                        if loc.count() and loc.is_visible():
                            loc.click(timeout=5000)
                            print("  [facebook] dismissed blocking dialog")
                            dismissed = True
                            break
                    except Exception:
                        continue
                if not dismissed:
                    break
                time.sleep(3)
            print("  [facebook] logged in")

            # 2. Open composer
            opened = False
            for sel in _COMPOSER_SELECTORS:
                try:
                    if sel.startswith("//"):
                        page.click(sel, timeout=8000)
                    else:
                        page.click(sel, timeout=8000)
                    opened = True
                    break
                except Exception:
                    continue
            if not opened:
                print("  [!] could not open composer")
                return False
            time.sleep(4)

            # 3. Attach video. Facebook keeps a hidden global file input plus a
            # dialog-scoped one; wait_for_selector (visible) can stall on the
            # hidden common input, so wait for "attached" and prefer the input
            # inside the composer dialog (fall back to the last input found).
            try:
                dialog_input = page.locator('div[role="dialog"] input[type="file"]')
                fi = None
                try:
                    dialog_input.first.wait_for(state="attached", timeout=8000)
                    fi = dialog_input.first
                except Exception:
                    page.wait_for_selector(
                        'input[type="file"]', state="attached", timeout=15000
                    )
                    fi = page.locator('input[type="file"]').last
                fi.set_input_files(video_path)
            except Exception as e:
                print(f"  [!] could not attach video: {e}")
                return False
            print("  [facebook] video attached, waiting for preview...")

            # 4. Wait for preview (video element / upload finishing)
            preview_seen = False
            deadline = time.time() + 120
            while time.time() < deadline:
                try:
                    if page.query_selector(
                        'div[role="dialog"] video, '
                        'div[role="dialog"] img[src*="video"]'
                    ):
                        preview_seen = True
                        break
                except Exception:
                    pass
                time.sleep(3)
            if not preview_seen:
                print("  [!] no video preview appeared — aborting")
                return False
            print("  [facebook] video preview confirmed")

            # 5. Caption via Playwright (contenteditable-safe). The caption box
            # can be covered by the video-processing overlay for a while —
            # scroll it in, force-click if intercepted, and fall back to
            # select-all + keyboard typing for FB's lexical editor.
            typed = False
            last_cap_err = ""
            deadline = time.time() + 180
            while time.time() < deadline:
                for sel in _CAPTION_SELECTORS:
                    try:
                        field = page.wait_for_selector(sel, timeout=5000)
                        try:
                            field.scroll_into_view_if_needed(timeout=3000)
                        except Exception:
                            pass
                        try:
                            field.click(timeout=3000)
                        except Exception:
                            field.click(force=True, timeout=3000)
                        time.sleep(1)
                        try:
                            field.fill(caption)
                        except Exception as e:
                            last_cap_err = str(e)[:160]
                            page.keyboard.press("Control+A")
                            page.keyboard.type(caption, delay=2)
                        typed = True
                        break
                    except Exception:
                        continue
                if typed:
                    break
                time.sleep(3)
            if not typed:
                print(f"  [!] could not set caption ({last_cap_err or 'no field'})")
                return False
            print("  [facebook] caption set")
            time.sleep(2)

            if dry_run:
                page.screenshot(path="/tmp/fb_browseruse_ready.png")
                print("  [facebook] DRY RUN — composer ready, video attached, "
                      "caption set. Post NOT clicked (verification only).")
                return True

            # 6. Click Post. Diagnostic: the button enables ~15s after attach
            # and normal click() times out on an invisible overlay — force-click
            # works, BUT if the video is still processing FB silently ignores
            # it and the composer stays open. So after each force-click, verify
            # the composer actually closed (Post button gone); if not, retry.
            closed = False
            saw_button = False
            attempts = 0
            deadline = time.time() + 300
            while time.time() < deadline:
                btn = None
                for sel in _POST_SELECTORS:
                    try:
                        b = page.wait_for_selector(sel, timeout=6000)
                        if b:
                            btn = b
                            break
                    except Exception:
                        continue
                if btn is not None:
                    saw_button = True
                    clickable = False
                    try:
                        clickable = btn.is_enabled()
                    except Exception:
                        pass
                    if clickable or attempts >= 3:
                        try:
                            btn.click(force=True, timeout=8000)
                            attempts += 1
                            # Give FB a beat to accept + start closing
                            time.sleep(6)
                            if not page.query_selector(
                                'div[role="dialog"] div[aria-label="Post"], '
                                'div[role="dialog"] div[aria-label="نشر"]'
                            ):
                                closed = True
                                break
                            print(f"  [facebook] Post click #{attempts} ignored "
                                  "(video still processing?) — retrying")
                        except Exception as e:
                            print(f"  [facebook] Post force-click failed: {str(e)[:160]}")
                time.sleep(3)
            if not saw_button:
                print("  [!] Post button never appeared in the dialog")
            elif not closed:
                print("  [!] Post button clicks never closed the composer")
            if not closed:
                return False
            print("  [facebook] Post clicked, composer closed — confirming...")

            # 7. Confirm: wait for the success toast / profile post signal.
            ok = False
            deadline = time.time() + 60
            while time.time() < deadline:
                try:
                    if page.query_selector(
                        'div[aria-label*="تم نشر"], div[aria-label*="post is live"], '
                        'div[role="status"]:has-text("Post"), '
                        'div[role="alert"]:has-text("تم نشر")'
                    ):
                        ok = True
                        break
                except Exception:
                    pass
                time.sleep(3)
            print("  [facebook] composer closed"
                  + (" + success toast" if ok else " (toast not seen)"))
            return True  # composer closed => post submitted
        except Exception as e:
            print(f"  [✗] facebook playwright error: {e}")
            return False
        finally:
            if pw:
                try:
                    pw.stop()
                except Exception:
                    pass
            browser_host.stop(proc)

    # ------------------------------------------------------------------ #
    # browser-use vision fallback                                        #
    # ------------------------------------------------------------------ #
    def _publish_vision(
        self,
        video_path: str,
        caption: str,
        page_url: str,
        dry_run: bool = False,
    ) -> bool:
        from vision_agent import vision_agent_run

        task = _build_fb_task(video_path, caption, dry_run=dry_run, page_url=page_url)
        result = vision_agent_run(
            task,
            platform=self.PLATFORM_NAME,
            max_steps=60,
            headless=self.headless,
            allowed_domains=["*.facebook.com", "facebook.com"],
            timeout_sec=1500,
            available_file_paths=[os.path.abspath(video_path)],
        ) or ""
        detail = result[-400:] if result else "no agent output"
        print(f"  [facebook vision] {detail[:250]}")

        if dry_run:
            ok = "FB_DRY_RUN_READY" in result and "FB_LOGIN_FAILED" not in result
        else:
            ok = (
                "FB_POSTED_OK" in result
                and "FB_POST_FAILED" not in result
                and "FB_LOGIN_FAILED" not in result
            )
        print(f"  [{'✓' if ok else '✗'}] facebook vision "
              f"{'ready (dry run)' if dry_run else 'posted successfully' if ok else 'failed'}")
        return ok

    def publish(
        self,
        video_path: str,
        caption: str = "",
        page_url: str = "",
        dry_run: bool = False,
    ) -> bool:
        """Create a video post on Facebook. dry_run verifies without posting."""
        if not os.path.exists(video_path):
            print(f"  [!] Video not found: {video_path}")
            return False
        target = page_url or self.page_url
        if self._publish_playwright(video_path, caption, target, dry_run=dry_run):
            return True
        print("  [!] playwright path failed — trying browser-use vision fallback")
        return self._publish_vision(video_path, caption, target, dry_run=dry_run)
