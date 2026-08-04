import { Accordion } from "@/components/velar";
import LuminaHero from "@/components/LuminaHero";
import { ProductCarousel } from "@/components/ProductCarousel";
import { TrustStrip } from "@/components/TrustStrip";
import { BestSellers } from "@/components/BestSellers";
import { ComparisonTable } from "@/components/ComparisonTable";
import { IconBar } from "@/components/IconBar";
import { GlobeSection } from "@/components/GlobeSection";
import FlipGallery from "@/components/ui/flip-gallery";
import IPhoneMockup from "@/components/ui/iphone-mockup";
import { ContactForm } from "@/components/ContactForm";
import { OutfitGallery } from "@/components/OutfitGallery";
import { FeaturedCollection } from "@/components/FeaturedCollection";
import { PageTransition, Reveal, StaggerGrid, StaggerItem } from "@/components/PageTransition";
import { usePageMeta } from "@/lib/usePageMeta";
import { InstaStories } from "@/components/InstaStories";
import { TickerMarquee } from "@/components/TickerMarquee";
import { Testimonials } from "@/components/Testimonials";
import { PromoCountdown } from "@/components/PromoCountdown";

const faqs = [
  { q: "كيف يمكنني طلب فستان؟", a: "يمكنكِ تصفح المجموعات واختيار الفستان التي تفضلينها، ثم إضافتها إلى سلة التسوق وإتمام الطلب. يمكنكِ أيضًا التواصل معنا عبر الواتساب." },
  { q: "هل التوصيل مجاني؟", a: "التوصيل مجاني داخل بنغازي — وللمدن الأخرى تُضاف رسوم توصيل بسيطة تظهر عند إتمام الطلب." },
  { q: "هل يمكنني إرجاع المنتج؟", a: "نعم، يمكنكِ إرجاع المنتج خلال 7 أيام من تاريخ الاستلام بشرط أن يكون المنتج بحالته الأصلية." },
  { q: "ما هي طرق الدفع المتاحة؟", a: "نقبل الدفع نقداً عند الاستلام." },
  { q: "كيف أعرف مقاسي المناسب؟", a: "صفحتنا تحتوي على جدول المقاسات. يمكنكِ أيضًا التواصل معنا للحصول على إرشادات شخصية." },
];

function HomeFAQ() {
  return (
    <Reveal>
      <section className="py-16 md:py-24">
      <div className="w-full max-w-[800px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-fg mb-3">
            الأسئلة <span className="text-accent-brand">الشائعة</span>
          </h2>
          <p className="text-sm text-fg-tertiary">إجابات على أكثر الأسئلة شيوعاً</p>
        </div>
        <Accordion
          items={faqs.map((faq, i) => ({
            id: `home-faq-${i}`,
            title: faq.q,
            content: faq.a,
          }))}
        />
      </div>
    </section>
    </Reveal>
  );
}

export function Home() {
  usePageMeta("نادين | بيت الفساتين الفاخرة في ليبيا", "اكتشفي تشكيلة نادين من فساتين السهرة والمناسبات في ليبيا — تفصيل راقٍ، توصيل مجاني داخل بنغازي، والدفع عند الاستلام.");
  return <PageTransition><HomeContent /></PageTransition>;
}

function HomeContent() {
  return (
    <>
      <LuminaHero />
      <TickerMarquee />
      <PromoCountdown />
      <TrustStrip />
      <BestSellers />
      <ProductCarousel />
      <FeaturedCollection />
      <OutfitGallery />
      <ComparisonTable />
      <Reveal><IconBar /></Reveal>
      <InstaStories />
      <GlobeSection />

      {/* FlipGallery inside iPhone mockup — centered on all devices */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center py-12">
        <div className="text-center mb-8 px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-fg mb-3">
            تشكيلتنا <span className="text-accent-brand">المميزة</span>
          </h2>
          <p className="text-sm text-fg-tertiary max-w-lg mx-auto">
            اكتشفي أحدث تصميماتنا من الفساتين الفاخرة
          </p>
        </div>
        <div className="flex items-center justify-center overflow-hidden max-w-full">
          <IPhoneMockup model="15-pro" color="natural-titanium" scale={0.65}>
            <FlipGallery />
          </IPhoneMockup>
        </div>
      </section>

      <Testimonials />
      <HomeFAQ />
      <ContactForm />
    </>
  );
}
