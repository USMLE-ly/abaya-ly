"""Snapchat has no web-upload path, so cookie automation is not possible.

This publisher writes the ready-to-paste caption to a file and prints
instructions — the video + caption are handed to the user for a manual post
in the Snapchat mobile app (Spotlight/Story).
"""

import os
from .base_publisher import BasePublisher


class SnapchatPublisher(BasePublisher):
    """Manual fallback: produces the caption file, never opens a browser."""

    PLATFORM_NAME = "snapchat"
    HOME_URL = "https://web.snapchat.com/"

    def publish(self, video_path: str, caption: str) -> bool:
        out_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "content")
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, "snapchat_caption.txt")
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(caption + "\n")
        print(f"  [Snapchat] Manual post required (no web upload path).")
        print(f"  [Snapchat] Caption ready → {out_path}")
        print(f"  [Snapchat] Post the video + caption in the app (Spotlight/Story).")
        return False  # intentionally manual — orchestrator logs status "manual"

    def run(self, video_path: str, caption: str) -> bool:
        return self.publish(video_path, caption)
