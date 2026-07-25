import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const rows = [
  { benefit: "أقمشة عالمية فاخرة", us: true, others: false },
  { benefit: "تطريز يدوي ليبي", us: true, others: false },
  { benefit: "تفصيل حسب المقاس", us: true, others: false },
  { benefit: "شحن مجاني داخل ليبيا", us: true, others: false },
  { benefit: "ضمان الجودة", us: true, others: false },
  { benefit: "إرجاع خلال ٧ أيام", us: true, others: false },
];

export function ComparisonTable() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            لماذا <span className="text-primary">الملكة</span>؟
          </h2>
          <p className="text-sm text-foreground/50 max-w-xl mx-auto">
            نقدم لكِ ما لا تجدينه لدى الآخرين — جودة لا تُضاهى بلمسة ليبية أصيلة
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card overflow-hidden"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="glass-strong">
                <th className="text-right p-4 md:p-5 font-semibold text-foreground w-1/2">الميزة</th>
                <th className="p-4 md:p-5 text-center font-semibold text-primary bg-primary/5 w-1/4">الملكة</th>
                <th className="p-4 md:p-5 text-center font-semibold text-foreground/40 w-1/4">الآخرون</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-black/5 hover:bg-black/[0.03] transition-colors">
                  <td className="p-4 md:p-5 text-foreground/80 font-medium">{row.benefit}</td>
                  <td className="p-4 md:p-5 text-center bg-primary/5">
                    {row.us ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#53af01] text-foreground">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-foreground/30">
                        <X size={14} strokeWidth={3} />
                      </span>
                    )}
                  </td>
                  <td className="p-4 md:p-5 text-center">
                    {row.others ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#53af01] text-foreground">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-foreground/30">
                        <X size={14} strokeWidth={3} />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
