"""Non-interactive post driver — posts the approved caption to all platforms."""
import os, sys, traceback

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, "src"))

from caption_generator import find_product_by_id
from main import post_to_all

CAPTION = """🔥 تخيّلي تدخلين المناسبة وكل العيون عليكِ…

✨ أسود عميق بنقاط بيضاء — إطلالة سهرة تجمع الكلاسيك بالعصري وتشدّ الأنظار
💎 شيفون خفيف بحاشية غير متماثلة تنسدل مع كل خطوة
👗 قصة هالتر برقبة عالية تبرز الكتفين — إصدار 2026 بـ 750 د.ل بدل 850 د.ل

🎟️ خصم 10% بكود NADINE10 — لفترة محدودة

🔗 https://nadine.luxor.ly/product/noir-black-polka-halter-midi

#نادين #Nadine #فستان_سهرة #نقاط_بيضاء #هالتر #شيفون #إطلالة_عصرية #NoirAtelier"""

def main():
    product = find_product_by_id("noir-black-polka-halter-midi")
    if not product:
        print("❌ product not found")
        sys.exit(1)
    video = os.path.abspath("content/VN20260804_180526.mp4")
    if not os.path.exists(video):
        print("❌ video not found")
        sys.exit(1)
    print("✅ caption approved by user — posting to all platforms...")
    results = post_to_all(video, CAPTION, product)
    print("\n📊 RESULTS:", results)

if __name__ == "__main__":
    try:
        main()
    except Exception:
        traceback.print_exc()
        sys.exit(1)
