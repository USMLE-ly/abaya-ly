import { usePromo } from "@/lib/promo";

const BASE_PHRASES = [
  "توصيل مجاني داخل بنغازي",
  "الدفع عند الاستلام",
  "أقمشة فاخرة بخياطة راقية",
  "إرجاع خلال 7 أيام — أو نعيد لك المبلغ كامل",
];

/** Shrine-style horizontal ticker — seamless RTL marquee. */
export function TickerMarquee() {
  const { promo } = usePromo();
  const phrases = promo?.active
    ? [...BASE_PHRASES, `خصم ${promo.value}% بكود ${promo.code}`]
    : BASE_PHRASES;
  const row = [...phrases, ...phrases];

  return (
    <div
      className="overflow-hidden py-3 border-y border-line-subtle bg-brand-subtle/40"
      aria-hidden="true"
    >
      <div className="flex w-max animate-[nadineTicker_28s_linear_infinite]" dir="rtl">
        {row.map((phrase, i) => (
          <span key={i} className="flex items-center gap-3 px-6 text-xs font-bold tracking-wide text-brand whitespace-nowrap">
            {phrase}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes nadineTicker {
          from { transform: translateX(0); }
          to { transform: translateX(50%); }
        }
      `}</style>
    </div>
  );
}
