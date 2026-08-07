import json
import re
import os

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_PATH = os.path.join(ROOT_DIR, "config.json")

# Hormozi caption engine (built from $100M Offers / Leads / Money Models)
from hormozi_templates import (
    generate_hormozi_caption,
    get_hormozi_hook,
    generate_story,
    generate_offer,
    get_hormozi_cta,
    build_hormozi_bullets,
    get_hook_emoji,
)


def load_config() -> dict:
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def parse_products_ts(ts_path: str) -> list[dict]:
    """Parse the TypeScript products file and extract product data."""
    with open(ts_path, "r", encoding="utf-8") as f:
        content = f.read()

    products = []
    blocks = re.split(r'\{[\s\n]*id:\s*"', content)[1:]

    for block in blocks:
        product = {}

        id_match = re.search(r'^([^"]+)"', block)
        if id_match:
            product["id"] = id_match.group(1)

        name_match = re.search(r'name:\s*"([^"]+)"', block)
        if name_match:
            product["name"] = name_match.group(1)

        price_match = re.search(r'price:\s*(\d+)', block)
        if price_match:
            product["price"] = int(price_match.group(1))

        category_match = re.search(r'category:\s*"([^"]+)"', block)
        if category_match:
            product["category"] = category_match.group(1)

        desc_match = re.search(r'description:\s*"([^"]+)"', block)
        if desc_match:
            product["description"] = desc_match.group(1)

        highlights = re.findall(r'highlights:\s*\[(.*?)\]', block, re.DOTALL)
        if highlights:
            items = re.findall(r'"([^"]+)"', highlights[0])
            product["highlights"] = items

        if product.get("id") and product.get("name"):
            products.append(product)

    return products


def get_all_products() -> list[dict]:
    """Get all products — prefers the exported products.json (full fields)."""
    json_path = os.path.join(ROOT_DIR, "..", "public", "products.json")
    json_path = os.path.abspath(json_path)
    if os.path.exists(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    ts_path = os.path.join(ROOT_DIR, "..", "src", "data", "products.ts")
    ts_path = os.path.abspath(ts_path)
    if os.path.exists(ts_path):
        return parse_products_ts(ts_path)
    return []


def find_product_by_name(query: str) -> dict | None:
    """Find a product by name (partial match)."""
    products = get_all_products()
    query_lower = query.lower().strip()
    for p in products:
        if query_lower in p.get("name", "").lower():
            return p
    return None


def find_product_by_id(product_id: str) -> dict | None:
    """Find a product by ID."""
    products = get_all_products()
    for p in products:
        if p.get("id") == product_id:
            return p
    return None


def generate_caption(product: dict) -> str:
    """
    Generate a full caption using Hormozi's framework:
    Hook → 3 Value-Equation bullets → URL → Hashtags
    """
    config = load_config()
    hashtags = config.get("hashtags", [])
    website = config.get("brand", {}).get("website", "https://nadine.luxor.ly")

    return generate_hormozi_caption(product, hashtags, website)


# ── Structured caption: Hook → 3 bullets → URL → hashtags (with emoji) ──

PLATFORM_LIMITS = {
    "tiktok": 2200,
    "instagram": 2200,
    "facebook": 63000,
    "twitter": 275,
    "snapchat": 100,
}

# Instagram/TikTok don't make caption links clickable — point to the bio
# instead; the real link goes in the bio and as a comment on the post.
LINK_IN_BIO = "الرابط في البايو 👆"


def generate_structured_caption(product: dict) -> str:
    """
    Generate the approved caption format:
        <hook with emoji>
        ✨ bullet 1 — dream outcome
        💎 bullet 2 — proof
        👗 bullet 3 — fit / exclusivity / anchor
        🔗 product URL
        #hashtags
    """
    config = load_config()
    website = config.get("brand", {}).get("website", "https://nadine.luxor.ly")
    hashtags_ar = config.get("hashtags", [])
    hashtags_en = config.get("hashtags_en", [])

    hook = f"{get_hook_emoji(product)} {get_hormozi_hook(product)}"
    bullets = build_hormozi_bullets(product)

    url = f"{website}/product/{product['id']}"
    product_tags = [f"#{t}" for t in (product.get("tags") or [])[:6]]
    hashtag_str = " ".join((hashtags_ar + product_tags + hashtags_en)[:15])

    parts = [hook, "", *[f"{e} {t}" for e, t in bullets], "", url, "", hashtag_str]
    return "\n".join(parts)


def _is_url(line: str) -> bool:
    return line.strip().startswith("https://") or line.strip().startswith("http://")


def _caption_with_bio_note(caption: str) -> str:
    """Drop the URL line and insert the link-in-bio note before the hashtags."""
    body: list[str] = []
    hashtags: list[str] = []
    for line in caption.splitlines():
        if not line.strip():
            continue
        if _is_url(line):
            continue
        if line.startswith("#"):
            hashtags.append(line)
        else:
            body.append(line)
    parts = body + [LINK_IN_BIO]
    if hashtags:
        parts.append("")
        parts.extend(hashtags)
    return "\n".join(parts)


def adapt_caption(caption: str, platform: str) -> str:
    """Adapt the approved caption to a platform's length limits.

    Instagram/TikTok: the URL is removed from the caption and replaced by a
    link-in-bio note (captions there are not clickable; the URL goes to the
    bio and as a comment on the post).
    Twitter/X + Facebook + Snapchat: the full URL is always kept intact —
    trimming only ever removes hashtags or bullet lines, never the link.
    """
    if platform in ("instagram", "tiktok"):
        return _caption_with_bio_note(caption)

    limit = PLATFORM_LIMITS.get(platform, 2200)
    if len(caption) <= limit:
        return caption

    lines = [l for l in caption.splitlines() if l.strip() and not l.startswith("#")]
    url = next((l for l in lines if _is_url(l)), "")
    hook = lines[0] if lines else "قطعة جديدة من نادين ✨"
    bullets = [l for l in lines[1:] if l != url]

    if platform == "snapchat":
        # Keep only the hook + URL for short snap captions; trim hook if needed.
        out = f"{hook}\n{url}" if url else hook
        if len(out) > limit and url:
            room = max(0, limit - len(url) - 2)
            out = hook[:room].rstrip() + "…\n" + url
        return out

    if platform == "twitter":
        # Hook + full URL always fit; add as many bullets as fit above them.
        result = [hook]
        for b in bullets:
            candidate = result + [b, url]
            if len("\n".join(candidate)) <= limit:
                result.append(b)
            else:
                break
        result.append(url)
        out = "\n".join(result)
        # Last resort: if even hook + URL overflows, trim the hook only.
        if len(out) > limit:
            room = max(0, limit - len(url) - 1)
            out = hook[:room].rstrip() + "…\n" + url
        return out

    # Other platforms (2200 limit): drop hashtags, then bullets, keep URL.
    result = [hook]
    for b in bullets:
        candidate = result + [b, url]
        if len("\n".join(candidate)) <= limit:
            result.append(b)
        else:
            break
    result.append(url)
    return "\n".join(result)


def list_products() -> list[dict]:
    """List all available products."""
    return get_all_products()
