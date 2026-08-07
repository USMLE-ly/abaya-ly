"""Anti-detect Chromium host for the vision agent.

The platform cookies only restore a real session when the browser looks like a
normal desktop Chrome: modern UA, `navigator.webdriver` masked, and cookies
added through Playwright's context API. browser-use's own Chromium launch gets
fingerprinted by TikTok/Facebook and the session is dropped, so we launch the
proven config here, expose a CDP port, and let the browser-use Agent drive it.

Runs as a subprocess (keeps the Playwright sync event loop out of the agent's
asyncio loop). CPU-only rendering: `--disable-gpu` + SwiftShader, no GPU.
"""

import json
import os
import socket
import subprocess
import sys
import time
import urllib.request

# Same modern UA the working tiktok-uploader path uses — session cookies are
# bound to it.
MODERN_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
)

SRC_DIR = os.path.dirname(os.path.abspath(__file__))

_HANDLES = {}


def find_free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


_HOST_CODE = r"""
import sys, time
sys.path.insert(0, __SRC_DIR__)
from cookie_manager import load_cookies
from uploaders.cookies import to_playwright_cookies
from browser_host import MODERN_UA

from playwright.sync_api import sync_playwright

platform_name, port, keepalive_sec = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
cookies = load_cookies(platform_name)
pw_cookies = to_playwright_cookies(cookies, default_domain="")
print(f"[browser_host] {platform_name}: {len(pw_cookies)} cookies -> port {port}", flush=True)

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=[
            "--disable-blink-features=AutomationControlled",
            f"--remote-debugging-port={port}",
            "--remote-debugging-address=127.0.0.1",
            "--disable-gpu",
            "--use-gl=swiftshader",
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--disable-features=DialMediaRouteProvider,DnsOverHttps,AsyncDns",
        ],
    )
    ctx = browser.new_context(
        viewport={"width": 1280, "height": 720},
        user_agent=MODERN_UA,
        locale="en-US",
    )
    ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', { get: () => undefined });")
    if pw_cookies:
        ctx.add_cookies(pw_cookies)
    page = ctx.new_page()
    page.set_default_timeout(90000)
    print("[browser_host] READY", flush=True)
    time.sleep(keepalive_sec)
    browser.close()
"""


def launch(
    platform_name: str,
    cookies: list[dict] | None = None,
    port: int | None = None,
    headless: bool = True,
    keepalive_sec: int = 60 * 60,
) -> subprocess.Popen:
    """Launch the anti-detect chromium in a subprocess. Returns the process."""
    port = port or find_free_port()
    code = _HOST_CODE.replace("__SRC_DIR__", repr(SRC_DIR))
    env = dict(os.environ)
    env["PYTHONUNBUFFERED"] = "1"
    proc = subprocess.Popen(
        [sys.executable, "-c", code, platform_name, str(port), str(keepalive_sec)],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        env=env,
    )
    _HANDLES[proc.pid] = port
    return proc


def wait_for_cdp(port: int, timeout_sec: int = 90) -> bool:
    """Block until the CDP endpoint answers on the port."""
    deadline = time.time() + timeout_sec
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(
                f"http://127.0.0.1:{port}/json/version", timeout=3
            ) as r:
                json.load(r)
                return True
        except Exception:
            time.sleep(2)
    return False


def stop(proc: subprocess.Popen) -> None:
    if not proc or proc.poll() is not None:
        return
    try:
        proc.terminate()
        proc.wait(timeout=10)
    except Exception:
        try:
            proc.kill()
        except Exception:
            pass


def launch_and_wait(
    platform_name: str,
    cookies: list[dict] | None = None,
    keepalive_sec: int = 60 * 60,
) -> tuple[subprocess.Popen, int] | None:
    """Launch and wait for CDP; returns (proc, port) or None on failure."""
    proc = launch(platform_name, cookies=cookies, keepalive_sec=keepalive_sec)
    port = _HANDLES.get(proc.pid)
    if port and wait_for_cdp(port):
        return proc, port
    stop(proc)
    return None
