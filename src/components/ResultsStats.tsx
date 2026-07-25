import { motion } from "framer-motion";

const results = [
  { percentage: 95, text: "عملاء راضون عن الجودة" },
  { percentage: 90, text: "يوصين بعباياتنا لصديقاتهن" },
  { percentage: 98, text: "راضيات عن خدمة ما بعد البيع" },
];

export function ResultsStats() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            نتائج <span className="text-primary">عملائنا</span>
          </h2>
          <p className="text-sm text-foreground/50">أكثر من ١٠٠٠ امرأة ليبية تثق بنا</p>
        </div>
        <div className="space-y-8">
          {results.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground/80">{stat.text}</span>
                <span className="text-sm font-bold text-primary">{stat.percentage}%</span>
              </div>
              <div className="w-full h-3 bg-white/60 rounded-full overflow-hidden border border-black/5">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${stat.percentage}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-brand to-brand-dark rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
