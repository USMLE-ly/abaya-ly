import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Ruler, Wand2, Check } from "lucide-react";

interface SizeGuideProps {
  open: boolean;
  onClose: () => void;
  onSelectSize?: (size: string) => void;
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

const CONVERSION_DATA = [
  { size: "XS", eu: "34", uk: "6", us: "2" },
  { size: "S", eu: "36", uk: "8", us: "4" },
  { size: "M", eu: "38", uk: "10", us: "6" },
  { size: "L", eu: "40", uk: "12", us: "8" },
  { size: "XL", eu: "42", uk: "14", us: "10" },
  { size: "2XL", eu: "44-46", uk: "16-18", us: "12-14" },
  { size: "3XL", eu: "48-52", uk: "20-22", us: "16-18" },
];

const FIT_NOTES = [
  { title: "قصّة ضيقة (Slim)", note: "تلتصق بالجسم بشكل أنيق — اختاري مقاسكِ المعتاد أو الأكبر إذا كنتِ تفضلين الراحة." },
  { title: "قصّة عادية (Regular)", note: "تنسدل بشكل مريح مع الحفاظ على خطوط الجسم — الخيار الأمثل لمعظم القياسات." },
  { title: "قصّة واسعة (Loose)", note: "فضفاضة ومريحة — اختاري مقاسكِ المعتاد أو الأصغر إذا أردتِ مظهراً أكثر تحديداً." },
  { title: "طول الفستان", note: "الأطوال بالسنتيمتر تشمل كامل الفستان من أعلى الكتف. ارتداء الكعب العالي يزيد الطول الظاهر." },
  { title: "بين مقاسين؟", note: "ننصح باختيار المقاس الأكبر ثم تعديله عند الخياط إذا لزم — جميع فساتيننا قابلة للتعديل البسيط." },
];

const CATALOG_SIZES = ["S", "M", "L", "XL"];
type Fit = "slim" | "regular" | "loose";

function suggestSize(heightCm: number, weightKg: number, fit: Fit): string {
  const bmi = weightKg / Math.pow(heightCm / 100, 2);
  let idx = 0; // index into CATALOG_SIZES
  if (bmi < 19) idx = 0;
  else if (bmi < 22) idx = 0;
  else if (bmi < 25) idx = 1;
  else if (bmi < 28) idx = 2;
  else idx = 3;

  if (fit === "slim") idx = Math.max(0, idx - 1);
  if (fit === "loose") idx = Math.min(CATALOG_SIZES.length - 1, idx + 1);
  if (heightCm >= 178) idx = Math.min(CATALOG_SIZES.length - 1, idx + 1);
  return CATALOG_SIZES[idx];
}

export function SizeGuide({ open, onClose, onSelectSize }: SizeGuideProps) {
  const [tab, setTab] = useState<"table" | "conversion" | "wizard">("table");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [fit, setFit] = useState<Fit>("regular");
  const [suggested, setSuggested] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSuggest = () => {
    const h = Number(height);
    const w = Number(weight);
    if (!h || !w || h < 120 || h > 220 || w < 30 || w > 250) {
      setError("أدخلي الطول (سم) والوزن (كغ) بشكل صحيح");
      setSuggested(null);
      return;
    }
    setError("");
    setSuggested(suggestSize(h, w, fit));
  };

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
            className="w-full max-w-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
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

            {/* Tabs */}
            <div className="flex border-b border-line-subtle">
              {([["table", "جدول القياسات"], ["conversion", "جدول التحويل"], ["wizard", "ساعديني أختار مقاسي"] ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex-1 py-3 text-xs font-bold transition-colors ${
                    tab === key ? "text-brand border-b-2" : "text-fg-tertiary hover:text-fg"
                  }`}
                  style={tab === key ? { borderColor: "#c42855" } : { borderColor: "transparent" }}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "table" ? (
              <>
                <div className="p-5 overflow-x-auto overflow-y-auto flex-1 min-h-0">
                  <p className="text-[11px] text-fg-tertiary mb-4 leading-relaxed">
                    القياسات بالسنتيمتر. إذا احتجتِ مساعدة في اختيار مقاسكِ، تواصلي معنا عبر واتساب.
                  </p>

                  <table className="w-full text-xs min-w-[500px]" style={{ direction: "rtl" }}>
                    <thead>
                      <tr className="text-start">
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
                    </p>
                  </div>

                  <div className="mt-5">
                    <p className="text-xs font-bold text-fg mb-3">ملاحظات القصّة والملاءمة</p>
                    <div className="space-y-2">
                      {FIT_NOTES.map((f) => (
                        <div
                          key={f.title}
                          className="p-3 rounded-xl text-[11px] leading-relaxed"
                          style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(196,40,85,0.08)" }}
                        >
                          <p className="font-bold text-fg mb-0.5">{f.title}</p>
                          <p className="text-fg-tertiary">{f.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : tab === "conversion" ? (
              <div className="p-5 overflow-y-auto flex-1 min-h-0">
                <p className="text-[11px] text-fg-tertiary mb-4 leading-relaxed">
                  جدول التحويل بين المقاسات الأوروبية (EU) والبريطانية (UK) والأمريكية (US) — القيم تقريبية وقد تختلف قليلاً حسب الماركة.
                </p>

                <table className="w-full text-xs min-w-[420px]" style={{ direction: "rtl" }}>
                  <thead>
                    <tr className="text-start">
                      {["المقاس", "أوروبي EU", "بريطاني UK", "أمريكي US"].map((h) => (
                        <th key={h} className="p-3 font-bold text-fg-secondary border-b-2" style={{ borderColor: "#c42855" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CONVERSION_DATA.map((row, i) => (
                      <tr key={row.size} style={{ background: i % 2 === 0 ? undefined : "rgba(196,40,85,0.03)" }}>
                        <td className="p-3 font-bold text-accent-brand border-b border-line-subtle">{row.size}</td>
                        <td className="p-3 text-fg-secondary border-b border-line-subtle tabular-nums">{row.eu}</td>
                        <td className="p-3 text-fg-secondary border-b border-line-subtle tabular-nums">{row.uk}</td>
                        <td className="p-3 text-fg-secondary border-b border-line-subtle tabular-nums">{row.us}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-4 p-3 rounded-xl text-[11px] leading-relaxed" style={{ background: "rgba(196,40,85,0.06)", border: "1px solid rgba(196,40,85,0.1)" }}>
                  <p className="font-bold text-fg mb-1">ملاحظة:</p>
                  <p className="text-fg-tertiary">
                    مقاسات نادين مبنية على القياسات الأوروبية. إذا كنتِ معتادة على المقاسات الأمريكية، اختاري مقاساً أصغر برقم واحد.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-5 overflow-y-auto flex-1 min-h-0">
                <p className="text-[11px] text-fg-tertiary mb-4 leading-relaxed">
                  أدخلي طولكِ ووزنكِ وسنقترح عليكِ المقاس الأنسب — ثم تأكديه من جدول القياسات أو اختاريه مباشرة.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-[11px] font-semibold text-fg-tertiary block mb-1">الطول (سم)</label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="مثال: 165"
                      className="w-full px-3 py-2.5 text-sm text-fg bg-white/60 rounded-xl border border-line-subtle outline-none focus:border-accent-brand transition-colors placeholder:text-fg-tertiary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-fg-tertiary block mb-1">الوزن (كغ)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="مثال: 60"
                      className="w-full px-3 py-2.5 text-sm text-fg bg-white/60 rounded-xl border border-line-subtle outline-none focus:border-accent-brand transition-colors placeholder:text-fg-tertiary"
                    />
                  </div>
                </div>

                <p className="text-[11px] font-semibold text-fg-tertiary mb-2">القصّة المفضلة</p>
                <div className="flex gap-2 mb-4">
                  {([["slim", "ضيق"], ["regular", "عادي"], ["loose", "واسع"]] as const).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => { setFit(key); setSuggested(null); }}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        fit === key ? "text-white" : "text-fg bg-white/60 border border-line-subtle hover:bg-sunken"
                      }`}
                      style={fit === key ? { background: "#c42855" } : undefined}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {error && <p className="text-[11px] text-status-danger mb-3">{error}</p>}

                <button
                  onClick={handleSuggest}
                  className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #e63d6a, #c42855)" }}
                >
                  <Wand2 size={16} />
                  اعرضي المقاس المناسب
                </button>

                {suggested && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-2xl p-5 text-center"
                    style={{ background: "rgba(196,40,85,0.06)", border: "1px solid rgba(196,40,85,0.15)" }}
                  >
                    <p className="text-[11px] text-fg-tertiary mb-1">المقاس المقترح لكِ</p>
                    <p className="text-4xl font-bold text-brand mb-2">{suggested}</p>
                    <p className="text-[11px] text-fg-tertiary leading-relaxed mb-3">
                      تقديري بناءً على طولكِ ووزنكِ — قارنيه بجدول القياسات، وسنؤكد المقاس بدقة عند الاتصال.
                    </p>
                    {onSelectSize ? (
                      <button
                        onClick={() => { onSelectSize(suggested); onClose(); }}
                        className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5"
                        style={{ background: "#c42855" }}
                      >
                        <Check size={14} />
                        اختاري هذا المقاس
                      </button>
                    ) : (
                      <p className="text-[11px] font-semibold text-fg">اختاري المقاس {suggested} من قائمة المقاسات أعلاه</p>
                    )}
                  </motion.div>
                )}
              </div>
            )}

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
