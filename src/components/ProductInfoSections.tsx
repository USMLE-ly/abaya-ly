import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, RotateCcw, ShieldCheck, ChevronDown } from "lucide-react";

const SECTIONS = [
  {
    id: "shipping",
    icon: Truck,
    title: "الشحن والتوصيل",
    summary: "توصيل مجاني داخل بنغازي خلال 3-5 أيام عمل",
    body: [
      "توصيل مجاني داخل بنغازي — بدون أي رسوم إضافية.",
      "مدة التوصيل من 3 إلى 5 أيام عمل من تأكيد الطلب.",
      "الدفع عند الاستلام متاح 💵 — ادفعي عند وصول الطلب.",
      "يتم التواصل معك عبر الهاتف أو واتساب لتأكيد موعد التسليم.",
    ],
    link: { to: "/shipping-policy", label: "سياسة الشحن الكاملة" },
  },
  {
    id: "returns",
    icon: RotateCcw,
    title: "سياسة الإرجاع",
    summary: "إرجاع أو استبدال مجاني خلال 7 أيام من الاستلام",
    body: [
      "إرجاع أو استبدال خلال 7 أيام من تاريخ الاستلام.",
      "يجب أن يكون الفستان بحالته الأصلية مع جميع الملصقات.",
      "استرداد كامل المبلغ أو استبدال بمقاس أو لون آخر.",
      "التواصل معنا عبر واتساب لبدء عملية الإرجاع بسهولة.",
    ],
    link: { to: "/refund-policy", label: "سياسة الإرجاع والاسترداد" },
  },
  {
    id: "warranty",
    icon: ShieldCheck,
    title: "الضمان والجودة",
    summary: "ضمان جودة شامل على جميع الفساتين",
    body: [
      "أقمشة عالمية مضمونة من أفضل المصانع الأوروبية.",
      "فحص جودة دقيق لكل فستان قبل الشحن.",
      "في حال وجود أي عيب تصنيع — استبدال فوري دون أي تكلفة.",
      "خياطة عالية الجودة مع تعليمات عناية مرفقة مع كل قطعة.",
    ],
    link: { to: "/faq", label: "الأسئلة الشائعة" },
  },
];

export function ProductInfoSections() {
  const [open, setOpen] = useState<string>("shipping");

  return (
    <section className="py-8 md:py-12" aria-label="معلومات الشحن والإرجاع والضمان">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {SECTIONS.map((sec) => {
            const isOpen = open === sec.id;
            return (
              <div
                key={sec.id}
                className="rounded-2xl transition-all duration-300 h-fit"
                style={{
                  background: isOpen ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.6)",
                  border: isOpen ? "1px solid rgba(196,40,85,0.22)" : "1px solid rgba(196,40,85,0.1)",
                  boxShadow: isOpen ? "0 8px 30px rgba(196,40,85,0.06)" : "none",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? "" : sec.id)}
                  className="w-full flex items-center gap-3 p-4 text-start"
                  aria-expanded={isOpen}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
                    style={{
                      background: isOpen ? "rgba(196,40,85,0.12)" : "rgba(196,40,85,0.06)",
                      border: "1px solid rgba(196,40,85,0.12)",
                    }}
                  >
                    <sec.icon size={16} className="text-accent-brand" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-fg">{sec.title}</p>
                    <p className="text-[10px] text-fg-tertiary leading-tight mt-0.5">{sec.summary}</p>
                  </div>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className="text-fg-quaternary flex-shrink-0"
                  >
                    <ChevronDown size={14} />
                  </motion.span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4">
                        <ul className="space-y-2">
                          {sec.body.map((line, i) => (
                            <li key={i} className="text-[11px] text-fg-secondary leading-relaxed flex items-start gap-2">
                              <span className="text-accent-brand mt-0.5">•</span>
                              {line}
                            </li>
                          ))}
                        </ul>
                        <Link
                          to={sec.link.to}
                          className="inline-flex items-center gap-1 mt-3 text-[11px] font-bold text-accent-brand hover:underline"
                        >
                          {sec.link.label}
                          <ChevronDown size={11} className="rotate-[-90deg]" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
