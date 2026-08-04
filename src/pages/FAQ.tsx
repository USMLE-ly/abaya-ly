import { Accordion } from "@/components/velar";
import { usePageMeta } from "@/lib/usePageMeta";

const faqs = [
  { q: "كيف يمكنني طلب فستان؟", a: "يمكنكِ تصفح المجموعات واختيار الفستان التي تفضلينها، ثم إضافتها إلى سلة التسوق وإتمام الطلب. يمكنكِ أيضًا التواصل معنا عبر الواتساب." },
  { q: "هل التوصيل مجاني؟", a: "التوصيل مجاني داخل بنغازي — وللمدن الأخرى تُضاف رسوم توصيل بسيطة تظهر عند إتمام الطلب." },
  { q: "هل يمكنني إرجاع المنتج؟", a: "نعم، يمكنكِ إرجاع المنتج خلال 7 أيام من تاريخ الاستلام بشرط أن يكون المنتج بحالته الأصلية." },
  { q: "ما هي طرق الدفع المتاحة؟", a: "نقبل الدفع نقداً عند الاستلام." },
  { q: "كيف أعرف مقاسي المناسب؟", a: "صفحتنا تحتوي على جدول المقاسات. يمكنكِ أيضًا التواصل معنا للحصول على إرشادات شخصية." },
];

import { PageTransition } from "@/components/PageTransition";

export function FAQ() {
  usePageMeta("الأسئلة الشائعة", "إجابات على أكثر الأسئلة شيوعاً حول الطلب، الشحن، المقاسات، والدفع عند الاستلام.");
  return <PageTransition><FAQContent /></PageTransition>;
}

function FAQContent() {
  return (
    <div className="min-h-screen">
      <section className="pt-24 pb-10 md:pt-28 md:pb-14">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-fg mb-3">الأسئلة <span className="text-accent-brand">الشائعة</span></h1>
          <p className="text-sm text-fg-tertiary">إجابات على أكثر الأسئلة شيوعاً</p>
        </div>
      </section>
      <section className="pb-12 md:pb-16">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          <Accordion
            items={faqs.map((faq, i) => ({
              id: `faq-${i}`,
              title: faq.q,
              content: faq.a,
            }))}
          />
        </div>
      </section>
    </div>
  );
}
