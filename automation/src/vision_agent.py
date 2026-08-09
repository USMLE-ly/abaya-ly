"""Vision-fallback agent — browser-use + MiMo 2.5 (OpenAI-compatible).

Drives an LLM agent that *sees* the page and clicks/types the right element,
so publish flows survive platform DOM changes. The browser is the anti-detect
chromium from browser_host (modern UA + masked webdriver + cookies), launched
with a CDP port; browser-use's Agent attaches over CDP instead of launching
its own (fingerprinted) Chromium.

MiMo 2.5 does not fully honor OpenAI strict JSON-schema mode: it sometimes
emits a stray `screenshot` field inside action objects, which browser-use's
strict pydantic models reject. MiMoChatOpenAI repairs the JSON before
validation and skips response_format (which MiMo's proxy mangles).
"""

import asyncio
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

MIMO_API_KEY = os.environ.get("MIMO_API_KEY", "sk-soyioi19tp33vyydfgyqwfk9akkgzuotzqcbfdlyjear6h92")
MIMO_BASE_URL = "https://api.xiaomimimo.com/v1"
MIMO_MODEL = "mimo-v2.5"

_DEFAULT_COOKIE_WHITELIST = [
    ".facebook.com", "facebook.com", "www.facebook.com",
    ".instagram.com", "instagram.com",
    ".snapchat.com", "snapchat.com", "web.snapchat.com", "accounts.snapchat.com",
    ".tiktok.com", "tiktok.com",
]


_ACTION_KEYS = {
    "click", "input", "upload_file", "done", "wait", "navigate", "scroll",
    "send_keys", "switch", "close", "extract", "search", "go_back",
    "dropdown_options", "select_dropdown", "save_as_pdf", "write_file",
    "replace_file", "read_file", "evaluate", "find_text",
}


def _find_json_object(text: str) -> dict | None:
    """Locate the first balanced JSON object inside free-form text."""
    start = text.find("{")
    if start == -1:
        return None
    depth = 0
    in_str = False
    esc = False
    for i in range(start, len(text)):
        c = text[i]
        if in_str:
            if esc:
                esc = False
            elif c == "\\":
                esc = True
            elif c == '"':
                in_str = False
            continue
        if c == '"':
            in_str = True
        elif c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(text[start:i + 1])
                except Exception:
                    return None
    return None


def _repair_agent_output(raw: str) -> str:
    """Repair MiMo's structured output into the schema browser-use expects.

    MiMo emits several shapes that pydantic rejects: markdown fences around the
    JSON, a stray top-level `screenshot` field, a bare action dict like
    {"click": 1081} instead of the {"action": [...]} list, `file_path` instead
    of `path` for upload_file, or {"wait": 3000} instead of {"wait": {"seconds": 3}}.
    """
    text = raw.strip()
    if text.startswith("```"):
        # strip ```json ... ``` fences MiMo sometimes wraps output in
        text = text.split("```", 2)[1] if text.count("```") >= 2 else text
        text = text.strip()
        if text.startswith("json"):
            text = text[4:].strip()
    try:
        data = json.loads(text)
    except Exception:
        data = _find_json_object(text)
    if not isinstance(data, dict):
        return raw
    data.pop("screenshot", None)

    # Bare action dict from MiMo: {"click": 1081} / {"upload_file": {...}}
    if "action" not in data:
        bare = {k: v for k, v in data.items() if k in _ACTION_KEYS}
        if bare:
            data = {"action": [{k: v} for k, v in bare.items()]}

    if isinstance(data.get("action"), list):
        cleaned = []
        for a in data["action"]:
            if not isinstance(a, dict):
                continue
            a = {k: v for k, v in a.items() if k != "screenshot"}
            # upload_file: file_path -> path; normalize index
            if "upload_file" in a and isinstance(a["upload_file"], dict):
                uf = dict(a["upload_file"])
                if "file_path" in uf and "path" not in uf:
                    uf["path"] = uf.pop("file_path")
                if isinstance(uf.get("index"), str):
                    try:
                        uf["index"] = int(uf["index"])
                    except ValueError:
                        pass
                a["upload_file"] = uf
            # click/scroll with a bare index
            for key in ("click", "scroll"):
                if key in a and isinstance(a[key], (int, str)):
                    a[key] = {"index": a[key]}
            # MiMo sometimes emits {"wait": 3000} instead of {"wait": {"seconds": 3}}
            if "wait" in a and isinstance(a["wait"], (int, float)):
                a["wait"] = {"seconds": max(1, int(a["wait"]) // 1000 or 1)}
            if a:
                cleaned.append(a)
        data["action"] = cleaned
    return json.dumps(data, ensure_ascii=False)


class MiMoChatOpenAI:
    """browser-use ChatOpenAI drop-in that repairs MiMo's structured output.

    Implements the same interface (provider/model/ainvoke) without depending on
    response_format, since MiMo's proxy does not reliably enforce it.
    """

    provider = "openai"

    def __init__(
        self,
        model: str = MIMO_MODEL,
        api_key: str = MIMO_API_KEY,
        base_url: str = MIMO_BASE_URL,
        temperature: float = 0.1,
        max_completion_tokens: int | None = 4096,
        max_retries: int = 5,
        **kwargs,
    ):
        self.model = model
        self.api_key = api_key
        self.base_url = base_url
        self.temperature = temperature
        self.max_completion_tokens = max_completion_tokens
        self.max_retries = max_retries

    def get_client(self):
        from openai import AsyncOpenAI

        return AsyncOpenAI(
            api_key=self.api_key,
            base_url=self.base_url,
            max_retries=self.max_retries,
            timeout=180,
        )

    @property
    def name(self) -> str:
        return str(self.model)

    @property
    def model_name(self) -> str:
        return str(self.model)

    async def ainvoke(self, messages, output_format=None, **kwargs):
        from browser_use.llm.exceptions import ModelOutputTruncatedError, ModelProviderError
        from browser_use.llm.openai.serializer import OpenAIMessageSerializer
        from browser_use.llm.views import ChatInvokeCompletion

        openai_messages = OpenAIMessageSerializer.serialize_messages(messages)

        model_params = {
            "temperature": self.temperature,
            "max_completion_tokens": self.max_completion_tokens,
        }
        try:
            response = await self.get_client().chat.completions.create(
                model=self.model,
                messages=openai_messages,
                **model_params,
            )
        except Exception as e:
            raise ModelProviderError(message=str(e), model=self.name) from e

        choice = response.choices[0] if response.choices else None
        if choice is None:
            raise ModelProviderError(
                message="MiMo returned an empty completion",
                status_code=502,
                model=self.name,
            )
        if choice.finish_reason == "length":
            raise ModelOutputTruncatedError(
                message="MiMo output truncated (finish_reason=length)",
                model=self.name,
            )
        content = choice.message.content
        if not content:
            raise ModelProviderError(
                message="MiMo returned no content",
                status_code=500,
                model=self.name,
            )

        if output_format is None:
            return ChatInvokeCompletion(
                completion=content,
                usage=None,
                stop_reason=choice.finish_reason,
            )

        cleaned = _repair_agent_output(content)
        try:
            parsed = output_format.model_validate_json(cleaned)
        except Exception as e:
            raise ModelProviderError(
                message=f"Failed to parse MiMo structured output: {e}",
                status_code=500,
                model=self.name,
            )
        usage = None
        if response.usage is not None:
            from browser_use.llm.views import ChatInvokeUsage

            usage = ChatInvokeUsage(
                prompt_tokens=response.usage.prompt_tokens,
                prompt_cached_tokens=getattr(
                    response.usage.prompt_tokens_details, "cached_tokens", None
                ),
                prompt_cache_creation_tokens=None,
                prompt_image_tokens=None,
                completion_tokens=response.usage.completion_tokens,
                total_tokens=response.usage.total_tokens,
            )
        return ChatInvokeCompletion(
            completion=parsed,
            usage=usage,
            stop_reason=choice.finish_reason,
        )


async def _run_agent(
    task: str,
    cdp_url: str,
    available_file_paths: list[str] | None = None,
    max_steps: int = 30,
    allowed_domains: list[str] | None = None,
) -> str:
    from browser_use.agent.service import Agent
    from browser_use.agent.views import AgentSettings
    from browser_use.browser.session import BrowserSession

    llm = MiMoChatOpenAI()

    session = BrowserSession(cdp_url=cdp_url, headless=True, cross_origin_iframes=True)
    await session.start()

    settings = AgentSettings(
        llm_timeout=120,
        max_failures=8,
        use_judge=False,
        enable_planning=True,
    )
    agent = Agent(
        task=task,
        llm=llm,
        browser_session=session,
        available_file_paths=available_file_paths or [],
        settings=settings,
    )
    try:
        result = await agent.run(max_steps=max_steps)
        return str(result)
    finally:
        try:
            await session.kill()
        except Exception:
            pass


def vision_agent_run(
    task: str,
    platform: str | None = None,
    cookies: list[dict] | None = None,
    max_steps: int = 30,
    headless: bool = True,
    allowed_domains: list[str] | None = None,
    timeout_sec: int = 600,
    available_file_paths: list[str] | None = None,
) -> str:
    """Launch the anti-detect browser host and run the LLM agent against it.

    `platform` names the cookie file (tiktok/facebook/snapchat/...); `cookies`
    can be passed explicitly instead. Returns the agent's final text.
    """
    import browser_host
    from cookie_manager import load_cookies

    if cookies is None and platform:
        cookies = load_cookies(platform)

    launched = browser_host.launch_and_wait(
        platform or "browser", cookies=cookies, keepalive_sec=timeout_sec + 300
    )
    if not launched:
        return "FAILED: could not launch anti-detect browser host"
    proc, port = launched

    def _inner() -> str:
        return _run_agent(
            task,
            cdp_url=f"http://127.0.0.1:{port}",
            available_file_paths=available_file_paths,
            max_steps=max_steps,
            allowed_domains=allowed_domains,
        )

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        return loop.run_until_complete(
            asyncio.wait_for(_inner(), timeout=timeout_sec)
        )
    finally:
        try:
            loop.close()
        except Exception:
            pass
        browser_host.stop(proc)
