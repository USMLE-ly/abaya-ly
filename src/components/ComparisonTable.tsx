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
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text mb-4">
            لماذا <span className="text-brand">الملكة</span>؟
          </h2>
          <p className="text-text-light max-w-2xl mx-auto">
            نقدم لكِ ما لا تجدينه لدى الآخرين — جودة لا تُضاهى بلمسة ليبية أصيلة
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-border overflow-hidden"
        >
          <table className="w-full">
            <thead>
              <tr className="bg-bg-2">
                <th className="text-right p-4 text-sm font-semibold text-text">الميزة</th>
                <th className="p-4 text-center text-sm font-semibold text-brand">الملكة</th>
                <th className="p-4 text-center text-sm font-semibold text-text-light">الآخرون</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className={`border-t border-border ${i % 2 === 0 ? "bg-white" : "bg-bg-2/50"}`}>
                  <td className="p-4 text-sm text-text">{row.benefit}</td>
                  <td className="p-4 text-center">
                    {row.us ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white">
                        <Check size={14} />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-500">
                        <X size={14} />
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {row.others ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white">
                        <Check size={14} />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-500">
                        <X size={14} />
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
