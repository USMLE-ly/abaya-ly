import os
import sys
import time

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT_DIR)

from caption_generator import (
    get_all_products,
    find_product_by_name,
    find_product_by_id,
    generate_caption,
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
)


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


def generate_and_show(product):
    """Generate caption and show for approval."""
    caption = generate_caption(product)

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


def post_to_all(video_path, caption, product):
    """Post to all enabled platforms."""
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

        if not has_valid_cookies(platform_name):
            print(f"  ⏭️  {platform_name} — no cookies, skipping")
            log_post(platform_name, video_path, product["id"], "skipped_no_cookies")
            continue

        print(f"\n  📤 Publishing to {platform_name}...")
        publisher = publisher_class(headless=True)
        success = publisher.run(video_path, caption)

        status = "success" if success else "failed"
        log_post(platform_name, video_path, product["id"], status)
        results[platform_name] = success

        if platform_name != "twitter":
            delay = get_platform_delay()
            print(f"  ⏳ Waiting {delay} min before next platform...")
            time.sleep(delay * 60)

    # Facebook (special handling)
    fb_conf = platforms_config.get("facebook", {})
    if fb_conf.get("enabled", False):
        if has_valid_cookies("facebook"):
            print(f"\n  📤 Publishing to facebook...")
            publisher = FacebookPublisher(headless=True)
            success = publisher.run(video_path, caption)
            status = "success" if success else "failed"
            log_post("facebook", video_path, product["id"], status)
            results["facebook"] = success

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
    print("  5. Exit")
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

    elif choice == "2":
        list_products()

    elif choice == "3":
        from cookie_manager import has_valid_cookies
        print("\n🔐 Cookie Status:")
        for platform in ["tiktok", "instagram", "twitter", "facebook"]:
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

    elif choice == "5":
        print("\n👋 Goodbye!")
        sys.exit(0)
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
