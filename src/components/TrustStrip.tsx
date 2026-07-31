import { Link } from "react-router-dom";
import { Truck, RotateCcw, Banknote, MessageCircle, ShieldCheck } from "lucide-react";

const items = [
  { icon: Truck, title: "شحن مجاني", note: "لجميع مدن ليبيا · 3-5 أيام", to: "/shipping-policy" },
  { icon: Banknote, title: "الدفع عند الاستلام", note: "لا تدفعين قبل أن تستلمي", to: "/faq" },
  { icon: RotateCcw, title: "إرجاع خلال 7 أيام", note: "بالحالة الأصلية، بدون تعقيد", to: "/refund-policy" },
  { icon: ShieldCheck, title: "أقمشة مضمونة", note: "فحص يدوي قبل الشحن", to: "/about" },
  { icon: MessageCircle, title: "دعم عبر الواتساب", note: "ردّ خلال ساعات النهار", to: "/contact" },
];

export function TrustStrip({ compact = false }: { compact?: boolean }) {
  return (
    <section aria-label="ضمانات المتجر" className={compact ? "py-6" : "py-10 md:py-14"}>
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {items.map((item) => (
            <Link
              key={item.title}
              to={item.to}
              className="group flex flex-col items-center text-center gap-2 rounded-2xl border border-line-subtle bg-raised px-3 py-4 transition-colors hover:bg-sunken min-h-11"
            >
              <span className="w-9 h-9 rounded-xl grid place-items-center bg-sunken group-hover:scale-105 transition-transform">
                <item.icon size={16} className="text-accent-brand" strokeWidth={1.6} aria-hidden="true" />
              </span>
              <span className="text-[11px] font-bold text-fg leading-tight">{item.title}</span>
              <span className="text-[10px] text-fg-tertiary leading-tight">{item.note}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
