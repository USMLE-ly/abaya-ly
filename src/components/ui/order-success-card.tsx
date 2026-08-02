import { memo } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Check, ChevronLeft, MessageCircle, ScrollText, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Barcode } from "@/components/ui/barcode";
import { GOLD_DEEP, GOLD_LINE, GOLD_MID, MUTED, STRAWBERRY } from "@/components/certificate/tokens";

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
  className?: string;
}

const DashedDivider = memo(function DashedDivider() {
  return (
    <div
      className="my-6 border-t border-dashed"
      style={{ borderColor: "rgba(201,162,94,0.5)" }}
      aria-hidden="true"
    />
  );
});

/** Premium order confirmation card — ticket architecture, luxury presentation. */
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
  className,
}: OrderSuccessCardProps) {
  const pieceLabel = pieceCount > 1 ? `${pieceCount} قطع موثّقة` : "قطعة موثّقة";

  const rows = [
    { label: "رقم الطلب", value: orderId, mono: true },
    { label: "القطع الموثّقة", value: pieceLabel },
    { label: "الاسم الكريم", value: customerName || "—" },
    { label: "تاريخ الطلب", value: date },
    { label: "طريقة الدفع", value: paymentLabel },
    { label: "حالة الطلب", value: statusLabel, status: true },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn("relative w-full rounded-[28px] bg-white", className)}
      style={{
        boxShadow:
          "0 24px 60px -24px rgba(34,32,28,0.28), 0 8px 24px -16px rgba(196,40,85,0.18)",
        border: `1px solid ${GOLD_LINE}`,
      }}
      role="status"
      aria-live="polite"
    >
      {/* Ticket cut-out effect */}
      {cutouts && (
        <>
          <div className="absolute -right-4 top-[30%] h-8 w-8 rounded-full bg-transparent" style={{ boxShadow: `inset 8px 0 0 0 #f7f3ea` }} aria-hidden="true" />
          <div className="absolute -left-4 top-[30%] h-8 w-8 rounded-full bg-transparent" style={{ boxShadow: `inset -8px 0 0 0 #f7f3ea` }} aria-hidden="true" />
        </>
      )}

      <div className="p-6 sm:p-8">
        {/* Success mark + heading */}
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 220, damping: 16 }}
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: "rgba(196,40,85,0.08)", border: `1px solid rgba(196,40,85,0.25)` }}
          >
            <Check size={30} strokeWidth={2.6} style={{ color: STRAWBERRY }} />
          </motion.div>

          <div className="mt-4 flex items-center gap-1.5">
            <Sparkles size={13} style={{ color: GOLD_MID }} />
            <p className="text-[10px] font-bold tracking-[0.32em]" style={{ color: GOLD_DEEP }}>
              NADINE LUXURY
            </p>
          </div>

          <h2 className="mt-2 text-xl font-bold" style={{ color: "#22201c" }}>
            شكراً لاختيارك نادين
          </h2>
          <p className="mt-1 text-sm font-medium" style={{ color: MUTED }}>
            تم استلام طلبك بنجاح — قطعتكِ قيد التوثيق
          </p>
        </div>

        <DashedDivider />

        {/* Order registry */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
          {rows.map((row) => (
            <div
              key={row.label}
              className="border-b pb-2"
              style={{ borderColor: "rgba(201,162,94,0.18)" }}
            >
              <dt className="text-[10px] font-semibold" style={{ color: MUTED }}>
                {row.label}
              </dt>
              <dd
                className={cn(
                  "mt-0.5 text-[13px] font-bold",
                  row.mono && "font-mono tabular-nums tracking-wider"
                )}
                dir={row.mono ? "ltr" : undefined}
                style={{
                  color: row.status ? STRAWBERRY : "#22201c",
                  textAlign: row.mono ? "right" : undefined,
                }}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>

        <DashedDivider />

        {/* Authentication barcode */}
        <Barcode
          value={barcodeValue}
          label="رمز التوثيق"
          className="mx-auto"
        />

        {/* WhatsApp query */}
        {whatsappHref && (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 text-[11px] font-semibold"
            style={{ color: MUTED }}
          >
            <MessageCircle size={13} />
            استفسري عن طلبك عبر واتساب
          </a>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3">
          <Link
            to={trackHref}
            onClick={onTrack}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.015] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #e63d6a, #c42855)", boxShadow: "0 10px 24px -12px rgba(196,40,85,0.55)" }}
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

        <p className="mt-4 text-center text-[10px]" style={{ color: MUTED }}>
          سيتم الاتصال بكِ خلال 24 ساعة لتأكيد الطلب
        </p>
      </div>
    </motion.div>
  );
});
