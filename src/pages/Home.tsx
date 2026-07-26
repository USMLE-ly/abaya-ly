import { motion } from "framer-motion";
import { Accordion } from "@/components/velar";
import LuminaHero from "@/components/LuminaHero";
import { ProductCarousel } from "@/components/ProductCarousel";
import { ComparisonTable } from "@/components/ComparisonTable";
import { IconBar } from "@/components/IconBar";
import { GlobeSection } from "@/components/GlobeSection";
import FlipGallery from "@/components/ui/flip-gallery";
import IPhoneMockup from "@/components/ui/iphone-mockup";
import { ContactForm } from "@/components/ContactForm";
import { OutfitGallery } from "@/components/OutfitGallery";

const faqs = [
  { q: "كيف يمكنني طلب عباية؟", a: "يمكنكِ تصفح المجموعات واختيار العباية التي تفضلينها، ثم إضافتها إلى سلة التسوق وإتمام الطلب. يمكنكِ أيضًا التواصل معنا عبر الواتساب." },
  { q: "هل الشحن مجاني؟", a: "نعم، الشحن مجاني لجميع مدن ليبيا. يتم التوصيل خلال 3-5 أيام عمل." },
  { q: "هل يمكنني إرجاع المنتج؟", a: "نعم، يمكنكِ إرجاع المنتج خلال 7 أيام من تاريخ الاستلام بشرط أن يكون المنتج بحالته الأصلية." },
  { q: "هل تقدمون تفصيل حسب المقاس؟", a: "نعم! نوفّر خدمة التفصيل حسب المقاس. تواصلي معنا عبر الواتساب لأخذ مقاساتكِ." },
  { q: "ما هي طرق الدفع المتاحة؟", a: "نقبل الدفع النقدي عند الاستلام والتحويل البنكي." },
  { q: "كيف أعرف مقاسي المناسب؟", a: "صفحتنا تحتوي على جدول المقاسات. يمكنكِ أيضًا التواصل معنا للحصول على إرشادات شخصية." },
];

function HomeFAQ() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6">
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
  );
}

export function Home() {
  return (
    <>
      <LuminaHero />
      <ProductCarousel />
      <OutfitGallery />
      <ComparisonTable />
      <IconBar />
      <GlobeSection />

      {/* FlipGallery inside iPhone mockup — centered on all devices */}
      <section className="min-h-[80vh] flex flex-col items-center justify-center py-12">
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-fg mb-3">
            تشكيلتنا <span className="text-accent-brand">المميزة</span>
          </h2>
          <p className="text-sm text-fg-tertiary max-w-lg mx-auto">
            اكتشفي أحدث تصميماتنا من العبايات الفاخرة
          </p>
        </div>
        <div className="flex items-center justify-center">
          <IPhoneMockup model="15-pro" color="natural-titanium" scale={0.65}>
            <FlipGallery />
          </IPhoneMockup>
        </div>
      </section>

      <HomeFAQ />
      <ContactForm />
    </>
  );
}
