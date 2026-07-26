import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const rows = [
  { benefit: "أقمشة عالمية فاخرة", us: true, others: false },
  { benefit: "تطريز يدوي ليبي", us: true, others: false },
  { benefit: "تفصيل حسب المقاس", us: true, others: false },
  { benefit: "شحن مجاني داخل ليبيا", us: true, others: false },
  { benefit: "ضمان الجودة", us: true, others: false },
  { benefit: "إرجاع خلال 7 أيام", us: true, others: false },
];

export function ComparisonTable() {
  return (
    <section className="py-16 md:py-24">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-fg mb-3">
            لماذا <span className="text-accent-brand">نادين</span>؟
          </h2>
          <p className="text-sm text-fg-tertiary max-w-xl mx-auto">
            نقدم لكِ ما لا تجدينه لدى الآخرين — جودة لا تُضاهى بلمسة ليبية أصيلة
          </p>
        </div>

        {/* Table — visible on all screens including mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm min-w-[480px]" style={{ direction: "rtl" }}>
              <thead>
                <tr className="glass-strong">
                  <th className="text-right p-3 sm:p-4 md:p-5 font-semibold text-fg w-1/2">الميزة</th>
                  <th className="p-3 sm:p-4 md:p-5 text-center font-semibold text-accent-brand bg-brand-subtle w-1/4">نادين</th>
                  <th className="p-3 sm:p-4 md:p-5 text-center font-semibold text-fg-tertiary w-1/4">الآخرون</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-t border-line-subtle hover:bg-sunken transition-colors">
                    <td className="p-3 sm:p-4 md:p-5 text-fg-secondary font-medium">{row.benefit}</td>
                    <td className="p-3 sm:p-4 md:p-5 text-center bg-brand-subtle/50">
                      {row.us ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-status-success text-fg-inverse">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sunken text-fg-disabled">
                          <X size={14} strokeWidth={3} />
                        </span>
                      )}
                    </td>
                    <td className="p-3 sm:p-4 md:p-5 text-center">
                      {row.others ? (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-status-success text-fg-inverse">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-sunken text-fg-disabled">
                          <X size={14} strokeWidth={3} />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
