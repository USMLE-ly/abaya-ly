import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import LuminaHero from "@/components/LuminaHero";
import { ProductCarousel } from "@/components/ProductCarousel";
import { ComparisonTable } from "@/components/ComparisonTable";
import { IconBar } from "@/components/IconBar";
import { GlobeSection } from "@/components/GlobeSection";
import FlipGallery from "@/components/ui/flip-gallery";
import IPhoneMockup from "@/components/ui/iphone-mockup";
import { ContactForm } from "@/components/ContactForm";

const faqs = [
  { q: "كيف يمكنني طلب عباية؟", a: "يمكنكِ تصفح المجموعات واختيار العباية التي تفضلينها، ثم إضافتها إلى سلة التسوق وإتمام الطلب. يمكنكِ أيضًا التواصل معنا عبر الواتساب." },
  { q: "هل الشحن مجاني؟", a: "نعم، الشحن مجاني لجميع مدن ليبيا. يتم التوصيل خلال ٣-٥ أيام عمل." },
  { q: "هل يمكنني إرجاع المنتج؟", a: "نعم، يمكنكِ إرجاع المنتج خلال ٧ أيام من تاريخ الاستلام بشرط أن يكون المنتج بحالته الأصلية." },
  { q: "هل تقدمون تفصيل حسب المقاس؟", a: "نعم! نوفّر خدمة التفصيل حسب المقاس. تواصلي معنا عبر الواتساب لأخذ مقاساتكِ." },
  { q: "ما هي طرق الدفع المتاحة؟", a: "نقبل الدفع النقدي عند الاستلام والتحويل البنكي." },
  { q: "كيف أعرف مقاسي المناسب؟", a: "صفحتنا تحتوي على جدول المقاسات. يمكنكِ أيضًا التواصل معنا للحصول على إرشادات شخصية." },
];

function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            الأسئلة <span className="text-brand">الشائعة</span>
          </h2>
          <p className="text-sm text-white/50">إجابات على أكثر الأسئلة شيوعاً</p>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04, duration: 0.3 }} className="glass-card overflow-hidden">
              <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between p-4 md:p-5 text-right hover:bg-white/[0.02] transition-colors">
                <span className="text-sm font-semibold text-white">{faq.q}</span>
                <ChevronDown size={16} className={`text-white/40 transition-transform duration-200 flex-shrink-0 ml-3 ${openIndex === i ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence initial={false}>
                {openIndex === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                    <p className="px-4 md:px-5 pb-4 md:pb-5 text-xs text-white/40 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Home() {
  return (
    <>
      <LuminaHero />
      <ProductCarousel />
      <ComparisonTable />
      <IconBar />
      <GlobeSection />

      {/* FlipGallery inside iPhone mockup */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
              تشكيلتنا <span className="text-brand">المميزة</span>
            </h2>
            <p className="text-sm text-white/50 max-w-lg mx-auto">
              اكتشفي أحدث تصميماتنا من العبايات الفاخرة
            </p>
          </div>
          <div className="flex justify-center">
            <IPhoneMockup model="15-pro" color="natural-titanium" scale={0.7}>
              <FlipGallery />
            </IPhoneMockup>
          </div>
        </div>
      </section>

      <HomeFAQ />
      <ContactForm />
    </>
  );
}
