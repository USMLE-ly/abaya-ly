import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { FeaturedCollection } from "@/components/site/FeaturedCollection";
import { WhyUs } from "@/components/site/WhyUs";
import { Spotlight } from "@/components/site/Spotlight";
import { Testimonials } from "@/components/site/Testimonials";
import { InstagramGrid } from "@/components/site/InstagramGrid";
import { Footer } from "@/components/site/Footer";

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
        <Hero />
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
