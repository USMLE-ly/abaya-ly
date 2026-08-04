import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { X, Truck, Banknote, ShoppingBag } from "lucide-react";
import { cartCount, subscribeToCart } from "@/lib/cart";
import { trackCta } from "@/lib/analytics";
import {
  dismissAnnounce,
  getAnnounceState,
  setAnnounceHeight,
  subscribeAnnounceState,
} from "@/lib/announcement";

const messages = [
  { icon: Truck, text: "توصيل مجاني داخل بنغازي · التوصيل خلال 3-5 أيام", to: "/shipping-policy" },
  { icon: Banknote, text: "الدفع عند الاستلام · إرجاع سهل خلال 7 أيام", to: "/refund-policy" },
];

export function AnnouncementBar() {
  const [announce, setAnnounce] = useState(getAnnounceState);
  const [index, setIndex] = useState(0);
  const [pending, setPending] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeAnnounceState(setAnnounce), []);

  useEffect(() => {
    const sync = () => setPending(cartCount());
    sync();
    return subscribeToCart(sync);
  }, []);

  // Report the rendered height so the fixed header stays below this bar
  // instead of overlapping it (which used to block header icon clicks).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      setAnnounceHeight(0);
      return;
    }
    const report = () => setAnnounceHeight(root.offsetHeight);
    report();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(report);
      ro.observe(root);
      return () => {
        ro.disconnect();
        setAnnounceHeight(0);
      };
    }
    return () => setAnnounceHeight(0);
  }, [announce.visible]);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % messages.length), 6000);
    return () => clearInterval(t);
  }, []);

  if (!announce.visible) return null;

  const hasCart = pending > 0;
  const Icon = hasCart ? ShoppingBag : messages[index].icon;

  return (
    <div
      ref={rootRef}
      className="relative z-[60] w-full text-center text-[11px] sm:text-xs font-medium"
      style={{ background: "#c42855", color: "#fff" }}
      role="region"
      aria-label="إعلان المتجر"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-10 py-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
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
        onClick={dismissAnnounce}
        aria-label="إغلاق الإعلان"
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 opacity-80 hover:opacity-100"
      >
        <X size={13} />
      </button>
    </div>
  );
}
