import json
import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def get_cookies_path(platform: str) -> str:
    """Get the cookie file path for a platform."""
    return os.path.join(ROOT_DIR, "cookies", f"{platform}.json")


def load_cookies(platform: str) -> list[dict]:
    """Load cookies for a platform."""
    path = get_cookies_path(platform)
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_cookies(platform: str, cookies: list[dict]) -> None:
    """Save cookies for a platform."""
    path = get_cookies_path(platform)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(cookies, f, indent=2, ensure_ascii=False)


def has_valid_cookies(platform: str) -> bool:
    """Check if valid cookies exist for a platform."""
    cookies = load_cookies(platform)
    return len(cookies) > 0


def import_cookies_from_json(platform: str, json_path: str) -> bool:
    """Import cookies from a JSON file."""
    if not os.path.exists(json_path):
        return False
    with open(json_path, "r", encoding="utf-8") as f:
        cookies = json.load(f)
    save_cookies(platform, cookies)
    return True
