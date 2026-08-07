import json
import os
import random
import time
from datetime import datetime

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_config() -> dict:
    with open(os.path.join(ROOT_DIR, "config.json"), "r", encoding="utf-8") as f:
        return json.load(f)


def get_platform_delay() -> int:
    """Get a random delay between platforms in minutes."""
    config = load_config()
    posting = config.get("posting", {})
    min_delay = posting.get("platform_delay_min", 5)
    max_delay = posting.get("platform_delay_max", 15)
    return random.randint(min_delay, max_delay)


def is_in_posting_window() -> bool:
    """Check if current time is within a posting window."""
    config = load_config()
    windows = config.get("posting", {}).get("time_windows", [])
    now = datetime.now()
    current_time = now.strftime("%H:%M")

    for window in windows:
        start, end = window.split("-")
        if start <= current_time <= end:
            return True
    return False


def should_post_now() -> bool:
    """Determine if we should post based on schedule and frequency."""
    return is_in_posting_window()


def get_today_post_count() -> int:
    """Get the number of posts made today from the log."""
    log_path = os.path.join(ROOT_DIR, "logs", "posts.json")
    if not os.path.exists(log_path):
        return 0

    with open(log_path, "r", encoding="utf-8") as f:
        logs = json.load(f)

    today = datetime.now().strftime("%Y-%m-%d")
    return sum(1 for entry in logs if entry.get("date", "").startswith(today))


def log_post(platform: str, video: str, product: str, status: str) -> None:
    """Log a post attempt. Never raises: a logging failure must not kill the
    multi-platform run (observed transient filesystem ENOSYS in containers)."""
    try:
        log_dir = os.path.join(ROOT_DIR, "logs")
        os.makedirs(log_dir, exist_ok=True)
        log_path = os.path.join(log_dir, "posts.json")

        if os.path.exists(log_path):
            with open(log_path, "r", encoding="utf-8") as f:
                logs = json.load(f)
        else:
            logs = []

        logs.append({
            "platform": platform,
            "video": video,
            "product": product,
            "status": status,
            "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        })

        with open(log_path, "w", encoding="utf-8") as f:
            json.dump(logs, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"  [!] Could not log post for {platform}: {e}")


def get_pending_posts() -> list[dict]:
    """Get posts that haven't been published yet."""
    queue_path = os.path.join(ROOT_DIR, "logs", "queue.json")
    if not os.path.exists(queue_path):
        return []
    with open(queue_path, "r", encoding="utf-8") as f:
        return json.load(f)


def add_to_queue(video_path: str, product_id: str, caption: str) -> None:
    """Add a post to the queue."""
    queue_path = os.path.join(ROOT_DIR, "logs", "queue.json")
    os.makedirs(os.path.dirname(queue_path), exist_ok=True)

    if os.path.exists(queue_path):
        with open(queue_path, "r", encoding="utf-8") as f:
            queue = json.load(f)
    else:
        queue = []

    queue.append({
        "video_path": video_path,
        "product_id": product_id,
        "caption": caption,
        "added_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "posted": False,
    })

    with open(queue_path, "w", encoding="utf-8") as f:
        json.dump(queue, f, indent=2, ensure_ascii=False)
