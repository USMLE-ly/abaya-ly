"""Instagram uploader — instagrapi (private API via the sessionid cookie).

This is the stable, no-browser path for posting Reels and Stories. It reuses
the sessionid already exported in cookies/instagram.json, so no login flow or
2FA is needed while that session stays valid.

Link stickers:
- Reels: Instagram's "Add link" on Reels is account-gated and app-only; we
  send the link in the configure payload as a best-effort. If the account
  rejects it, the upload retries without the link (reel still posts).
- Stories: native link stickers via StoryLink (clickable "See More").
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

    def upload_reel(self, video_path: str, caption: str = "", link: Optional[str] = None) -> dict:
        """Upload a video as a Reel.

        When ``link`` is given, we attempt Instagram's Reel link (Add link).
        Only accounts Instagram has enabled the feature for will accept it —
        otherwise we retry without the link and the reel still posts.
        """
        if not os.path.exists(video_path):
            raise FileNotFoundError(video_path)
        from instagrapi.exceptions import ClientError as IGClientError

        if link:
            try:
                media = self.client.clip_upload(
                    os.path.abspath(video_path),
                    caption[:2200],
                    extra_data={"link": link},
                )
                return {
                    "pk": str(media.pk),
                    "url": f"https://www.instagram.com/reel/{media.pk}/",
                    "link": link,
                }
            except (IGClientError, Exception) as e:
                print(f"  [!] Reel link rejected ({e}) — retrying without link")
        media = self.client.clip_upload(os.path.abspath(video_path), caption[:2200])
        return {
            "pk": str(media.pk),
            "url": f"https://www.instagram.com/reel/{media.pk}/",
        }

    def comment(self, media_pk: str, text: str) -> dict:
        """Post a comment on a reel (e.g. the product link)."""
        comment = self.client.media_comment(media_pk, text[:2200])
        return {"pk": str(comment.pk)}

    def upload_story(self, video_path: str, caption: str = "", link: Optional[str] = None) -> dict:
        """Upload a video to Stories (expires after 24h).

        When ``link`` is given, attaches a clickable link sticker (StoryLink).
        """
        if not os.path.exists(video_path):
            raise FileNotFoundError(video_path)
        from instagrapi.types import StoryLink

        links = [StoryLink(webUri=link)] if link else []
        media = self.client.video_upload_to_story(
            os.path.abspath(video_path),
            caption[:2200],
            links=links,
        )
        return {
            "pk": str(media.pk),
            "url": f"https://www.instagram.com/stories/highlights/{media.pk}/",
            "link": link,
        }
