import random
import os
import json

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


# ═══════════════════════════════════════════════════════════════
# ALEX HERMOSI COPYWRITING FRAMEWORKS — Arabic Fashion Adapted
# Based on: "The Reason You're Struggling Is Because..." frameworks
# ═══════════════════════════════════════════════════════════════

# ─── HOOK TEMPLATES (Hermosi's curiosity/desire triggers) ───
# These follow Hermosi's principle: "The hook must make them feel
# something before they think something"

HOOK_TEMPLATES = [
    # Hermosi's "The reason you..." pattern
    "السبب اللي يخليكي تدورين على فستان جديد وما تلقينه؟",
    "السبب اللي يخليكي تلبسين فستان وتحسين إنه مو أنتِ؟",
    "السبب اللي يخلي كل فستان يبان عليه الرخيص حتى لو غالي؟",

    # Hermosi's "Most people don't realize..." pattern
    "معظم الناس ما يدرون إن الفستان الصح يغير إطلالة كاملة",
    "معظم البنات تلبسين نفس الألوان بدون ما تدرين إن فيه شي يخليكي غير",
    "ما تدرين إن فيه فستان يخلّي كل العيون عليك بدون ما تتكلمين",

    # Hermosi's "What if I told you..." pattern
    "وين لو قلتلك إن فيه فستان يجمع الأناقة والفخامة بقطعة واحدة؟",
    "وين لو قلتلك إن فيه تصميم يخليكي الأشيك بالمناسبة بدون مجهود؟",
    "وين لو قلتلك إن فيه قطعة غيرت كل شي في خزانتي؟",

    # Hermosi's "You've been lied to" pattern
    "كذبوا عليكي إن الفستان الغالي لازم يكون أحلى",
    "كذبوا عليكي إن التصميم المحتشم ما يكون شيك",
    "كذبوا عليكي إن الموضة لازم تتبعينها مو تختارينها",

    # Hermosi's desire trigger pattern
    "تبي تتألقي بأقل مجهود؟ هذي هي الحل",
    "تبي تكونين الأشيك بدون ما تتكلمين؟",
    "تبي القطعة اللي تخلي كل بنت تسألك وين لقيتيها؟",

    # Hermosi's problem-agitation pattern
    "كل مرة تشترين فستان جديد وتبان عليه إطلالة قديمة؟",
    "كل مرة تلبسين شي وتحسين إنه مو أنتِ؟",
    "كل مرة تدورين على التصميم الصح وما تلقينه؟",
    # ── Hormozi frameworks ($100M Leads) ──
    # Curiosity gap
    "السبب اللي يخلّي كل وحدة تسألك وين لقيتي هالفسطان؟",
    "السر اللي ما تقوله مصممات الأزياء عن إطلالات السهرة",
    # Specific claim / number (lists & steps)
    "3 أسباب تخليك تختارين هذا التصميم الليلة",
    "5 تفاصيل تخلي هذا الفستان يخطف الأنظار",
    # How-to / transformation
    "وين لو قلتلك إن فيه فستان يخلّي كل العيون عليك بدون مجهود؟",
    "كيف تكونين الأشيك بالمناسبة بدون ما تتكلمين",
    # Story opener
    "تخيّلي تدخلين المناسبة وكل العيون عليك…",
    "تخيّلي تلبسين قطعة تجمع الأناقة والفخامة بثقة كاملة",
    # Pattern interrupt
    "كذبوا عليكي إن الفستان الغالي لازم يكون أحلى",
    "ما تدرين إن الفستان الصح يغيّر إطلالة كاملة",
]


# ─── STORY/PROOF TEMPLATES (Hermosi's "here's why" pattern) ───
# These follow Hermosi's principle: "Show them proof, not promises"

def generate_story(product: dict) -> str:
    """Generate a story/proof paragraph using Hermosi's framework."""
    name = product.get("name", "هذا الفستان")
    highlights = product.get("highlights", [])
    price = product.get("price", "?")
    description = product.get("description", "")

    # Hermosi's "Imagine this" pattern
    story_templates = [
        f"تخيّلي تلبسين {name} وتدخلين على أي مناسبة، الكل يسألك وين لقيتيه. {highlights[0] if highlights else 'تصميم يخطف الأنظار.'}",
        f" {name} من نادين — {highlights[1] if len(highlights) > 1 else 'قطعه تجمع بين الأناقة والفخامة.'} لما تلبسيه، الكل يحس إنه غيرتي.",
        f" {highlights[0] if highlights else 'تصميم فاخر.'} {highlights[2] if len(highlights) > 2 else 'هذا الفستان مو مجرد قطعة، هو إطلالة كاملة.'}",
        f"تخيّلي إطلالة تجمع بين {highlights[0] if highlights else 'الأناقة'} و{highlights[1] if len(highlights) > 1 else 'الفخامة'}. {name} من نادين يعطيك هالشي بالضبط.",
    ]


    # ── Hormozi value equation: dream outcome + likelihood + low effort ──
    story_templates += [
        f"تخيّلي {name} على إطلالتك بالمناسبة، والكل يسألك وين لقيتيه. {highlights[0] if highlights else 'تصميم يخطف الأنظار.'}",
        f"{name} من نادين — خامة فاخرة وترقّي ينبع من التفاصيل. {highlights[1] if len(highlights) > 1 else 'قطعة تجمع بين الأناقة والفخامة.'}",
        f"من مجموعة {product.get('collection', 'نادين')} — {highlights[0] if highlights else 'تصميم يليق بكِ'}. شحن مجاني خلال 3-5 أيام، واطلبيها بضغطة زر.",
    ]

    return random.choice(story_templates).strip()


# ─── OFFER TEMPLATES (Hermosi's value stacking) ───
# These follow Hermosi's principle: "Stack the value until the price feels small"

def generate_offer(product: dict) -> str:
    """Generate an offer using Hermosi's value stacking."""
    name = product.get("name", "هذا الفستان")
    price = product.get("price", "?")
    highlights = product.get("highlights", [])

    offer_templates = [
        f"بس {price} د.ل والقطعه هذي تبيّن إطلالة بآلاف الدولارات. مو بس فستان، إطلالة كاملة.",
        f"السعر؟ {price} د.ل بس. الإطلالة؟ تشبه فساتين العارضات. القيمة؟ لا تُقدّر بثمن.",
        f"بـ {price} د.ل تاخذين قطعة تجمع {highlights[0] if highlights else 'الأناقة'} و{highlights[1] if len(highlights) > 1 else 'الفخامة'}. هذي مو مناسبة، هذي استثمار في إطلالتك.",
        f" {price} د.ل بس عشان تكونين الأشيك بالمناسبة. مو بس فستان، هو ثقة تلبسينها.",
    ]


    # ── Hormozi grand slam: value × exclusivity × price anchor ──
    original = product.get("originalPrice")
    if original and original > price:
        offer_templates += [
            f"بس {price} د.ل بدل {original} د.ل — إصدار 2026 حصري من نادين. القيمة لا تُقدّر بثمن.",
            f"بـ {price} د.ل بدل {original} د.ل، تاخذين قطعة {highlights[0] if highlights else 'أنيقة'} من مجموعة حصرية. استثمار في إطلالتك.",
        ]
    else:
        offer_templates += [
            f"بس {price} د.ل والقطعة هذي تبيّن إطلالة بآلاف الدولارات. إصدار 2026 حصري.",
        ]

    return random.choice(offer_templates).strip()


# ─── CTA TEMPLATES (Hermosi's direct action commands) ───
# These follow Hermosi's principle: "Tell them exactly what to do next"

CTA_TEMPLATES = [
    "اطلبيه الحين قبل ما يخلص",
    "القطعة هذي ما تنتظرك، اطلبيها الحين",
    "لا تفوّتينها — اطلبيه قبل ما يخلص",
    "الحين مو بكرة، اطلبيه الحين",
    "افتحي الرابط الحين واختاري مقاسك",
    "تريدينها؟ اطلبيها الحين قبل ما يخلص",
    "القطع محدودة، اطلبي الحين",
    "لا تفكرين مرتين — اطلبيه الحين",
    # ── Hormozi CTA rules: clear, direct, single ask, short time-to-act ──
    "اطلبيها الحين من الرابط 👇",
    "الرابط تحت — اطلبي مقاسك بضغطة زر",
    "اطلبيها قبل ما تخلص — القطع محدودة",
]


def get_hermosi_hook() -> str:
    """Get a random Hermosi-style hook."""
    return random.choice(HOOK_TEMPLATES)


def get_hermosi_cta() -> str:
    """Get a random Hermosi-style CTA."""
    return random.choice(CTA_TEMPLATES)


def generate_hermosi_caption(product: dict, hashtags: list[str], website: str) -> str:
    """
    Generate a full caption using Alex Hermosi's complete framework:
    Hook → Story/Proof → Offer → CTA → Link → Hashtags
    """
    hook = get_hermosi_hook()
    story = generate_story(product)
    offer = generate_offer(product)
    cta = get_hermosi_cta()
    link = f"{website}/product/{product['id']}"
    hashtag_str = " ".join(hashtags)

    caption = f"{hook}\n\n"
    caption += f"📖 {story}\n\n"
    caption += f"💎 {offer}\n\n"
    caption += f"👉 {cta}\n\n"
    caption += f"👉 {link}\n\n"
    caption += hashtag_str

    return caption
