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
    """Get all products from the website data."""
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


def list_products() -> list[dict]:
    """List all available products."""
    return get_all_products()
