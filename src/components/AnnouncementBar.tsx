import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Truck, Sparkles, ShoppingBag } from "lucide-react";
import { cartCount, subscribeToCart } from "@/lib/cart";
import { trackCta } from "@/lib/analytics";

const DISMISS_KEY = "nadine-announce-dismissed";

const messages = [
  { icon: Truck, text: "شحن مجاني لجميع مدن ليبيا · التوصيل خلال 3-5 أيام", to: "/shipping-policy" },
  { icon: Sparkles, text: "الدفع عند الاستلام · إرجاع سهل خلال 7 أيام", to: "/refund-policy" },
];

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(true);
  const [index, setIndex] = useState(0);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
    const sync = () => setPending(cartCount());
    sync();
    return subscribeToCart(sync);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % messages.length), 6000);
    return () => clearInterval(t);
  }, []);

  if (dismissed) return null;

  const hasCart = pending > 0;
  const Icon = hasCart ? ShoppingBag : messages[index].icon;

  return (
    <div
      className="relative z-[60] text-center text-[11px] sm:text-xs font-medium"
      style={{ background: "#c42855", color: "#fff" }}
      role="region"
      aria-label="إعلان المتجر"
    >
      <div className="max-w-[1400px] mx-auto px-10 py-2 flex items-center justify-center gap-2">
        <Icon size={13} className="flex-shrink-0" aria-hidden="true" />
        {hasCart ? (
          <Link to="/cart" onClick={() => trackCta("resume_cart", "announcement_bar")} className="underline underline-offset-2">
            لديكِ {pending} قطعة في السلة — أكملي طلبكِ الآن
          </Link>
        ) : (
          <Link to={messages[index].to} className="hover:underline underline-offset-2">
            {messages[index].text}
          </Link>
        )}
      </div>
      <button
        onClick={() => {
          sessionStorage.setItem(DISMISS_KEY, "1");
          setDismissed(true);
        }}
        aria-label="إغلاق الإعلان"
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 opacity-80 hover:opacity-100"
      >
        <X size={13} />
      </button>
    </div>
  );
}
