import { memo, useEffect, useMemo, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";
import { CheckCircle2, ChevronLeft, HandCoins, MessageCircle, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Barcode } from "@/components/ui/barcode";
import { GOLD_DEEP, GOLD_LINE, MUTED, STRAWBERRY } from "@/components/certificate/tokens";

export interface OrderSuccessCardProps {
  orderId: string;
  customerName: string;
  /** Arabic locale date string. */
  date: string;
  pieceCount: number;
  barcodeValue: string;
  paymentLabel?: string;
  statusLabel?: string;
  trackHref: string;
  onTrack?: () => void;
  onContinue?: () => void;
  onCertificate?: () => void;
  certificateAvailable: boolean;
  whatsappHref?: string;
  /** Render ticket cut-out circles (for plain backgrounds). */
  cutouts?: boolean;
  /** Extra order-dashboard sections (timeline, pieces, payment, docs) rendered inside the ticket. */
  children?: ReactNode;
  className?: string;
}

const CONFETTI_COLORS = ["#c42855", "#e63d6a", "#f9577f", "#c9a25e", "#b48a45", "#e6d5a6"];

/** Dashed ticket separator. */
const DashedLine = memo(function DashedLine() {
  return <div className="w-full border-t-2 border-dashed border-border/60" aria-hidden="true" />;
});

/** Full-viewport celebration confetti — brand palette, deterministic per mount. */
const ConfettiExplosion = memo(function ConfettiExplosion() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 64 }, (_, i) => ({
        left: Math.random() * 100,
        top: -20 + Math.random() * 10,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rotate: Math.random() * 360,
        duration: 2.5 + Math.random() * 2.5,
        delay: Math.random() * 2,
      })),
    []
  );

  return (
    <>
      <style>{`@keyframes confetti-fall { 0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }`}</style>
      <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
        {pieces.map((p, i) => (
          <div
            key={i}
            className="absolute h-4 w-2"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              backgroundColor: p.color,
              transform: `rotate(${p.rotate}deg)`,
              animation: `confetti-fall ${p.duration}s ${p.delay}s linear forwards`,
            }}
          />
        ))}
      </div>
    </>
  );
});

/** Premium order confirmation ticket — matches the AnimatedTicket reference in Arabic RTL. */
export const OrderSuccessCard = memo(function OrderSuccessCard({
  orderId,
  customerName,
  date,
  pieceCount,
  barcodeValue,
  paymentLabel = "الدفع عند الاستلام",
  statusLabel = "قيد التأكيد",
  trackHref,
  onTrack,
  onContinue,
  onCertificate,
  certificateAvailable,
  whatsappHref,
  cutouts = false,
  children,
  className,
}: OrderSuccessCardProps) {
  const reduced = useReducedMotion();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const mountTimer = setTimeout(() => setShowConfetti(true), 100);
    const unmountTimer = setTimeout(() => setShowConfetti(false), 6500);
    return () => {
      clearTimeout(mountTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  const pieceLabel = pieceCount > 1 ? `${pieceCount} قطع موثّقة` : "قطعة موثّقة";
  const orderTail = orderId.replace(/^NAD[-_]?/i, "").slice(-4);

  return (
    <>
      {showConfetti && !reduced && <ConfettiExplosion />}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "relative z-10 w-full max-w-sm rounded-2xl bg-card font-sans text-card-foreground shadow-lg",
          className
        )}
        style={{
          boxShadow: "0 18px 50px -22px rgba(34,32,28,0.32), 0 8px 24px -18px rgba(196,40,85,0.25)",
          border: "1px solid rgba(201,162,94,0.35)",
        }}
        role="status"
        aria-live="polite"
      >
        {/* Ticket cut-out effect */}
        {cutouts && (
          <>
            <div className="absolute -left-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background" aria-hidden="true" />
            <div className="absolute -right-4 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background" aria-hidden="true" />
          </>
        )}

        {/* Success mark + heading */}
        <div className="flex flex-col items-center p-8 text-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 210, damping: 16 }}
            className="rounded-full bg-primary/10 p-3"
          >
            <CheckCircle2
              className="h-10 w-10"
              style={{ color: STRAWBERRY }}
              strokeWidth={2}
              aria-hidden="true"
            />
          </motion.div>
          <h1 className="mt-4 text-2xl font-bold" style={{ color: "#22201c" }}>
            شكراً لاختيارك نادين
          </h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground">
            تم استلام طلبك بنجاح
          </p>
        </div>

        <div className="space-y-6 px-6 pb-8 sm:px-8">
          <DashedLine />

          {/* Order registry — ticket ID + certified pieces */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">رقم الطلب</p>
              <p className="mt-0.5 font-mono text-sm font-semibold tabular-nums tracking-wider" dir="ltr" style={{ textAlign: "right", color: "#22201c" }}>
                {orderId}
              </p>
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground">القطع الموثّقة</p>
              <p className="mt-0.5 text-lg font-semibold" style={{ color: STRAWBERRY }}>
                {pieceLabel}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">تاريخ الطلب</p>
            <p className="mt-0.5 font-medium" style={{ color: "#22201c" }}>
              {date}
            </p>
          </div>

          {/* Recipient + payment strip */}
          <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/60 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                <HandCoins size={18} style={{ color: STRAWBERRY }} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold" style={{ color: "#22201c" }}>
                  {customerName || "—"}
                </p>
                <p className="text-xs text-muted-foreground">{paymentLabel}</p>
              </div>
            </div>
            <span
              className="flex-shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold"
              style={{ background: "rgba(196,40,85,0.08)", border: "1px solid rgba(196,40,85,0.3)", color: STRAWBERRY }}
            >
              {statusLabel}
            </span>
          </div>

          <DashedLine />

          {/* Authentication barcode */}
          <Barcode value={barcodeValue} label="رمز التوثيق" className="mx-auto" />

          {whatsappHref && !children && (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-1.5 text-[11px] font-semibold"
              style={{ color: MUTED }}
            >
              <MessageCircle size={13} />
              استفسري عن طلبك عبر واتساب
            </a>
          )}

          {children && (
            <>
              <DashedLine />
              <div className="space-y-4">{children}</div>
            </>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Link
              to={trackHref}
              onClick={onTrack}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.015] active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #e63d6a, #c42855)",
                boxShadow: "0 10px 24px -12px rgba(196,40,85,0.55)",
              }}
            >
              تتبعي طلبكِ الآن
              <ChevronLeft size={16} />
            </Link>

            <div className="flex gap-3">
              {certificateAvailable && onCertificate && (
                <button
                  onClick={onCertificate}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border text-sm font-bold transition-all active:scale-[0.98]"
                  style={{ borderColor: GOLD_LINE, color: GOLD_DEEP, background: "rgba(244,234,208,0.3)" }}
                >
                  <ScrollText size={16} />
                  عرض شهادة الأصالة
                </button>
              )}
              <button
                onClick={onContinue}
                className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold transition-all hover:bg-black/[0.03] active:scale-[0.98]"
                style={{ border: "1px solid rgba(34,32,28,0.12)", color: "#22201c" }}
              >
                متابعة التسوق
              </button>
            </div>
          </div>

          <p className="text-center text-[10px]" style={{ color: MUTED }}>
            سيتم الاتصال بكِ خلال 24 ساعة لتأكيد الطلب
          </p>
        </div>
      </motion.div>
    </>
  );
});
