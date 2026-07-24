import { motion } from "framer-motion";

export function About() {
  return (
    <div className="pt-20 pb-16 min-h-screen">
      {/* Hero */}
      <div className="relative h-80 md:h-96 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1400&q=80"
          alt="عن الملكة"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white text-center">
            عن <span className="text-gold">الملكة</span>
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold text-text mb-6">
            قصة <span className="text-brand">الملكة</span>
          </h2>
          <p className="text-text-light leading-relaxed text-lg">
            ولدت الملكة من حبٍّ عميق للمرأة الليبية ورغبتها في تقديم الأفضل لها.
            نؤمن أن كل امرأة تستحق عباية تحكي قصتها — عباية تجمع بين الفخامة العالمية
            والهوية الليبية الأصيلة.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {[
            { number: "١٠٠٠+", label: "امرأة ليبية سعيدة" },
            { number: "٥٠+", label: "تصميم حصري" },
            { number: "٧", label: "مدن ليبيّة نغطيها" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center p-8 bg-bg-2 rounded-2xl"
            >
              <span className="text-4xl font-bold text-brand block mb-2">{stat.number}</span>
              <span className="text-text-light">{stat.label}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="prose max-w-none"
        >
          <h2 className="font-display text-2xl font-bold text-text mb-4">رؤيتنا</h2>
          <p className="text-text-light leading-relaxed mb-6">
            نسعى لأن نكون الخيار الأول للمرأة الليبية khi تبحث عن عباية فاخرة.
            نجمع بين أرقى الأقمشة العالمية والحرفية الليبية الماهرة لتصنع قطعاً
            فريدة لا تُنسى.
          </p>

          <h2 className="font-display text-2xl font-bold text-text mb-4">قيمنا</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { title: "الجودة", text: "أقمشة مختارة بعناية من إيطاليا وفرنسا وتركيا" },
              { title: "الأصالة", text: "تطريز يدوي ليبي يحكي تراثنا العريق" },
              { title: "التفرد", text: "كل عباية قطعة فريدة لا تتكرر" },
              { title: "خدمة العملاء", text: "نضعكِ في مركز الاهتمام دائماً" },
            ].map((value, i) => (
              <div key={i} className="p-6 bg-bg-2 rounded-xl">
                <h3 className="font-semibold text-text mb-2">{value.title}</h3>
                <p className="text-sm text-text-light">{value.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
