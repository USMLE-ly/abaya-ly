import { motion } from "framer-motion";

export function About() {
  return (
    <div className="min-h-screen">
      <section className="relative h-72 md:h-96 overflow-hidden">
        <img src="/images/hero/abaya-gold-1.jpg" alt="عن الملكة" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent flex items-end pb-12 justify-center">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-fg text-center">عن <span className="text-ring">الملكة</span></h1>
        </div>
      </section>
      <section className="py-16 md:py-20">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-fg mb-6">قصة <span className="text-accent-brand">الملكة</span></h2>
            <p className="text-sm text-fg/50 leading-relaxed max-w-2xl mx-auto">ولدت الملكة من حبٍّ عميق للمرأة الليبية ورغبتها في تقديم الأفضل لها. نؤمن أن كل امرأة تستحق عباية تحكي قصتها — عباية تجمع بين الفخامة العالمية والهوية الليبية الأصيلة.</p>
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
            {[{ title: "الجودة", text: "أقمشة مختارة بعناية من إيطاليا وفرنسا وتركيا" }, { title: "الأصالة", text: "تطريز يدوي ليبي يحكي تراثنا العريق" }, { title: "التفرد", text: "كل عباية قطعة فريدة لا تتكرر" }, { title: "خدمة العملاء", text: "نضعكِ في مركز الاهتمام دائماً" }].map((value, i) => (
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
