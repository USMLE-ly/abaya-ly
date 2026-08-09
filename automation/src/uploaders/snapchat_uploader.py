"""Snapchat uploader — deterministic Playwright controller + vision fallback.

Selenium/Firefox replacement: drives the anti-detect Chromium host
(browser_host: modern UA + masked webdriver + restored cookies) over CDP
against my.snapchat.com (Spotlight/Story upload). If the portal DOM shifts,
the browser-use vision agent (MiMo) takes over with the same cookies.
"""

import os
import time

_PORTAL_URL = "https://my.snapchat.com/"

class SnapchatLoginRequired(Exception):
    """Session is dead — portal redirects to a login/verification wall (OTP)."""

_FILE_INPUT_SELECTORS = [
    'input[type="file"]',
    'input[accept*="video"]',
    'input[type="file"][accept]',
]
_DESCRIPTION_SELECTORS = [
    'textarea[placeholder*="description" i]',
    'textarea[placeholder*="Add a" i]',
    'textarea[placeholder*="وصف" i]',
    'div[contenteditable="true"]',
    'textarea',
]
_POST_SELECTORS = [
    'button:has-text("Post to Snapchat")',
    'button:has-text("Post")',
    '//button[contains(text(), "Post to Snapchat")]',
    '//button[contains(text(), "Post")]',
]


def _build_snapchat_task(
    video_path: str,
    caption: str,
    dry_run: bool = False,
    page_url: str = _PORTAL_URL,
) -> str:
    """Prompt for the browser-use agent: post the video on Snapchat Spotlight."""
    caption_for_task = caption[:1500]
    post_step = (
        "7. Click the Post button ('Post to Snapchat' / 'Post').\n"
        "8. Wait for the success confirmation ('Yay!' / 'live!').\n"
        "9. On the very last line report exactly: SC_POSTED_OK, plus one short sentence.\n"
    ) if not dry_run else (
        "7. STOP NOW — dry run. Do NOT click Post, do NOT publish anything.\n"
        "8. On the very last line report exactly: SC_DRY_RUN_READY, plus one short sentence.\n"
    )
    return f"""You are logged in to Snapchat's web creator portal. Post a video to Spotlight.

1. Go to {page_url}.
2. If you see a login/verification screen instead of the portal, reply with
   exactly SC_LOGIN_FAILED and stop.
3. Find the file input and upload the video "{video_path}" (use the
   upload_file action with that exact path).
4. Wait for the video to finish uploading/processing.
5. Click the description field and type this exact caption, replace nothing:
{caption_for_task}
6. If a 'Agree to Spotlight Terms' dialog appears, accept it.
{post_step}If you cannot complete a step, report SC_POST_FAILED with the reason on the last line.
"""


class SnapchatUploader:
    """Snapchat video uploader: deterministic Playwright + vision fallback."""

    PLATFORM_NAME = "snapchat"
    HOME_URL = "https://web.snapchat.com/"
    PORTAL_URL = _PORTAL_URL

    def __init__(self, headless: bool = True):
        self.headless = headless

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
            page = browser.contexts[0].pages[0]
            page.set_default_timeout(90000)

            # 1. Portal + login check. Snapchat serves the portal shell at
            # my.snapchat.com even when logged out, so URL checks are not
            # enough — look for the login/OTP form (or the upload input).
            page.goto(page_url, wait_until="domcontentloaded")
            time.sleep(6)
            url = page.url.lower()
            if "login" in url or "accounts.snapchat" in url:
                print("  [!] Snapchat portal requires login/OTP — session not restored")
                return False
            # Poll for the creator UI. Logged-in sessions show a file input;
            # dead sessions show a login/verification wall (sometimes rendered
            # only after the SPA boots). If neither appears, assume OTP-blocked
            # rather than burning the vision agent.
            login_wall = True
            deadline = time.time() + 45
            while time.time() < deadline:
                try:
                    if page.query_selector(_FILE_INPUT_SELECTORS[0]):
                        login_wall = False
                        break
                except Exception:
                    pass
                try:
                    wall = page.query_selector(
                        "input[type='email'], input[name='accountIdentifier'], "
                        "input[type='password'], input[name='code']"
                    )
                    if not wall:
                        body = page.evaluate(
                            "() => document.body ? (document.body.innerText || '') : ''"
                        )
                        wall = any(
                            t in body.lower()
                            for t in ("log in", "sign in", "verification", "تسجيل الدخول", "رمز التحقق")
                        )
                    if wall:
                        break
                except Exception:
                    pass
                time.sleep(3)
            if login_wall:
                print("  [!] Snapchat portal shows a login/verification screen — OTP required")
                raise SnapchatLoginRequired("OTP/verification required")
            print("  [snapchat] portal open, session restored")

            # 2. Attach video
            try:
                fi = None
                for sel in _FILE_INPUT_SELECTORS:
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
            print("  [snapchat] video attached, waiting for upload/processing...")
            time.sleep(12)

            # 3. Description
            typed = False
            deadline = time.time() + 60
            while time.time() < deadline:
                for sel in _DESCRIPTION_SELECTORS:
                    try:
                        field = page.wait_for_selector(sel, timeout=5000)
                        field.click()
                        time.sleep(1)
                        field.fill(caption[:1500])
                        typed = True
                        break
                    except Exception:
                        continue
                if typed:
                    break
                time.sleep(3)
            if not typed:
                print("  [!] could not set description")
                return False
            print("  [snapchat] description set")
            time.sleep(1)

            # 4. Agree to Spotlight terms if the dialog appears
            try:
                agree = page.locator('button:has-text("Agree to Spotlight Terms")')
                if agree.count() and agree.first.is_visible():
                    agree.first.click(timeout=8000)
                    time.sleep(1)
            except Exception:
                pass

            if dry_run:
                page.screenshot(path="/tmp/sc_browseruse_ready.png")
                print("  [snapchat] DRY RUN — compose ready, video attached, "
                      "caption set. Post NOT clicked (verification only).")
                return True

            # 5. Click Post (poll until enabled)
            clicked = False
            deadline = time.time() + 120
            while time.time() < deadline:
                for sel in _POST_SELECTORS:
                    try:
                        btn = page.wait_for_selector(sel, timeout=6000)
                        btn.click(timeout=8000)
                        clicked = True
                        break
                    except Exception:
                        continue
                if clicked:
                    break
                time.sleep(3)
            if not clicked:
                print("  [!] Post button never became clickable")
                return False
            print("  [snapchat] Post clicked, waiting for confirmation...")

            # 6. Success confirmation (upload+processing can be slow)
            ok = False
            deadline = time.time() + 150
            while time.time() < deadline:
                try:
                    body = page.evaluate("() => document.body ? document.body.innerText : ''")
                    if "Yay!" in body or "live!" in body:
                        ok = True
                        break
                    # Composer closed / portal navigated away counts as posted
                    if "my.snapchat.com" not in page.url and page.url:
                        ok = True
                        break
                except Exception:
                    pass
                time.sleep(5)
            print(f"  [snapchat] confirmation {'seen' if ok else 'not seen (may still process)'}")
            return ok
        except SnapchatLoginRequired:
            # Propagate so publish() can skip the vision fallback.
            raise
        except Exception as e:
            print(f"  [✗] snapchat playwright error: {e}")
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

        task = _build_snapchat_task(video_path, caption, dry_run=dry_run, page_url=page_url)
        result = vision_agent_run(
            task,
            platform=self.PLATFORM_NAME,
            max_steps=60,
            headless=self.headless,
            allowed_domains=[
                "*.snapchat.com", "snapchat.com", "web.snapchat.com",
                "accounts.snapchat.com", "my.snapchat.com",
            ],
            timeout_sec=1500,
            available_file_paths=[os.path.abspath(video_path)],
        ) or ""
        detail = result[-400:] if result else "no agent output"
        print(f"  [snapchat vision] {detail[:250]}")

        if dry_run:
            ok = "SC_DRY_RUN_READY" in result and "SC_LOGIN_FAILED" not in result
        else:
            ok = (
                "SC_POSTED_OK" in result
                and "SC_POST_FAILED" not in result
                and "SC_LOGIN_FAILED" not in result
            )
        print(f"  [{'✓' if ok else '✗'}] snapchat vision "
              f"{'ready (dry run)' if dry_run else 'posted successfully' if ok else 'failed'}")
        return ok

    def publish(
        self,
        video_path: str,
        caption: str = "",
        page_url: str = "",
        dry_run: bool = False,
    ) -> bool:
        """Post a video to Snapchat. dry_run verifies without posting."""
        if not os.path.exists(video_path):
            print(f"  [!] Video not found: {video_path}")
            return False
        target = page_url or self.PORTAL_URL
        try:
            if self._publish_playwright(video_path, caption, target, dry_run=dry_run):
                return True
        except SnapchatLoginRequired as le:
            print(f"  [!] {le} — skipping vision fallback (OTP must be refreshed "
                  "via snapchat_otp_login.py)")
            return False
        print("  [!] playwright path failed — trying browser-use vision fallback")
        return self._publish_vision(video_path, caption, target, dry_run=dry_run)
