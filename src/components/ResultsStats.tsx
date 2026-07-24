import { motion } from "framer-motion";

const stats = [
  { percentage: 95, text: "عملاء راضون عن الجودة" },
  { percentage: 90, text: "يوصين بعباياتنا لصديقاتهن" },
  { percentage: 98, text: "راضيات عن خدمة ما بعد البيع" },
];

export function ResultsStats() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text mb-4">
            نتائج <span className="text-brand">عملائنا</span>
          </h2>
          <p className="text-text-light">أكثر من ١٠٠٠ امرأة ليبية تثق بنا</p>
        </div>

        <div className="space-y-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text">{stat.text}</span>
                <span className="text-sm font-bold text-brand">{stat.percentage}%</span>
              </div>
              <div className="w-full h-3 bg-bg-2 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${stat.percentage}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: i * 0.2 }}
                  className="h-full bg-brand rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
