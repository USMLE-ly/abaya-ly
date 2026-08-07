"""Cookie helpers shared by the uploader modules.

Our cookie files are exported in Cookie-Editor JSON format
(name/value/domain/path/expirationDate/httpOnly/secure/sameSite).
"""

from typing import Any


def extract_cookie(cookies: list[dict], name: str) -> str | None:
    """Return the value of the first cookie with the given name."""
    for raw in cookies:
        if raw.get("name") == name and raw.get("value"):
            return str(raw["value"])
    return None


def to_playwright_cookies(cookies: list[dict], default_domain: str = "") -> list[dict]:
    """Convert Cookie-Editor JSON cookies to Playwright add_cookies format.

    - `expirationDate`/`expiry`/`expires` → `expires`
    - drops cookies without name/value
    - keeps only sameSite values Playwright accepts
    """
    out: list[dict[str, Any]] = []
    for raw in cookies:
        name = raw.get("name")
        value = raw.get("value")
        if not name or value is None:
            continue
        pc: dict[str, Any] = {
            "name": name,
            "value": value,
            "domain": raw.get("domain") or default_domain,
            "path": raw.get("path") or "/",
        }
        exp = raw.get("expirationDate") or raw.get("expiry") or raw.get("expires")
        if exp:
            pc["expires"] = int(exp)
        if raw.get("sameSite") in ("Strict", "Lax", "None"):
            pc["sameSite"] = raw["sameSite"]
        if raw.get("secure"):
            pc["secure"] = True
        if raw.get("httpOnly"):
            pc["httpOnly"] = True
        out.append(pc)
    return out
