import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { usePageMeta } from "@/lib/usePageMeta";

export function About() {
  usePageMeta("من نحن", "قصة نادين — فساتين سهرة ومناسبات بخامات إيطالية وتركية، فحص يدوي قبل الشحن، وإرجاع خلال 7 أيام.");
  return <PageTransition><AboutContent /></PageTransition>;
}

function AboutContent() {
  return (
    <div className="min-h-screen">
      <section className="relative h-72 md:h-96 overflow-hidden">
        <img src="/images/hero/abaya-gold-1.jpg" alt="عن نادين" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent flex items-end pb-12 justify-center">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-fg text-center">عن <span className="text-ring">نادين</span></h1>
        </div>
      </section>
      <section className="py-16 md:py-20">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-fg mb-6">قصة <span className="text-accent-brand">نادين</span></h2>
            <p className="text-sm text-fg/50 leading-relaxed max-w-2xl mx-auto">نبدأ من الخامة. ننتهي بالفستان. نختار أقمشة إيطالية وفرنسية وتركية. نصمم كل قطعة لإطلالة واحدة: مناسبتك. ونفحص كل فستان يدوياً قبل الشحن. إذا ما عجبك عند الاستلام، أرجِعي خلال 7 أيام ونعيد لك المبلغ كامل.</p>
          </motion.div>
        </div>
      </section>
      <section className="py-12">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-4">
            {[{ number: "١٠٠٠+", label: "امرأة ليبية سعيدة" }, { number: "٥٠+", label: "تصميم حصري" }, { number: "٧", label: "مدن ليبيّة نغطيها" }].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center glass-card p-6">
                <span className="text-2xl md:text-3xl font-bold text-accent-brand block mb-1">{stat.number}</span>
                <span className="text-[10px] md:text-xs text-fg/40">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 md:py-20">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <h2 className="font-display text-2xl md:text-3xl font-bold text-fg mb-3">رؤيتنا <span className="text-accent-brand">وقيمنا</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[{ title: "الجودة", text: "خامات من إيطاليا وفرنسا وتركيا — تُختار باليد" }, { title: "الأصالة", text: "تفصيل وتطريز يُفحص يدوياً قبل الشحن" }, { title: "التفرد", text: "إصدارات محدودة لا تُعاد بعد نفادها" }, { title: "خدمة العملاء", text: "نضعكِ في مركز الاهتمام دائماً" }].map((value, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card p-6">
                <h3 className="text-sm font-semibold text-fg mb-2">{value.title}</h3>
                <p className="text-xs text-fg/40 leading-relaxed">{value.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
