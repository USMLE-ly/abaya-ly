import { CalendarDays, Clock, MessageCircle, Wallet } from "lucide-react";
import { OrderTracking } from "@/components/ui/order-tracking";
import {
  AuthenticatedProductCard,
  type AuthenticatedPiece,
} from "@/components/ui/authenticated-product-card";
import { pieceBarcode } from "@/lib/barcode";
import { cn } from "@/lib/utils";

/** Shared order-status vocabulary — used by the track page and the success modal. */
export const ORDER_STATUS_STEPS = [
  { key: "pending", label: "تأكيد الطلب", caption: "سيتم الاتصال بكِ لتأكيد الطلب خلال 24 ساعة" },
  { key: "processing", label: "جاري التجهيز", caption: "يتم تجهيز وتغليف قطعتكِ بعناية فائقة" },
  { key: "waiting_shipping", label: "في انتظار الشحن", caption: "الطلب في انتظار وصول الشحنة إلى مركز الشحن" },
  { key: "shipped", label: "جاري الشحن", caption: "سيتم التوصيل إلى عنوانكِ خلال 1-3 أيام عمل" },
  { key: "delivered", label: "تم التوصيل", caption: "تم تسليم طلبكِ بنجاح ✓" },
] as const;

export const ORDER_STATUS_KEYS = ["pending", "processing", "waiting_shipping", "shipped", "delivered"];

export const ORDER_ETA_MAP: Record<string, string> = {
  pending: "سيتم الاتصال بكِ لتأكيد الطلب خلال 24 ساعة",
  processing: "سيتم الشحن خلال 2-3 أيام عمل من تاريخ التأكيد",
  waiting_shipping: "الطلب في انتظار وصول الشحنة إلى مركز الشحن",
  shipped: "سيتم التوصيل إلى عنوانكِ خلال 1-3 أيام عمل",
  delivered: "تم تسليم الطلب ✓",
};

export interface OrderDetailsProps {
  orderId: string;
  status: string;
  /** ISO date used to derive deterministic piece barcodes. */
  createdAt?: string;
  pieces: AuthenticatedPiece[];
  onCertificate?: () => void;
  /** Tighter spacing so the sections fit inside the success modal. */
  compact?: boolean;
  className?: string;
}

/** Order dashboard sections: timeline, authenticated pieces, payment/ETA and documents.
 *  Shared by the track-order page and the embedded success confirmation. */
export function OrderDetails({
  orderId,
  status,
  createdAt = "",
  pieces,
  onCertificate,
  compact = false,
  className,
}: OrderDetailsProps) {
  const statusIndex = Math.max(0, ORDER_STATUS_KEYS.indexOf(status));
  const timelineCard = compact
    ? "rounded-3xl bg-white p-5"
    : "rounded-[28px] bg-white p-6 sm:p-8";
  const sectionCard = compact ? "rounded-3xl bg-white p-5" : "rounded-3xl bg-white p-6";

  return (
    <div className={cn("space-y-4", className)}>
      {/* مسار الطلب — order journey timeline */}
      <div
        className={timelineCard}
        style={{
          border: "1px solid rgba(201,162,94,0.35)",
          boxShadow: "0 18px 44px -30px rgba(34,32,28,0.25)",
        }}
      >
        <h3 className="mb-6 text-center text-[11px] font-bold tracking-[0.28em]" style={{ color: "#b48a45" }}>
          مسار الطلب
        </h3>
        <OrderTracking
          className="mx-auto"
          steps={ORDER_STATUS_STEPS.map((s, i) => ({
            name: s.label,
            timestamp: s.caption ?? "",
            isCompleted: i <= statusIndex,
          }))}
        />
      </div>

      {/* القطع الموثّقة — one passport per authenticated piece */}
      {pieces.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-center text-[11px] font-bold tracking-[0.28em]" style={{ color: "#b48a45" }}>
            القطع الموثّقة
          </h3>
          {pieces.map((piece, i) => (
            <AuthenticatedProductCard
              key={`${piece.code}-${i}`}
              piece={piece}
              pieceNumber={i + 1}
              barcodeValue={pieceBarcode({
                orderId,
                sku: piece.code,
                pieceIndex: i + 1,
                date: createdAt,
              })}
              onCertificate={onCertificate}
            />
          ))}
        </div>
      )}

      {/* Payment + expected delivery */}
      <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
        <div className={sectionCard} style={{ border: "1px solid rgba(201,162,94,0.35)" }}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "rgba(196,40,85,0.08)" }}>
              <Wallet size={17} style={{ color: "#c42855" }} />
            </div>
            <p className="text-sm font-bold" style={{ color: "#22201c" }}>طريقة الدفع</p>
          </div>
          <p className="mt-3 text-[13px] font-semibold" style={{ color: "#5c5348" }}>
            الدفع عند الاستلام 💵
          </p>
        </div>

        <div className={sectionCard} style={{ border: "1px solid rgba(201,162,94,0.35)" }}>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "rgba(196,40,85,0.08)" }}>
              <Clock size={17} style={{ color: "#c42855" }} />
            </div>
            <p className="text-sm font-bold" style={{ color: "#22201c" }}>وقت التوصيل المتوقع</p>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "#5c5348" }}>
            {ORDER_ETA_MAP[status] || "سيتم تحديث وقت التوصيل عند تأكيد الطلب"}
          </p>
          {status !== "delivered" && (
            <p className="mt-1.5 text-[11px]" style={{ color: "#8c8276" }}>
              * التوقيت تقديري وقد يختلف حسب المدينة والظروف
            </p>
          )}
        </div>
      </div>

      {/* Documents — certificate + WhatsApp */}
      <div
        className={cn(
          "flex flex-col items-center gap-4 rounded-3xl bg-white p-6",
          !compact && "sm:flex-row sm:justify-between"
        )}
        style={{ border: "1px solid rgba(201,162,94,0.35)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "rgba(201,162,94,0.14)" }}>
            <CalendarDays size={17} style={{ color: "#b48a45" }} />
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "#22201c" }}>وثائق طلبكِ</p>
            <p className="text-[11px]" style={{ color: "#8c8276" }}>شهادة الأصالة الرسمية متاحة للتحميل</p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={`https://wa.me/218944003708?text=${encodeURIComponent(
              `السلام عليكم، أريد الاستفسار عن طلبي رقم ${orderId}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-xl px-5 text-xs font-bold text-white transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
          >
            <MessageCircle size={15} />
            استفسري عبر واتساب
          </a>
          {onCertificate && (
            <button
              onClick={onCertificate}
              className="inline-flex h-11 items-center gap-2 rounded-xl border px-5 text-xs font-bold transition-all hover:bg-black/[0.02] active:scale-[0.98]"
              style={{ borderColor: "#c9a25e", color: "#9c7138" }}
            >
              عرض شهادة الأصالة
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
