import { motion } from "framer-motion";

export function About() {
  return (
    <div className="bg-white min-h-screen">
      {/* ─── HERO ─── */}
      <section className="relative h-72 md:h-96 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1400&q=80"
          alt="عن الملكة"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="font-display text-3xl md:text-5xl font-bold text-white text-center">
            عن <span className="text-gold">الملكة</span>
          </h1>
        </div>
      </section>

      {/* ─── STORY ─── */}
      <section className="py-16 md:py-20">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-text mb-6">
              قصة <span className="text-brand">الملكة</span>
            </h2>
            <p className="text-sm text-text-light leading-relaxed max-w-2xl mx-auto">
              ولدت الملكة من حبٍّ عميق للمرأة الليبية ورغبتها في تقديم الأفضل لها.
              نؤمن أن كل امرأة تستحق عباية تحكي قصتها — عباية تجمع بين الفخامة العالمية
              والهوية الليبية الأصيلة.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="py-12 bg-bg-2">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-6">
            {[
              { number: "١٠٠٠+", label: "امرأة ليبية سعيدة" },
              { number: "٥٠+", label: "تصميم حصري" },
              { number: "٧", label: "مدن ليبيّة نغطيها" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-6 bg-white rounded-xl"
              >
                <span className="text-2xl md:text-3xl font-bold text-brand block mb-1">
                  {stat.number}
                </span>
                <span className="text-[10px] md:text-xs text-text-light">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VALUES ─── */}
      <section className="py-16 md:py-20">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold text-text mb-3">
              رؤيتنا <span className="text-brand">وقيمنا</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { title: "الجودة", text: "أقمشة مختارة بعناية من إيطاليا وفرنسا وتركيا" },
              { title: "الأصالة", text: "تطريز يدوي ليبي يحكي تراثنا العريق" },
              { title: "التفرد", text: "كل عباية قطعة فريدة لا تتكرر" },
              { title: "خدمة العملاء", text: "نضعكِ في مركز الاهتمام دائماً" },
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 bg-bg-2 rounded-xl"
              >
                <h3 className="text-sm font-semibold text-text mb-2">{value.title}</h3>
                <p className="text-xs text-text-light leading-relaxed">{value.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
