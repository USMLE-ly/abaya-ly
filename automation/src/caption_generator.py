import json
import re
import os
import random

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_PATH = os.path.join(ROOT_DIR, "config.json")

# Import Hermosi templates
from hermosi_templates import (
    generate_hermosi_caption,
    get_hermosi_hook,
    generate_story,
    generate_offer,
    get_hermosi_cta,
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
    Generate a full caption using Alex Hermosi's framework:
    Hook → Story/Proof → Offer → CTA → Link → Hashtags
    """
    config = load_config()
    hashtags = config.get("hashtags", [])
    website = config.get("brand", {}).get("website", "https://nadine.luxor.ly")

    return generate_hermosi_caption(product, hashtags, website)


# ── Structured caption: Hook → 3 bullets → URL → hashtags (with emoji) ──

HOOK_EMOJIS = ["👗", "🔥", "💃", "✨", "🌹"]
BULLET_EMOJIS = ["✨", "💎", "👗"]
PLATFORM_LIMITS = {
    "tiktok": 2200,
    "instagram": 2200,
    "facebook": 63000,
    "twitter": 275,
    "snapchat": 100,
}


def generate_structured_caption(product: dict) -> str:
    """
    Generate the approved caption format:
        <hook with emoji>
        ✨ bullet 1
        💎 bullet 2
        👗 bullet 3
        🔗 product URL
        #hashtags
    """
    config = load_config()
    website = config.get("brand", {}).get("website", "https://nadine.luxor.ly")
    hashtags_ar = config.get("hashtags", [])
    hashtags_en = config.get("hashtags_en", [])

    hook = f"{random.choice(HOOK_EMOJIS)} {get_hermosi_hook()}"

    highlights = product.get("highlights") or []
    bullets = [f"{e} {h}" for e, h in zip(BULLET_EMOJIS, highlights[:3])]
    if not bullets:
        bullets = [
            "✨ تصميم يجمع بين الأناقة والفخامة",
            "💎 خامات عالية الجودة",
            "👗 إطلالة لا تُنسى لكل مناسبة",
        ]

    url = f"{website}/product/{product['id']}"
    product_tags = [f"#{t}" for t in (product.get("tags") or [])[:6]]
    hashtag_str = " ".join((hashtags_ar + product_tags + hashtags_en)[:15])

    parts = [hook, "", *bullets, "", f"🔗 {url}", "", hashtag_str]
    return "\n".join(parts)


def adapt_caption(caption: str, platform: str) -> str:
    """Adapt the approved caption to a platform's length limits."""
    limit = PLATFORM_LIMITS.get(platform, 2200)
    if len(caption) <= limit:
        return caption
    if platform == "snapchat":
        # Keep only the hook + URL for short snap captions
        lines = [l for l in caption.splitlines() if l.strip()]
        hook = lines[0] if lines else "قطعة جديدة من نادين ✨"
        url = next((l for l in lines if l.startswith("🔗")), f"🔗 {load_config().get('brand', {}).get('website', 'https://nadine.luxor.ly')}/")
        return f"{hook}\n{url}"
    # Twitter: keep hook, bullets, URL — drop hashtags first, then trim
    lines = caption.splitlines()
    trimmed = []
    for l in lines:
        if l.startswith("#"):
            continue
        trimmed.append(l)
    out = "\n".join(trimmed)
    if len(out) > limit:
        out = out[: limit - 1].rstrip() + "…"
    return out



def list_products() -> list[dict]:
    """List all available products."""
    return get_all_products()
