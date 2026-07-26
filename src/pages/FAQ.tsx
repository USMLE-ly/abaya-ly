import { Accordion } from "@/components/velar";

const faqs = [
  { q: "كيف يمكنني طلب فستان؟", a: "يمكنكِ تصفح المجموعات واختيار الفستان التي تفضلينها، ثم إضافتها إلى سلة التسوق وإتمام الطلب. يمكنكِ أيضًا التواصل معنا عبر الواتساب." },
  { q: "هل الشحن مجاني؟", a: "نعم، الشحن مجاني لجميع مدن ليبيا. يتم التوصيل خلال 3-5 أيام عمل." },
  { q: "هل يمكنني إرجاع المنتج؟", a: "نعم، يمكنكِ إرجاع المنتج خلال 7 أيام من تاريخ الاستلام بشرط أن يكون المنتج بحالته الأصلية." },
  { q: "هل تقدمون تفصيل حسب المقاس؟", a: "نعم! نوفّر خدمة التفصيل حسب المقاس. تواصلي معنا عبر الواتساب لأخذ مقاساتكِ." },
  { q: "ما هي طرق الدفع المتاحة؟", a: "نقبل الدفع النقدي عند الاستلام والتحويل البنكي." },
  { q: "كيف أعرف مقاسي المناسب؟", a: "صفحتنا تحتوي على جدول المقاسات. يمكنكِ أيضًا التواصل معنا للحصول على إرشادات شخصية." },
];

export function FAQ() {
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
