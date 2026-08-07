import os
import sys
import time

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT_DIR)

from caption_generator import (
    get_all_products,
    find_product_by_name,
    find_product_by_id,
    generate_structured_caption,
    generate_structured_caption_variants,
    adapt_caption,
)
from cookie_manager import has_valid_cookies
from scheduler import (
    log_post,
    get_platform_delay,
    should_post_now,
    get_today_post_count,
)
from publishers import (
    TikTokPublisher,
    InstagramPublisher,
    TwitterPublisher,
    FacebookPublisher,
    SnapchatPublisher,
)


# Future-plan default: 5 Hormozi captions per dress, pushed 5x at this gap.
VARIANT_POST_DELAY = 30  # seconds between caption pushes
VARIANT_COUNT = 5


def list_products():
    """Display all available products."""
    products = get_all_products()
    print("\n📦 Available Products:")
    print("-" * 60)
    for i, p in enumerate(products, 1):
        print(f"  {i}. {p['name']} ({p['id']}) — {p.get('price', '?')} د.ل")
    print("-" * 60)
    return products


def select_product():
    """Let user select a product."""
    products = list_products()
    query = input("\n🔍 Search product name or ID: ").strip()
    if not query:
        return None

    # Try by ID first
    product = find_product_by_id(query)
    if product:
        return product

    # Try by name
    product = find_product_by_name(query)
    if product:
        return product

    # Try numeric selection
    try:
        idx = int(query) - 1
        if 0 <= idx < len(products):
            return products[idx]
    except ValueError:
        pass

    print("❌ Product not found")
    return None


def select_video():
    """Let user select a video from the content folder."""
    content_dir = os.path.join(ROOT_DIR, "content")
    if not os.path.exists(content_dir):
        os.makedirs(content_dir, exist_ok=True)
        print(f"📁 Created content folder: {content_dir}")
        print("   Drop your MP4 videos here and restart.")
        return None

    videos = [
        f for f in os.listdir(content_dir)
        if f.lower().endswith(('.mp4', '.mov', '.avi'))
    ]

    if not videos:
        print("📁 No videos found in content/ folder.")
        print("   Drop your MP4 videos there and restart.")
        return None

    print("\n🎬 Available Videos:")
    print("-" * 40)
    for i, v in enumerate(videos, 1):
        size_mb = os.path.getsize(os.path.join(content_dir, v)) / (1024 * 1024)
        print(f"  {i}. {v} ({size_mb:.1f} MB)")
    print("-" * 40)

    choice = input("\n📎 Select video number: ").strip()
    try:
        idx = int(choice) - 1
        if 0 <= idx < len(videos):
            return os.path.join(content_dir, videos[idx])
    except ValueError:
        pass

    print("❌ Invalid selection")
    return None


def generate_and_show_variants(product, n=VARIANT_COUNT):
    """Generate n Hormozi captions for the same dress and show all for approval."""
    captions = generate_structured_caption_variants(product, n=n)

    print("\n" + "=" * 60)
    print(f"📝 {n} GENERATED CAPTIONS (same dress, {VARIANT_POST_DELAY}s apart):")
    print("=" * 60)
    for i, cap in enumerate(captions, 1):
        print(f"\n--- CAPTION {i}/{n} ---")
        print(cap)
    print("=" * 60)

    while True:
        choice = input("\n✅ Approve all? (y/n/edit-number): ").strip().lower()
        if choice == "y":
            return captions
        if choice == "n":
            return None
        if choice.startswith("edit"):
            # edit a single caption: edit2
            try:
                idx = int(choice.replace("edit", "")) - 1
                if 0 <= idx < len(captions):
                    print(f"\n✏️ Enter new caption {idx + 1} (blank line to finish):")
                    lines = []
                    while True:
                        line = input()
                        if line == "" and lines and lines[-1] == "":
                            break
                        lines.append(line)
                    if lines:
                        captions[idx] = "\n".join(lines[:-1]) if lines else captions[idx]
                    continue
            except ValueError:
                pass
            print("Invalid caption number — use edit1..edit5")
        else:
            print("Please enter y, n, or edit<number>")


def generate_and_show(product):
    """Generate caption (hook → bullets → URL → hashtags) and show for approval."""
    caption = generate_structured_caption(product)

    print("\n" + "=" * 60)
    print("📝 GENERATED CAPTION:")
    print("=" * 60)
    print(caption)
    print("=" * 60)

    while True:
        choice = input("\n✅ Approve? (y/n/edit): ").strip().lower()
        if choice == "y":
            return caption
        elif choice == "n":
            return None
        elif choice == "edit":
            print("\n✏️ Enter new caption (press Enter twice to finish):")
            lines = []
            while True:
                line = input()
                if line == "" and lines and lines[-1] == "":
                    break
                lines.append(line)
            return "\n".join(lines[:-1]) if lines else caption
        else:
            print("Please enter y, n, or edit")


def post_to_all(video_path, caption, product, skip_platforms=None):
    """Post to all enabled platforms (skip_platforms: names already posted)."""
    skip_platforms = skip_platforms or set()
    config_path = os.path.join(ROOT_DIR, "config.json")
    import json
    with open(config_path, "r", encoding="utf-8") as f:
        config = json.load(f)

    platforms_config = config.get("platforms", {})
    posts_today = get_today_post_count()

    print(f"\n📊 Posts today: {posts_today}")
    print(f"🚀 Publishing to enabled platforms...\n")

    publishers = {
        "tiktok": TikTokPublisher,
        "instagram": InstagramPublisher,
        "twitter": TwitterPublisher,
    }

    results = {}

    for platform_name, publisher_class in publishers.items():
        platform_conf = platforms_config.get(platform_name, {})
        if not platform_conf.get("enabled", False):
            print(f"  ⏭️  {platform_name} — disabled, skipping")
            continue
        if platform_name in skip_platforms:
            print(f"  ⏭️  {platform_name} — already posted (resume skip)")
            continue

        if not has_valid_cookies(platform_name):
            print(f"  ⏭️  {platform_name} — no cookies, skipping")
            log_post(platform_name, video_path, product["id"], "skipped_no_cookies")
            continue

        print(f"\n  📤 Publishing to {platform_name}...")
        publisher = publisher_class(headless=True)
        platform_caption = adapt_caption(caption, platform_name)
        website = config.get("brand", {}).get("website", "https://nadine.luxor.ly")
        product_url = f"{website}/product/{product['id']}"
        success = publisher.run(video_path, platform_caption, product_url=product_url)

        status = "success" if success else "failed"
        log_post(platform_name, video_path, product["id"], status)
        results[platform_name] = success

        if platform_name != "twitter":
            delay = get_platform_delay()
            print(f"  ⏳ Waiting {delay} min before next platform...")
            time.sleep(delay * 60)

    # Facebook (special handling)
    fb_conf = platforms_config.get("facebook", {})
    if fb_conf.get("enabled", False) and "facebook" not in skip_platforms:
        if has_valid_cookies("facebook"):
            print(f"\n  📤 Publishing to facebook...")
            publisher = FacebookPublisher(headless=True)
            success = publisher.run(video_path, caption)
            status = "success" if success else "failed"
            log_post("facebook", video_path, product["id"], status)
            results["facebook"] = success

    # Snapchat — web creator portal upload; falls back to a manual caption file
    sc_conf = platforms_config.get("snapchat", {})
    if sc_conf.get("enabled", True) and "snapchat" not in skip_platforms:
        print(f"\n  📤 Publishing to snapchat...")
        publisher = SnapchatPublisher()
        success = publisher.run(video_path, adapt_caption(caption, "snapchat"))
        status = "success" if success else "manual"
        log_post("snapchat", video_path, product["id"], status)
        results["snapchat"] = success

    return results


def post_caption_variants(video_path, product, captions, delay_seconds=VARIANT_POST_DELAY):
    """Push every caption for the same dress — delay_seconds between pushes."""
    print(f"\n🚀 Publishing {len(captions)} captions for the same dress "
          f"({delay_seconds}s between each)...")
    results = {}
    for i, caption in enumerate(captions, 1):
        print(f"\n{'=' * 50}")
        print(f"📤 PUSH {i}/{len(captions)}")
        print(f"{'=' * 50}")
        res = post_to_all(video_path, caption, product)
        for platform, success in res.items():
            key = f"{platform}#{i}"
            results[key] = success
        if i < len(captions):
            print(f"\n⏳ Waiting {delay_seconds}s before the next push...")
            time.sleep(delay_seconds)
    return results


def show_results(results):
    """Display posting results."""
    print("\n" + "=" * 40)
    print("📊 POSTING RESULTS:")
    print("=" * 40)
    for platform, success in results.items():
        icon = "✅" if success else "❌"
        print(f"  {icon} {platform}")
    print("=" * 40)


def main():
    """Main entry point."""
    print("\n" + "=" * 50)
    print("  👗 NADINE Social Media Auto-Poster")
    print("=" * 50)
    print("  1. Post a video now")
    print("  2. List products")
    print("  3. Check cookies status")
    print("  4. Check post history")
    print("  5. Post 5 captions for the same dress (30s apart)")
    print("  6. Exit")
    print("=" * 50)

    choice = input("\nSelect option: ").strip()

    if choice == "1":
        # Select product
        product = select_product()
        if not product:
            return

        # Select video
        video_path = select_video()
        if not video_path:
            return

        # Generate and show caption
        caption = generate_and_show(product)
        if not caption:
            print("❌ Caption cancelled")
            return

        # Post to all platforms
        results = post_to_all(video_path, caption, product)
        show_results(results)

    elif choice == "5":
        product = select_product()
        if not product:
            return
        video_path = select_video()
        if not video_path:
            return
        captions = generate_and_show_variants(product, n=VARIANT_COUNT)
        if not captions:
            print("❌ Captions cancelled")
            return
        results = post_caption_variants(video_path, product, captions)
        show_results(results)

    elif choice == "6":
        print("\n👋 Goodbye!")
        sys.exit(0)

    elif choice == "2":
        list_products()

    elif choice == "3":
        from cookie_manager import has_valid_cookies
        print("\n🔐 Cookie Status:")
        for platform in ["tiktok", "instagram", "twitter", "facebook", "snapchat"]:
            status = "✅ Valid" if has_valid_cookies(platform) else "❌ Missing"
            print(f"  {platform}: {status}")

    elif choice == "4":
        log_path = os.path.join(ROOT_DIR, "logs", "posts.json")
        if os.path.exists(log_path):
            import json
            with open(log_path, "r", encoding="utf-8") as f:
                logs = json.load(f)
            print(f"\n📋 Post History ({len(logs)} entries):")
            for entry in logs[-10:]:
                icon = "✅" if entry["status"] == "success" else "❌"
                print(f"  {icon} {entry['date']} — {entry['platform']} — {entry['product']}")
        else:
            print("\n📋 No posts yet.")

    else:
        print("❌ Invalid option")


if __name__ == "__main__":
    while True:
        try:
            main()
        except KeyboardInterrupt:
            print("\n\n👋 Goodbye!")
            break
        except Exception as e:
            print(f"\n❌ Error: {e}")
