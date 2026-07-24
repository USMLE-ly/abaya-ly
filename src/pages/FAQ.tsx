import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "كيف يمكنني طلب عباية؟",
    a: "يمكنكِ تصفح المجموعات واختيار العباية التي تفضلينها، ثم إضافتها إلى سلة التسوق وإتمام الطلب. يمكنكِ أيضًا التواصل معنا عبر الواتساب.",
  },
  {
    q: "هل الشحن مجاني؟",
    a: "نعم، الشحن مجاني لجميع مدن ليبيا. يتم التوصيل خلال ٣-٥ أيام عمل.",
  },
  {
    q: "هل يمكنني إرجاع المنتج؟",
    a: "نعم، يمكنكِ إرجاع المنتج خلال ٧ أيام من تاريخ الاستلام بشرط أن يكون المنتج بحالته الأصلية.",
  },
  {
    q: "هل تقدمون تفصيل حسب المقاس؟",
    a: "نعم! نوفّر خدمة التفصيل حسب المقاس. تواصلي معنا عبر الواتساب لأخذ مقاساتكِ.",
  },
  {
    q: "ما هي طرق الدفع المتاحة؟",
    a: "نقبل الدفع النقدي عند الاستلام والتحويل البنكي.",
  },
  {
    q: "كيف أعرف مقاسي المناسب؟",
    a: "صفحتنا تحتوي على جدول المقاسات. يمكنكِ أيضًا التواصل معنا للحصول على إرشادات شخصية.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="pt-20 pb-16 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-text mb-4">
            الأسئلة <span className="text-brand">الشائعة</span>
          </h1>
          <p className="text-text-light">إجابات على أكثر الأسئلة شيوعاً</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="border border-border rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-right hover:bg-bg-2 transition-colors"
              >
                <span className="font-semibold text-text">{faq.q}</span>
                <ChevronDown
                  size={20}
                  className={`text-text-light transition-transform ${openIndex === i ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-text-light leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
