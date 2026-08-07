import { Accordion } from "@/components/velar";
import { usePageMeta } from "@/lib/usePageMeta";

const faqs = [
  { q: "كيف يمكنني طلب فستان؟", a: "اختاري الفستان. أضيفيه للسلة. أو أرسلي طلبك عبر واتساب خلال دقيقة. نوصل حتى بابك." },
  { q: "هل التوصيل مجاني؟", a: "داخل بنغازي: مجاني. باقي المدن: رسوم واضحة تظهر قبل ما تأكدي الطلب." },
  { q: "هل يمكنني إرجاع المنتج؟", a: "نعم. 7 أيام من الاستلام. إذا ما عجبك الفستان، أرجِعي بحالته الأصلية ونعيد لك المبلغ كامل." },
  { q: "ما هي طرق الدفع المتاحة؟", a: "الدفع عند الاستلام. تشوفين قطعتك أول. تدفعين بعدها." },
  { q: "كيف أعرف مقاسي المناسب؟", a: "جداول المقاسات في كل صفحة. وإذا مترددة، نرشدك لمقاسك عبر واتساب قبل الشحن." },
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
          <p className="text-sm text-fg-tertiary">كل ما تحتاجين معرفته قبل الطلب — في مكان واحد</p>
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
