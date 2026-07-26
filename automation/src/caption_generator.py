import json
import re
import os
import random

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_PATH = os.path.join(ROOT_DIR, "config.json")


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


HOOK_QUESTIONS = [
    "سألتي الفستان اللي يخلّي كل العيون عليك؟",
    "تبحثين عن القطعة اللي تخلّيكِ الأشيك بالمناسبة؟",
    "شوفي هالتصميم وبعدين قولي ما عجبكِ؟",
    "القطعة اللي كل بنت تتمنى تلبسها؟",
    "تبي تتألقي بأقل مجهود؟ هذي هي الحل",
    "شوفيها وبعدين قولي ما تبينها؟",
    "التصميم اللي ما حد يقدر يقاومه",
    "تبحثين عن إطلالة تخطف الأنظار؟",
    "هذي القطعة غيرت كل شي في خزانتي",
    "الفساتين اللي الكل يسأل عنها؟",
    "تبي تكونين الأشيك بدون مجهود؟",
    "شوفي هالجمال وبعدين قولي لا",
    "القطعة اللي تخلي أي مناسبة özel",
    "تبحثين عن شي يجمع الأناقة والفخامة؟",
    "التصميم اللي ي speaking for itself",
]


def generate_hook() -> str:
    """Generate a random hook question."""
    return random.choice(HOOK_QUESTIONS)


def generate_caption(product: dict) -> str:
    """Generate a full caption for a product."""
    config = load_config()
    hashtags = config.get("hashtags", [])
    website = config.get("brand", {}).get("website", "https://nadine.luxor.ly")

    hook = generate_hook()

    highlights = product.get("highlights", [])
    if len(highlights) >= 3:
        points = highlights[:3]
    elif len(highlights) > 0:
        points = highlights
        while len(points) < 3:
            points.append(highlights[0])
    else:
        points = [
            f"تصميم فاخر بقماش {product.get('description', 'مميز').split('—')[-1].strip() if '—' in product.get('description', '') else 'عالي الجودة'}",
            f"مناسب لجميع المناسبات",
            f"متوفر بعدة ألوان ومقاسات",
        ]

    link = f"{website}/product/{product['id']}"
    hashtag_str = " ".join(hashtags)

    caption = f"{hook}\n\n"
    for point in points:
        caption += f"✅ {point}\n"
    caption += f"\n👉 {link}\n\n"
    caption += hashtag_str

    return caption


def list_products() -> list[dict]:
    """List all available products."""
    return get_all_products()
