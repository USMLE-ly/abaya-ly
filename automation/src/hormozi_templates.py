"""Hormozi caption engine for Nadine — built from the books.

Frameworks applied (from $100M Offers / $100M Leads / $100M Money Models):
- Value Equation: dream outcome up, likelihood up, time delay down, effort down.
- Hook types: curiosity gap, specific claim, avatar call-out, story opener,
  pattern interrupt, conflict, What-Who-When (status + timeline).
- Grand Slam Offer: stack value + exclusivity + price anchor + guarantee.
- No fabrication: every fact comes from the product record or store policy.
"""
import random

# ────────────────────────────────────────────────────────────────────────────
# Hook bank — product-aware. Each hook uses real fields (collection, fabric,
# model, category) and speaks to the avatar (صاحبة المناسبة، العروس، إطلالة
# السهرة). From $100M Leads: the hook must promise a reward, not a greeting.
# ────────────────────────────────────────────────────────────────────────────

HOOK_TEMPLATES = [
    # Curiosity gap
    "السبب اللي يخلّي كل وحدة تسألك وين لقيتي فستانك؟",
    "السر اللي ما تقوله مصممات الأزياء عن إطلالات السهرة",
    "السبب اللي يخلّي كل العيون تلتفت ليكِ بدون ما تتكلمين؟",
    # Avatar call-out (relevancy)
    "لكل صاحبة مناسبة قريبة — هذا فستانك",
    "إذا عندكِ مناسبة كبرى بالشهر الجاي… هذي تخصك",
    "لصاحبات السهرات الكبرى: قطعة واحدة تكفي",
    # Specific claim / number
    "3 تفاصيل تخلي هذا الفستان يخطف الأنظار",
    "تفصيلة واحدة تفرّق بين فستان عادي وفستان يُذكَر",
    # How-to / transformation
    "وين لو قلتلك إن فيه فستان يخلّي كل العيون عليكِ بدون مجهود؟",
    "كيف تكونين الأشيك بالمناسبة بدون ما تتكلمين",
    # Story opener
    "تخيّلي تدخلين المناسبة وكل العيون عليكِ…",
    "تخيّلي لحظة دخولك وصاحباتك يسألون بعضهم: من وين هالإطلالة؟",
    # Pattern interrupt
    "كذبوا عليكي إن الفستان الغالي لازم يكون أحلى",
    "ما تدرين إن الفستان الصح يغيّر إطلالة كاملة",
    # Conflict
    "وش الفرق بين فستان يخطف الأنظار وفستان يمر مرور الكرام؟",
    # Yes-question callout
    "عندكِ مناسبة قريبة وما لقيتي الفستان اللي يمثلك؟",
    # What-Who-When (status + timeline)
    "بعد شهر من اليوم، وين بتتذكرين إنك شفتي هذا الفستان؟",
]

# Product-specific hook builders — each uses only real product fields.
def _product_hooks(p: dict) -> list[str]:
    collection = p.get("collection") or "نادين"
    fabric = p.get("fabric") or ""
    model = p.get("model") or ""
    category = p.get("category") or ""
    hooks = []

    if collection:
        hooks.append(f"من مجموعة {collection} — قطعة وحدة تخلّي كل العيون عليكِ")
        hooks.append(f"السبب اللي يخلّي كل وحدة تسألك وين لقيتي فستان {collection}؟")
    if fabric:
        hooks.append(f"وين لو قلتلك إن {fabric} يفرّق بين إطلالة عادية وإطلالة تُذكَر؟")
        hooks.append(f"{fabric} حقيقي — الخامة اللي تحسّين فيها الفرق قبل ما تشوفينه")
    if model:
        hooks.append(f"تخيّلي فستان {model} على إطلالتك بالمناسبة…")
    if category:
        hooks.append(f"لكل مناسبة {category} — هذا فستانك")
    return hooks


def _stable_index(text: str, n: int) -> int:
    """Deterministic index from a string — same product, same hook every time."""
    import zlib
    return zlib.crc32(text.encode("utf-8")) % n if n else 0


def get_hormozi_hook(product: dict | None = None) -> str:
    """Return a hook: deterministic and product-specific when data exists,
    else a stable pick from the core bank."""
    if product:
        specific = _product_hooks(product)
        if specific:
            return specific[_stable_index(product.get("id") or "nadine", len(specific))]
    return HOOK_TEMPLATES[_stable_index((product or {}).get("id") or "nadine", len(HOOK_TEMPLATES))]


# ────────────────────────────────────────────────────────────────────────────
# Value Equation bullets — exactly 3, each mapped to a lever and a real fact:
#   ✨ dream outcome (occasion + status)      → ↑ dream
#   💎 proof (fabric, collection, inspection) → ↑ likelihood
#   👗 fit/exclusivity (edition + COD) → ↓ effort
# ────────────────────────────────────────────────────────────────────────────

def _clean(text: str) -> str:
    return text.strip().rstrip(".").strip()


def build_hormozi_bullets(product: dict, b1_variant: int | None = None) -> list[tuple[str, str]]:
    """Return [(emoji, text)] — exactly three Value-Equation bullets.

    ``b1_variant`` cycles the dream-outcome phrasing (used by the 5-variant
    posting mode). When None, the choice is deterministic per product.
    """
    fabric = product.get("fabric") or ""
    collection = product.get("collection") or "نادين"
    category = product.get("category") or "المناسبة"
    highlights = product.get("highlights") or []
    name = product.get("name") or ""
    edition = "إصدار 2026" if "2026" in name else ""

    # Bullet 1 — dream outcome + status (from the occasion, not the garment).
    feature = _clean(highlights[0]) if highlights else ""
    if feature:
        b1_options = [
            f"تخيّلي إطلالتك بالمناسبة — {feature}. والكل يسألك من وين؟",
            f"{feature} — من أول لحظة تدخلين، كل العيون عليكِ",
            f"لحظة دخولك للمناسبة… {feature}. هذا اللي بيذكروه عنك",
        ]
        if b1_variant is None:
            b1 = b1_options[_stable_index(product.get("id") or "nadine", len(b1_options))]
        else:
            b1 = b1_options[b1_variant % len(b1_options)]
    else:
        b1 = f"تخيّلي إطلالتك بمناسبة {category} — إطلالة تخلّي الكل يسألك من وين؟"

    # Bullet 2 — proof: real fabric + collection + house inspection.
    if fabric:
        b2 = f"{fabric} من مجموعة {collection} — كل قطعة تُفحص يدوياً قبل الشحن"
    else:
        b2 = f"من مجموعة {collection} — كل قطعة تُفحص يدوياً قبل الشحن"

    # Bullet 3 — fit/exclusivity + payment ease + guarantee (reverse risk).
    edition_part = f"{edition} — " if edition else ""
    b3 = f"{edition_part}الدفع عند الاستلام"

    return [("✨", b1), ("💎", b2), ("👗", b3)]


# ────────────────────────────────────────────────────────────────────────────
# Offer (legacy full-caption path) — value stack with anchor + guarantee.
# ────────────────────────────────────────────────────────────────────────────

def generate_offer(product: dict) -> str:
    collection = product.get("collection") or "نادين"
    return (
        f"من مجموعة {collection} — إصدار محدود. "
        f"الدفع عند الاستلام."
    )


def generate_story(product: dict) -> str:
    """Dream-outcome story used by the legacy full-caption path."""
    name = product.get("model") or product.get("name") or "هذا الفستان"
    category = product.get("category") or "المناسبة"
    highlights = product.get("highlights") or []
    feature = _clean(highlights[0]) if highlights else "تصميم يليق بكِ"
    return (
        f"تخيّلي فستان {name} على إطلالتك بمناسبة {category} — {feature}. "
        f"لحظة دخولك، الكل يسألك من وين؟"
    )


# ────────────────────────────────────────────────────────────────────────────
# CTA — one clear ask (from $100M Leads: spell out the next action).
# ────────────────────────────────────────────────────────────────────────────

CTA_TEMPLATES = [
    "اطلبيها الحين من الرابط 👇",
    "الرابط تحت — اختاري مقاسك بضغطة زر",
    "افتحي الرابط الحين وقولي لنا مقاسك",
    "القطعة محدودة — اطلبيها قبل ما تخلص",
]


def get_hormozi_cta() -> str:
    return random.choice(CTA_TEMPLATES)


# ────────────────────────────────────────────────────────────────────────────
# Full caption — approved structure:
#   <hook with emoji>
#   ✨ bullet 1   💎 bullet 2   👗 bullet 3
#   🔗 URL
#   #hashtags
# ────────────────────────────────────────────────────────────────────────────

CATEGORY_EMOJI = {
    "السهرة": "💃",
    "خطوبة": "💍",
    "أعراس": "👰‍♀️",
    "سهرة": "💃",
}


def _variant_hook_pool(product: dict) -> list[str]:
    """Product hooks first, padded with core-bank hooks — deduped, stable order."""
    pool: list[str] = []
    seen: set[str] = set()
    for hook in _product_hooks(product) + HOOK_TEMPLATES:
        if hook not in seen:
            seen.add(hook)
            pool.append(hook)
    return pool


def generate_hormozi_caption_variants(
    product: dict,
    hashtags: list[str],
    website: str,
    n: int = 5,
) -> list[str]:
    """Return n distinct Hormozi captions for the same product.

    Each variant uses a different hook (product-aware first, core bank after)
    and a different dream-outcome phrasing; proof/exclusivity facts stay real
    and identical so every variant is truthful.
    """
    hooks = _variant_hook_pool(product)
    emoji = get_hook_emoji(product)
    url = f"{website}/product/{product['id']}"
    hashtag_str = " ".join(hashtags)

    variants = []
    for i in range(n):
        hook = hooks[i % len(hooks)]
        bullets = build_hormozi_bullets(product, b1_variant=i)
        lines = [f"{emoji} {hook}", ""]
        lines += [f"{e} {t}" for e, t in bullets]
        lines += ["", url, "", hashtag_str]
        variants.append("\n".join(lines))
    return variants


def get_hook_emoji(product: dict | None = None) -> str:
    if product:
        cat = (product.get("category") or "").strip()
        if cat in CATEGORY_EMOJI:
            return CATEGORY_EMOJI[cat]
    return random.choice(["👗", "🔥", "✨"])


def generate_hormozi_caption(product: dict, hashtags: list[str], website: str) -> str:
    """Full Hormozi caption: hook → 3 Value-Equation bullets → URL → hashtags."""
    hook = get_hormozi_hook(product)
    emoji = get_hook_emoji(product)
    bullets = build_hormozi_bullets(product)
    url = f"{website}/product/{product['id']}"

    lines = [f"{emoji} {hook}", ""]
    lines += [f"{e} {t}" for e, t in bullets]
    lines += ["", f"🔗 {url}", "", " ".join(hashtags)]
    return "\n".join(lines)
