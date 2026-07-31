import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Gift, Check } from "lucide-react";
import { Button } from "@/components/velar";
import { validateCoupon, type Coupon } from "@/lib/cart";
import { trackPopup, trackNewsletter } from "@/lib/analytics";

const EMAIL_KEY = "nadine-email-popup";
const EXIT_KEY = "nadine-exit-popup";
const WELCOME_CODE = "WELCOME10";

const emailValid = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) && v.trim().length <= 255;

function Shell({
  name,
  onClose,
  children,
}: {
  name: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4"
      style={{ background: "rgba(17,15,13,0.6)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={name}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.96 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl bg-raised border border-line-subtle p-7 text-center shadow-e4"
      >
        <button
          onClick={onClose}
          aria-label="إغلاق"
          className="absolute left-3 top-3 p-2 rounded-full text-fg-tertiary hover:text-fg hover:bg-sunken min-h-11 min-w-11 grid place-items-center"
        >
          <X size={16} />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}

function CaptureForm({ source, onDone }: { source: string; onDone: () => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailValid(email)) {
      setError("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }
    setError("");
    setDone(true);
    try {
      localStorage.setItem("nadine-subscriber", email.trim());
    } catch { /* ignore */ }
    trackNewsletter(source);
    trackPopup(source, "converted");
    setTimeout(onDone, 1800);
  };

  if (done) {
    return (
      <p className="flex items-center justify-center gap-2 text-sm font-semibold text-status-success mt-5">
        <Check size={16} /> تم التسجيل — سنراسلكِ عند نزول كل مجموعة جديدة
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="mt-5 space-y-2 text-right">
      <label htmlFor={`popup-email-${source}`} className="sr-only">البريد الإلكتروني</label>
      <input
        id={`popup-email-${source}`}
        type="email"
        inputMode="email"
        maxLength={255}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="بريدكِ الإلكتروني"
        className="w-full rounded-xl border border-line-default bg-sunken px-4 py-3 text-sm text-fg placeholder:text-fg-tertiary outline-none focus-visible:ring-2 focus-visible:ring-accent-brand"
      />
      {error && <p className="text-xs text-status-danger">{error}</p>}
      <Button type="submit" variant="primary" block>اشتركي الآن</Button>
      <p className="text-[10px] text-fg-tertiary text-center pt-1">لا رسائل مزعجة — يمكنكِ إلغاء الاشتراك في أي وقت.</p>
    </form>
  );
}

export function PromoPopups() {
  const [emailOpen, setEmailOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const shown = useRef(false);

  // Delayed / scroll-triggered email capture
  useEffect(() => {
    if (localStorage.getItem(EMAIL_KEY) === "1") return;
    const open = () => {
      if (shown.current || localStorage.getItem(EMAIL_KEY) === "1") return;
      shown.current = true;
      localStorage.setItem(EMAIL_KEY, "1");
      setEmailOpen(true);
      trackPopup("email_capture", "shown");
    };
    const t = setTimeout(open, 25000);
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max > 0 && window.scrollY / max > 0.5) open();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Exit intent — only shows a code if the coupon is real
  useEffect(() => {
    if (localStorage.getItem(EXIT_KEY) === "1") return;
    let armed = true;
    const fire = async () => {
      if (!armed || localStorage.getItem(EXIT_KEY) === "1") return;
      armed = false;
      localStorage.setItem(EXIT_KEY, "1");
      setCoupon(await validateCoupon(WELCOME_CODE));
      setExitOpen(true);
      trackPopup("exit_intent", "shown");
    };
    const onLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) void fire();
    };
    document.addEventListener("mouseout", onLeave);
    return () => document.removeEventListener("mouseout", onLeave);
  }, []);

  const closeEmail = () => {
    setEmailOpen(false);
    trackPopup("email_capture", "dismissed");
  };
  const closeExit = () => {
    setExitOpen(false);
    trackPopup("exit_intent", "dismissed");
  };

  return (
    <AnimatePresence>
      {emailOpen && (
        <Shell key="email" name="اشتراك النشرة البريدية" onClose={closeEmail}>
          <span className="w-12 h-12 rounded-2xl grid place-items-center mx-auto bg-sunken">
            <Mail size={20} className="text-accent-brand" />
          </span>
          <h2 className="font-display text-xl font-bold text-fg mt-4">كوني أول من تعرف</h2>
          <p className="text-sm text-fg-secondary mt-2 leading-relaxed">
            القطع الجديدة تنفد بسرعة. اتركي بريدكِ ونرسل لكِ المجموعة قبل نزولها للجميع.
          </p>
          <CaptureForm source="email_capture" onDone={closeEmail} />
        </Shell>
      )}

      {exitOpen && !emailOpen && (
        <Shell key="exit" name="عرض قبل المغادرة" onClose={closeExit}>
          <span className="w-12 h-12 rounded-2xl grid place-items-center mx-auto bg-sunken">
            <Gift size={20} className="text-accent-brand" />
          </span>
          <h2 className="font-display text-xl font-bold text-fg mt-4">قبل أن تذهبي…</h2>
          {coupon ? (
            <>
              <p className="text-sm text-fg-secondary mt-2 leading-relaxed">
                استخدمي هذا الكود عند إتمام طلبكِ الأول واحصلي على خصم فوري.
              </p>
              <p className="mt-4 text-lg font-bold tracking-[0.25em] text-accent-brand border border-dashed border-line-default rounded-xl py-3">
                {coupon.code}
              </p>
              <p className="text-[11px] text-fg-tertiary mt-2">
                {coupon.type === "percent" ? `خصم ${coupon.value}%` : `خصم ${coupon.value} د.ل`}
                {coupon.minOrder ? ` على الطلبات فوق ${coupon.minOrder} د.ل` : ""}
              </p>
            </>
          ) : (
            <p className="text-sm text-fg-secondary mt-2 leading-relaxed">
              احفظي مكانكِ — اتركي بريدكِ ونعلمكِ فور توفّر القطع المفضلة لديكِ مجدداً.
            </p>
          )}
          <CaptureForm source="exit_intent" onDone={closeExit} />
        </Shell>
      )}
    </AnimatePresence>
  );
}
