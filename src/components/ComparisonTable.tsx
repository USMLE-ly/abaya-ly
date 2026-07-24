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
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading — centered, with highlight */}
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text mb-3">
            لماذا <span className="text-brand">الملكة</span>؟
          </h2>
          <p className="text-sm text-text-light max-w-xl mx-auto">
            نقدم لكِ ما لا تجدينه لدى الآخرين — جودة لا تُضاهى بلمسة ليبية أصيلة
          </p>
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-[20px] border border-border overflow-hidden"
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg-2">
                <th className="text-right p-4 md:p-5 font-semibold text-text w-1/2">
                  الميزة
                </th>
                <th className="p-4 md:p-5 text-center font-semibold text-brand bg-brand/5 w-1/4">
                  الملكة
                </th>
                <th className="p-4 md:p-5 text-center font-semibold text-text-light w-1/4">
                  الآخرون
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  className={`border-t border-border ${
                    i % 2 === 0 ? "bg-white" : "bg-bg-2/40"
                  }`}
                >
                  <td className="p-4 md:p-5 text-text font-medium">{row.benefit}</td>
                  <td className="p-4 md:p-5 text-center bg-brand/5">
                    {row.us ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#53af01] text-white">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-500">
                        <X size={14} strokeWidth={3} />
                      </span>
                    )}
                  </td>
                  <td className="p-4 md:p-5 text-center">
                    {row.others ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#53af01] text-white">
                        <Check size={14} strokeWidth={3} />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-500">
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
