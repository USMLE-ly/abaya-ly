import { Truck } from "lucide-react";

const AR_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const AR_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

function formatDate(d: Date): string {
  return `${AR_DAYS[d.getDay()]} ${d.getDate()} ${AR_MONTHS[d.getMonth()]}`;
}

interface Props {
  minDays?: number;
  maxDays?: number;
}

/** Shrine-style estimated shipping with dynamic delivery dates (Libya, 3–7 days). */
export function ProductShippingEstimate({ minDays = 3, maxDays = 7 }: Props) {
  const now = new Date();
  const start = new Date(now.getTime() + minDays * 864e5);
  const end = new Date(now.getTime() + maxDays * 864e5);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-line-subtle bg-sunken/60 px-4 py-3">
      <div className="w-9 h-9 rounded-lg bg-brand-subtle flex items-center justify-center flex-shrink-0">
        <Truck size={16} className="text-brand" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold text-fg">التوصيل المتوقع</p>
        <p className="text-[11px] text-fg-secondary leading-relaxed">
          اطلبي الآن ليصلكِ بين <span className="font-bold text-brand">{formatDate(start)}</span> و<span className="font-bold text-brand">{formatDate(end)}</span> — شحن مجاني لجميع مدن ليبيا
        </p>
      </div>
    </div>
  );
}
