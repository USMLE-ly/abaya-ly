import { motion, AnimatePresence } from "framer-motion";
import { X, Ruler } from "lucide-react";

interface SizeGuideProps {
  open: boolean;
  onClose: () => void;
}

const SIZE_DATA = [
  { size: "XS", bust: "80-84", waist: "60-64", hip: "86-90", dress: "145" },
  { size: "S", bust: "84-88", waist: "64-68", hip: "90-94", dress: "147" },
  { size: "M", bust: "88-92", waist: "68-72", hip: "94-98", dress: "149" },
  { size: "L", bust: "92-96", waist: "72-76", hip: "98-102", dress: "151" },
  { size: "XL", bust: "96-100", waist: "76-80", hip: "102-106", dress: "153" },
  { size: "2XL", bust: "100-104", waist: "80-84", hip: "106-110", dress: "155" },
  { size: "3XL", bust: "104-108", waist: "84-88", hip: "110-114", dress: "157" },
];

export function SizeGuide({ open, onClose }: SizeGuideProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[250] flex items-center justify-center p-4"
          style={{ background: "rgba(17,15,13,0.70)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.97)", border: "1px solid rgba(196,40,85,0.12)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-line-subtle">
              <h3 className="text-base font-bold text-fg flex items-center gap-2">
                <Ruler size={18} className="text-accent-brand" />
                دليل المقاسات
              </h3>
              <button onClick={onClose} className="text-fg-tertiary hover:text-fg transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-x-auto">
              <p className="text-[11px] text-fg-tertiary mb-4 leading-relaxed">
                القياسات بالسنتيمتر. للمقاسات الخاصة أو التفصيل حسب الطلب، تواصلي معنا عبر واتساب.
              </p>

              <table className="w-full text-xs min-w-[500px]" style={{ direction: "rtl" }}>
                <thead>
                  <tr className="text-right">
                    {["المقاس", "الصدر", "الخصر", "الأرداف", "طول الفستان"].map((h) => (
                      <th key={h} className="p-3 font-bold text-fg-secondary border-b-2" style={{ borderColor: "#c42855" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SIZE_DATA.map((row, i) => (
                    <tr key={row.size} className={i % 2 === 0 ? "bg-white" : ""} style={{ background: i % 2 === 0 ? undefined : "rgba(196,40,85,0.03)" }}>
                      <td className="p-3 font-bold text-accent-brand border-b border-line-subtle">{row.size}</td>
                      <td className="p-3 text-fg-secondary border-b border-line-subtle tabular-nums">{row.bust}</td>
                      <td className="p-3 text-fg-secondary border-b border-line-subtle tabular-nums">{row.waist}</td>
                      <td className="p-3 text-fg-secondary border-b border-line-subtle tabular-nums">{row.hip}</td>
                      <td className="p-3 text-fg-secondary border-b border-line-subtle tabular-nums">{row.dress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 p-3 rounded-xl text-[11px] leading-relaxed" style={{ background: "rgba(196,40,85,0.06)", border: "1px solid rgba(196,40,85,0.1)" }}>
                <p className="font-bold text-fg mb-1">💡 نصيحة:</p>
                <p className="text-fg-tertiary">
                  إذا كنتِ بين مقاسين، ننصح باختيار المقاس الأكبر. جميع فساتيننا قابلة للتعديل البسيط عند الحاجة.
                  يمكنكِ أيضاً طلب تفصيل حسب مقاسكِ مجاناً — تواصلي معنا عبر واتساب بعد إتمام الطلب.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-line-subtle flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #e63d6a, #c42855)" }}
              >
                فهمت ✓
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
