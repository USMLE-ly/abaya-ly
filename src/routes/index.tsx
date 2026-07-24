import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { AnimatedMarqueeHero } from "@/components/ui/hero-3";
import { Marquee } from "@/components/site/Marquee";
import { FeaturedCollection } from "@/components/site/FeaturedCollection";
import { WhyUs } from "@/components/site/WhyUs";
import { Spotlight } from "@/components/site/Spotlight";
import { Testimonials } from "@/components/site/Testimonials";
import { InstagramGrid } from "@/components/site/InstagramGrid";
import { Footer } from "@/components/site/Footer";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1594938298603-c8148c4b5b3e?w=900&q=80",
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&q=80",
  "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=900&q=80",
  "https://images.unsplash.com/photo-1551803091-e20673f15770?w=900&q=80",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=900&q=80",
  "https://images.unsplash.com/photo-1576185850227-1f72b7f8d483?w=900&q=80",
  "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=80",
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "الملكة | بيت العباءات الفاخرة في ليبيا" },
      {
        name: "description",
        content:
          "اكتشفي مجموعة الملكة من العبايات الفاخرة بتطريز يدوي وأقمشة عالمية، مصممة خصيصاً للمرأة الليبية. شحن مجاني لكل ليبيا.",
      },
      { property: "og:title", content: "الملكة | بيت العباءات الفاخرة في ليبيا" },
      { property: "og:description", content: "عبايات فاخرة بلمسة ليبية أصيلة." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="bg-ink">
      <Navbar />
      <main>
        <AnimatedMarqueeHero
          tagline="✦ الفخامة الليبية الأصيلة ✦"
          title={
            <>
              حيث تلتقي
              <br />
              <span className="text-gold">الأناقة</span> بالهوية
            </>
          }
          description="كل عباية نصنعها تحمل روح المرأة الليبية — قوتها، رقّتها، وتميّزها. من أفخر الأقمشة العالمية إلى تفاصيل التطريز اليدوي، الملكة ليست مجرد عباية، هي هوية."
          ctaText="اكتشفي المجموعة"
          images={HERO_IMAGES}
        />
        <Marquee />
        <FeaturedCollection />
        <WhyUs />
        <Spotlight />
        <Testimonials />
        <InstagramGrid />
      </main>
      <Footer />
    </div>
  );
}
