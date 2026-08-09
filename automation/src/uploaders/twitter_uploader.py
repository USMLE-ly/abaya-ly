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


def _tweet_marker(caption: str) -> str:
    """A short unique substring to find this tweet on the timeline.

    X renders links as cards, so the URL is NOT present in the tweet text
    innerText — always match on the first text (hook) line. X also strips the
    leading emoji from tweetText innerText, so the marker must start at the
    first real character, not the emoji.
    """
    import re
    first = next(
        (l.strip() for l in caption.splitlines()
         if l.strip() and not l.startswith("#") and not l.startswith("http")),
        "",
    )
    if first:
        m = re.search(r"[\u0600-\u06FF\u0041-\u005A\u0061-\u007A]", first)
        if m:
            return first[m.start():m.start() + 40]
        return first[:40]
    url = next((l.strip() for l in caption.splitlines() if l.strip().startswith("http")), "")
    return url[:40]


def _verify_on_timeline(page, caption: str) -> bool:
    """Navigate to the profile and look for the posted tweet (caption/URL)."""
    import re
    marker = _tweet_marker(caption)
    try:
        href = page.eval_on_selector(
            'a[data-testid="AppTabBar_Profile_Link"]',
            'a => a.getAttribute("href")',
        )
    except Exception:
        href = None
    if not href or not href.startswith("/"):
        print("  [twitter] could not resolve profile handle for verification")
        return False
    try:
        page.goto(f"https://x.com{href}", wait_until="domcontentloaded", timeout=60000)
    except Exception as e:
        print(f"  [twitter] profile navigation failed: {e}")
        return False
    deadline = time.time() + 30
    while time.time() < deadline:
        try:
            texts = page.evaluate(
                "() => [...document.querySelectorAll('article [data-testid=\"tweetText\"]')]"
                ".map(e => e.innerText || '')"
            )
            if any(marker in (t or "") for t in texts):
                return True
        except Exception:
            pass
        time.sleep(4)
    return False


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

            # 5. Click Post (only when enabled — a force-click on a disabled
            # button while the video is still processing silently does nothing,
            # and the video can take a few minutes to process).
            clicked = False
            saw_button = False
            last_click_error = ""
            deadline = time.time() + 300
            while time.time() < deadline:
                for sel in _POST_SELECTORS:
                    try:
                        if sel.startswith("//"):
                            btn = page.wait_for_selector(sel, timeout=6000)
                        else:
                            btn = page.wait_for_selector(sel, timeout=6000)
                        saw_button = True
                        try:
                            clickable = btn.is_enabled()
                        except Exception:
                            clickable = False
                        if clickable:
                            try:
                                btn.click(timeout=8000)
                                clicked = True
                                break
                            except Exception as e:
                                last_click_error = str(e)[:200]
                    except Exception:
                        continue
                if clicked:
                    break
                time.sleep(3)
            if not saw_button:
                print("  [!] Post button never appeared in the composer")
            elif not clicked:
                if last_click_error:
                    print(f"  [!] Post click error: {last_click_error}")
                print("  [!] Post button never became enabled (video may still be processing)")
            if not clicked:
                return False
            print("  [twitter] Post clicked, waiting for confirmation...")

            # 6. Confirm: compose closes / back on timeline. X keeps the
            # composer open briefly after posting, so if it does not close we
            # re-click (a second Post click is harmless on a closed composer)
            # and finally verify the tweet on the profile timeline before
            # ever declaring failure — never start a duplicate draft blindly.
            ok = False
            for attempt in range(3):
                deadline = time.time() + 45
                while time.time() < deadline:
                    try:
                        if not page.query_selector(
                            'div[data-testid="tweetTextarea_0"], '
                            'div[data-testid="tweetButtonInline"]'
                        ):
                            ok = True
                            break
                        if "compose" not in page.url:
                            ok = True
                            break
                    except Exception:
                        pass
                    time.sleep(3)
                if ok:
                    break
                # One more Post click if the button is still present/enabled
                try:
                    btn = page.locator('button[data-testid="tweetButtonInline"], '
                                       'button[data-testid="tweetButton"]').last
                    if btn.count() and btn.is_enabled():
                        btn.click(timeout=8000)
                        print(f"  [twitter] re-clicked Post (attempt {attempt + 1}/3)")
                    else:
                        break
                except Exception:
                    break
            if not ok:
                print("  [twitter] composer still open — verifying on profile timeline...")
                ok = _verify_on_timeline(page, caption)
                if ok:
                    print("  [twitter] tweet verified on profile timeline")
                    return True
                return "post_clicked"
            return True
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
        outcome = self._publish_playwright(video_path, caption, target, dry_run=dry_run)
        if outcome is True:
            return True
        if outcome == "post_clicked":
            # Post was clicked and the timeline check could not confirm the
            # tweet. Never run the vision agent here — it would start a second
            # draft and risk a duplicate. Report failure and let the caller
            # decide (manual re-check).
            print("  [!] twitter Post clicked but unconfirmed — "
                  "NOT retrying via vision (duplicate risk)")
            return False
        print("  [!] playwright path failed — trying browser-use vision fallback")
        return self._publish_vision(video_path, caption, target, dry_run=dry_run)
