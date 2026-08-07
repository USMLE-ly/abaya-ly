"""Instagram uploader — instagrapi (private API via the sessionid cookie).

This is the stable, no-browser path for posting Reels and Stories. It reuses
the sessionid already exported in cookies/instagram.json, so no login flow or
2FA is needed while that session stays valid.
"""

import os
from typing import Optional

from .cookies import extract_cookie


class InstagramUploader:
    """Upload Reels/Stories to Instagram with instagrapi."""

    def __init__(self, sessionid: Optional[str] = None, cookies_file: Optional[str] = None):
        self.sessionid = sessionid
        if not self.sessionid and cookies_file:
            self.sessionid = self._load_sessionid(cookies_file)
        self._client = None

    @staticmethod
    def _load_sessionid(cookies_file: str) -> Optional[str]:
        import json

        with open(cookies_file, "r", encoding="utf-8") as f:
            cookies = json.load(f)
        return extract_cookie(cookies, "sessionid")

    @property
    def client(self):
        if self._client is None:
            if not self.sessionid:
                raise RuntimeError(
                    "InstagramUploader needs a sessionid (pass sessionid= or cookies_file=)"
                )
            from instagrapi import Client

            client = Client()
            client.login_by_sessionid(self.sessionid)
            self._client = client
        return self._client

    def account_info(self) -> dict:
        """Return the logged-in account's username/id (used for smoke tests)."""
        info = self.client.account_info()
        return {"username": info.username, "pk": str(info.pk)}

    def upload_reel(self, video_path: str, caption: str = "") -> dict:
        """Upload a video as a Reel. Returns pk and public URL."""
        if not os.path.exists(video_path):
            raise FileNotFoundError(video_path)
        media = self.client.clip_upload(os.path.abspath(video_path), caption[:2200])
        return {
            "pk": str(media.pk),
            "url": f"https://www.instagram.com/reel/{media.pk}/",
        }

    def upload_story(self, video_path: str, caption: str = "") -> dict:
        """Upload a video to Stories (expires after 24h)."""
        if not os.path.exists(video_path):
            raise FileNotFoundError(video_path)
        media = self.client.clip_upload_to_story(os.path.abspath(video_path), caption[:2200])
        return {
            "pk": str(media.pk),
            "url": f"https://www.instagram.com/stories/highlights/{media.pk}/",
        }
