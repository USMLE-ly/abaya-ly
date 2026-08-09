"""X/Twitter uploader — deterministic Playwright controller + vision fallback.

Selenium/Firefox replacement: drives the same anti-detect Chromium host
(browser_host: modern UA + masked webdriver + restored cookies) over CDP.
Playwright's fill() handles the contenteditable tweet box reliably (no
Firefox RTL/emoji get_attribute crashes). If the DOM shifts, the browser-use
vision agent (MiMo) takes over with the same cookies.
"""

import os
import time

_CAPTION_SELECTORS = [
    'div[data-testid="tweetTextarea_0"]',
    'div[role="textbox"]',
    'div[contenteditable="true"]',
]
_POST_SELECTORS = [
    'button[data-testid="tweetButtonInline"]',
    'button[data-testid="tweetButton"]',
    '//button[contains(text(), "Post")]',
]
_ATTACH_SELECTORS = [
    'input[data-testid="fileInput"]',
    'input[type="file"]',
]


def _build_twitter_task(video_path: str, caption: str, dry_run: bool = False) -> str:
    """Prompt for the browser-use agent: post a video tweet on X."""
    caption_for_task = caption[:2800]
    post_step = (
        "7. Click the Post button (tweetButton / 'Post').\n"
        "8. Wait for the compose dialog to close / the tweet to appear.\n"
        "9. On the very last line report exactly: TW_POSTED_OK, plus one short sentence.\n"
    ) if not dry_run else (
        "7. STOP NOW — dry run. Do NOT click Post, do NOT publish anything.\n"
        "8. On the very last line report exactly: TW_DRY_RUN_READY, plus one short sentence.\n"
    )
    return f"""You are logged in to X (Twitter). Create a video tweet.

1. Go to https://x.com/compose/post.
2. If you see the X login screen instead of the compose page, reply with
   exactly TW_LOGIN_FAILED and stop.
3. Upload the video file "{video_path}" — find the file input (input[data-testid="fileInput"]) and upload it (use the upload_file action with that exact path).
4. Wait until the video thumbnail/preview appears in the composer.
5. Click the text box (tweetTextarea) and type this exact caption, replace nothing:
{caption_for_task}
{post_step}If you cannot complete a step, report TW_POST_FAILED with the reason on the last line.
"""


class TwitterUploader:
    """X/Twitter video uploader: deterministic Playwright + vision fallback."""

    PLATFORM_NAME = "twitter"
    HOME_URL = "https://x.com/"
    COMPOSE_URL = "https://x.com/compose/post"

    def __init__(self, headless: bool = True, page_url: str = ""):
        self.headless = headless
        self.page_url = page_url or self.COMPOSE_URL

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

            # 1. Compose + login check
            page.goto(page_url, wait_until="domcontentloaded")
            time.sleep(5)
            url = page.url
            if "/login" in url or "flow/" in url:
                print("  [!] x.com login screen — session not restored")
                return False
            print("  [twitter] logged in / compose open")

            # 2. Attach video (hidden input is allowed)
            try:
                fi = None
                for sel in _ATTACH_SELECTORS:
                    try:
                        loc = page.locator(sel)
                        loc.first.wait_for(state="attached", timeout=8000)
                        fi = loc.first
                        break
                    except Exception:
                        continue
                if fi is None:
                    raise RuntimeError("no file input found")
                fi.set_input_files(video_path)
            except Exception as e:
                print(f"  [!] could not attach video: {e}")
                return False
            print("  [twitter] video attached, waiting for preview...")

            # 3. Wait for the media preview
            preview_seen = False
            deadline = time.time() + 60
            while time.time() < deadline:
                try:
                    if page.query_selector(
                        'div[data-testid="attachments"] video, '
                        'div[data-testid="attachments"] img, '
                        'video, img[src*="video"]'
                    ):
                        preview_seen = True
                        break
                except Exception:
                    pass
                time.sleep(2)
            if not preview_seen:
                print("  [!] no video preview appeared — aborting")
                return False
            print("  [twitter] video preview confirmed")

            # 4. Caption via Playwright fill() (contenteditable-safe)
            typed = False
            deadline = time.time() + 90
            while time.time() < deadline:
                for sel in _CAPTION_SELECTORS:
                    try:
                        field = page.wait_for_selector(sel, timeout=5000)
                        field.click()
                        time.sleep(1)
                        field.fill(caption)
                        typed = True
                        break
                    except Exception:
                        continue
                if typed:
                    break
                time.sleep(3)
            if not typed:
                print("  [!] could not set caption")
                return False
            print("  [twitter] caption set")
            time.sleep(2)

            if dry_run:
                page.screenshot(path="/tmp/tw_browseruse_ready.png")
                print("  [twitter] DRY RUN — compose ready, video attached, "
                      "caption set. Post NOT clicked (verification only).")
                return True

            # 5. Click Post (poll until enabled)
            clicked = False
            saw_button = False
            button_visible_since = None
            last_click_error = ""
            deadline = time.time() + 180
            while time.time() < deadline:
                for sel in _POST_SELECTORS:
                    try:
                        if sel.startswith("//"):
                            btn = page.wait_for_selector(sel, timeout=6000)
                        else:
                            btn = page.wait_for_selector(sel, timeout=6000)
                        saw_button = True
                        if button_visible_since is None:
                            button_visible_since = time.time()
                        clickable = False
                        try:
                            clickable = btn.is_enabled()
                        except Exception:
                            pass
                        if clickable:
                            try:
                                btn.click(timeout=8000)
                                clicked = True
                                break
                            except Exception as e:
                                last_click_error = str(e)[:200]
                        if time.time() - button_visible_since > 60:
                            if last_click_error:
                                print(f"  [twitter] last Post click error: {last_click_error}")
                            btn.click(force=True, timeout=8000)
                            clicked = True
                            break
                    except Exception:
                        continue
                if clicked:
                    break
                time.sleep(3)
            if not saw_button:
                print("  [!] Post button never appeared in the composer")
            elif not clicked:
                print("  [!] Post button never became clickable")
            if not clicked:
                return False
            print("  [twitter] Post clicked, waiting for confirmation...")

            # 6. Confirm: compose closes / back on timeline
            ok = False
            deadline = time.time() + 60
            while time.time() < deadline:
                try:
                    if not page.query_selector('div[data-testid="tweetTextarea_0"], div[data-testid="tweetButtonInline"]'):
                        ok = True
                        break
                    if "compose" not in page.url and page.query_selector('a[href="/home"]'):
                        ok = True
                        break
                except Exception:
                    pass
                time.sleep(3)
            return ok
        except Exception as e:
            print(f"  [✗] twitter playwright error: {e}")
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

        task = _build_twitter_task(video_path, caption, dry_run=dry_run)
        result = vision_agent_run(
            task,
            platform=self.PLATFORM_NAME,
            max_steps=60,
            headless=self.headless,
            allowed_domains=["*.x.com", "x.com", "twitter.com"],
            timeout_sec=1500,
            available_file_paths=[os.path.abspath(video_path)],
        ) or ""
        detail = result[-400:] if result else "no agent output"
        print(f"  [twitter vision] {detail[:250]}")

        if dry_run:
            ok = "TW_DRY_RUN_READY" in result and "TW_LOGIN_FAILED" not in result
        else:
            ok = (
                "TW_POSTED_OK" in result
                and "TW_POST_FAILED" not in result
                and "TW_LOGIN_FAILED" not in result
            )
        print(f"  [{'✓' if ok else '✗'}] twitter vision "
              f"{'ready (dry run)' if dry_run else 'posted successfully' if ok else 'failed'}")
        return ok

    def publish(
        self,
        video_path: str,
        caption: str = "",
        page_url: str = "",
        dry_run: bool = False,
    ) -> bool:
        """Post a video tweet. dry_run verifies without posting."""
        if not os.path.exists(video_path):
            print(f"  [!] Video not found: {video_path}")
            return False
        target = page_url or self.page_url
        if self._publish_playwright(video_path, caption, target, dry_run=dry_run):
            return True
        print("  [!] playwright path failed — trying browser-use vision fallback")
        return self._publish_vision(video_path, caption, target, dry_run=dry_run)
