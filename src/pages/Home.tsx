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
  { q: "كيف يمكنني طلب فستان؟", a: "اختاري الفستان. أضيفيه للسلة. أو أرسلي طلبك عبر واتساب خلال دقيقة. نوصل حتى بابك." },
  { q: "هل التوصيل مجاني؟", a: "داخل بنغازي: مجاني. باقي المدن: رسوم واضحة تظهر قبل ما تأكدي الطلب." },
  { q: "هل يمكنني إرجاع المنتج؟", a: "نعم. 7 أيام من الاستلام. إذا ما عجبك الفستان، أرجِعي بحالته الأصلية ونعيد لك المبلغ كامل." },
  { q: "ما هي طرق الدفع المتاحة؟", a: "الدفع عند الاستلام. تشوفين قطعتك أول. تدفعين بعدها." },
  { q: "كيف أعرف مقاسي المناسب؟", a: "جداول المقاسات في كل صفحة. وإذا مترددة، نرشدك لمقاسك عبر واتساب قبل الشحن." },
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
  usePageMeta("نادين | بيت الفساتين الفاخرة في ليبيا", "فساتين سهرة ومناسبات بخامات عالمية — توصيل مجاني داخل بنغازي خلال 3-5 أيام، الدفع عند الاستلام، وإرجاع خلال 7 أيام.");
  return <PageTransition><HomeContent /></PageTransition>;
}

function HomeContent() {
  return (
    <>
      <LuminaHero />
      <TickerMarquee />
      <TrustStrip />
      <PromoCountdown />
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
            إطلالتكِ القادمة <span className="text-accent-brand">تبدأ من هنا</span>
          </h2>
          <p className="text-sm text-fg-tertiary max-w-lg mx-auto">
            أحدث القطع — كل واحدة لِمَناسبتها. اطلبي اليوم، تصلك خلال 3-5 أيام.
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
