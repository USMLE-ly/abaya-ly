import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  { q: "كيف يمكنني طلب عباية؟", a: "يمكنكِ تصفح المجموعات واختيار العباية التي تفضلينها، ثم إضافتها إلى سلة التسوق وإتمام الطلب. يمكنكِ أيضًا التواصل معنا عبر الواتساب." },
  { q: "هل الشحن مجاني؟", a: "نعم، الشحن مجاني لجميع مدن ليبيا. يتم التوصيل خلال ٣-٥ أيام عمل." },
  { q: "هل يمكنني إرجاع المنتج؟", a: "نعم، يمكنكِ إرجاع المنتج خلال ٧ أيام من تاريخ الاستلام بشرط أن يكون المنتج بحالته الأصلية." },
  { q: "هل تقدمون تفصيل حسب المقاس؟", a: "نعم! نوفّر خدمة التفصيل حسب المقاس. تواصلي معنا عبر الواتساب لأخذ مقاساتكِ." },
  { q: "ما هي طرق الدفع المتاحة؟", a: "نقبل الدفع النقدي عند الاستلام والتحويل البنكي." },
  { q: "كيف أعرف مقاسي المناسب؟", a: "صفحتنا تحتوي على جدول المقاسات. يمكنكِ أيضًا التواصل معنا للحصول على إرشادات شخصية." },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="min-h-screen">
      <section className="pt-24 pb-10 md:pt-28 md:pb-14">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">الأسئلة <span className="text-primary">الشائعة</span></h1>
          <p className="text-sm text-foreground/50">إجابات على أكثر الأسئلة شيوعاً</p>
        </div>
      </section>
      <section className="pb-12 md:pb-16">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.3 }} className="glass-card overflow-hidden">
                <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between p-4 md:p-5 text-right hover:bg-black/[0.03] transition-colors">
                  <span className="text-sm font-semibold text-foreground">{faq.q}</span>
                  <ChevronDown size={16} className={`text-foreground/40 transition-transform duration-200 flex-shrink-0 ml-3 ${openIndex === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence initial={false}>
                  {openIndex === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                      <p className="px-4 md:px-5 pb-4 md:pb-5 text-xs text-foreground/40 leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
