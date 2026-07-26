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
      <div className="max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-right mb-12">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-fg mb-3">
            لماذا <span className="text-accent-brand">الملكة</span>؟
          </h2>
          <p className="text-sm text-fg-tertiary max-w-xl ml-auto">
            نقدم لكِ ما لا تجدينه لدى الآخرين — جودة لا تُضاهى بلمسة ليبية أصيلة
          </p>
        </div>

        {/* Desktop: table view */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="glass-card overflow-hidden hidden sm:block"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="glass-strong">
                <th className="text-right p-4 md:p-5 font-semibold text-fg w-1/2">الميزة</th>
                <th className="p-4 md:p-5 text-center font-semibold text-accent-brand bg-brand-subtle w-1/4">الملكة</th>
                <th className="p-4 md:p-5 text-center font-semibold text-fg-tertiary w-1/4">الآخرون</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-line-subtle hover:bg-sunken transition-colors">
                  <td className="p-4 md:p-5 text-fg-secondary font-medium">{row.benefit}</td>
                  <td className="p-4 md:p-5 text-center bg-brand-subtle/50">
                    {row.us ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-status-success text-fg-inverse">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-sunken text-fg-disabled">
                        <X size={14} strokeWidth={3} />
                      </span>
                    )}
                  </td>
                  <td className="p-4 md:p-5 text-center">
                    {row.others ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-status-success text-fg-inverse">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-sunken text-fg-disabled">
                        <X size={14} strokeWidth={3} />
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

        {/* Mobile: card-based layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="sm:hidden space-y-4"
        >
          {rows.map((row, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="glass-card p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 min-h-[80px]"
            >
              <span className="text-base font-medium text-fg-secondary flex-1">{row.benefit}</span>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-accent-brand font-semibold">الملكة</span>
                  {row.us ? (
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-status-success text-fg-inverse">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-sunken text-fg-disabled">
                      <X size={14} strokeWidth={3} />
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs text-fg-tertiary font-semibold">الآخرون</span>
                  {row.others ? (
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-status-success text-fg-inverse">
                      <Check size={14} strokeWidth={3} />
                    </span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-sunken text-fg-disabled">
                      <X size={14} strokeWidth={3} />
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
