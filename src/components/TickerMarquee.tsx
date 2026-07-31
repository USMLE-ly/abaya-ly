import { Sparkles } from "lucide-react";

const PHRASES = [
  "توصيل مجاني لجميع مدن ليبيا",
  "الدفع عند الاستلام",
  "أقمشة فاخرة بخياطة راقية",
  "تفصيل حسب المقاس",
  "إرجاع سهل خلال 7 أيام",
];

/** Shrine-style horizontal ticker — seamless RTL marquee. */
export function TickerMarquee() {
  const row = [...PHRASES, ...PHRASES];

  return (
    <div
      className="overflow-hidden py-3 border-y border-line-subtle bg-brand-subtle/40"
      aria-hidden="true"
    >
      <div className="flex w-max animate-[nadineTicker_28s_linear_infinite]" dir="rtl">
        {row.map((phrase, i) => (
          <span key={i} className="flex items-center gap-3 px-6 text-xs font-bold tracking-wide text-brand whitespace-nowrap">
            <Sparkles size={12} />
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
