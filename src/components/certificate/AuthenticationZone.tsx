import { memo } from "react";
import { ShieldCheck } from "lucide-react";
import { pieceBarcode, productPageUrl } from "@/lib/barcode";
import { Barcode } from "@/components/ui/barcode";
import { CHARCOAL, GOLD_DEEP, GOLD_LINE, GOLD_MID, MUTED, STRAWBERRY } from "./tokens";
import type { OutfitSealItem } from "./OutfitSeal";

const MAX_VISIBLE = 4;

export interface AuthenticationZoneProps {
  items: OutfitSealItem[];
  orderId: string;
  serial: string;
  date: string;
}

/** Certificate authentication zone — per-piece barcodes + verification registry. */
export const AuthenticationZone = memo(function AuthenticationZone({
  items,
  orderId,
  serial,
  date,
}: AuthenticationZoneProps) {
  const visible = items.slice(0, MAX_VISIBLE);
  const extra = items.length - MAX_VISIBLE;

  return (
    <section className="mt-10" aria-label="منطقة التوثيق">
      {/* Section label */}
      <div className="flex items-center justify-center gap-3">
        <span className="h-px w-12 sm:w-20" style={{ background: "linear-gradient(90deg, transparent, rgba(201,162,94,0.7))" }} />
        <p className="text-[10px] font-bold tracking-[0.3em]" style={{ color: GOLD_DEEP }}>
          منطقة التوثيق
        </p>
        <span className="h-px w-12 sm:w-20" style={{ background: "linear-gradient(90deg, rgba(201,162,94,0.7), transparent)" }} />
      </div>

      <p className="mx-auto mt-3 max-w-md text-center text-[11px] leading-6" style={{ color: MUTED }}>
        كل قطعة موثّقة تحمل رمز توثيق فريداً يُعاد توليده بشكل متطابق من بيانات طلبك —
        يمكن التحقق منه في أي وقت.
      </p>

      {/* Per-piece barcodes */}
      {visible.length > 0 && (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {visible.map((item, i) => {
            const pieceNumber = i + 1;
            const value = pieceBarcode({
              orderId,
              sku: item.code,
              pieceIndex: pieceNumber,
              date,
            });
            return (
              <div
                key={`${item.code}-${pieceNumber}`}
                className="rounded-xl border px-4 py-3"
                style={{ borderColor: "rgba(201,162,94,0.4)", background: "rgba(255,255,255,0.6)" }}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-[11px] font-bold" style={{ color: CHARCOAL }}>
                    {item.name || "قطعة موثّقة"}
                  </p>
                  <span
                    className="inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-bold"
                    style={{ background: "rgba(196,40,85,0.08)", border: "1px solid rgba(196,40,85,0.3)", color: STRAWBERRY }}
                  >
                    <ShieldCheck size={9} />
                    قطعة {pieceNumber}
                  </span>
                </div>
                <Barcode value={value} href={productPageUrl(item.id)} tone="gold" card={false} className="mt-2" />
              </div>
            );
          })}
        </div>
      )}

      {extra > 0 && (
        <p className="mt-2 text-center text-[10px] font-semibold" style={{ color: GOLD_DEEP }}>
          + {extra} قطع إضافية موثّقة ضمن نفس الطلب
        </p>
      )}

      {/* Verification registry */}
      <div
        className="mx-auto mt-5 max-w-lg overflow-hidden rounded-xl border"
        style={{ borderColor: "rgba(201,162,94,0.4)", background: "rgba(253,250,243,0.92)" }}
      >
        <div className="grid grid-cols-1 gap-px sm:grid-cols-3" style={{ background: "rgba(201,162,94,0.4)" }}>
          {[
            { label: "رقم الشهادة", value: serial },
            { label: "تاريخ الإصدار", value: date },
            { label: "معرّف التحقق", value: `${orderId}·${serial.slice(-6)}` },
          ].map((row) => (
            <div key={row.label} className="px-4 py-3 text-center" style={{ background: "rgba(253,250,243,0.95)" }}>
              <p className="text-[9px] font-semibold tracking-wide" style={{ color: GOLD_DEEP }}>
                {row.label}
              </p>
              <p
                className="mt-0.5 text-[11px] font-bold tabular-nums"
                style={{ color: CHARCOAL }}
                dir={row.label === "رقم الشهادة" ? "ltr" : undefined}
              >
                {row.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Micro security typography */}
      <div className="mt-4 overflow-hidden" aria-hidden="true">
        <p
          className="whitespace-nowrap text-center text-[7px] font-semibold tracking-[0.34em]"
          style={{ color: GOLD_MID, opacity: 0.55 }}
        >
          NADINE LUXURY · AUTHENTICITY VERIFIED · NADINE LUXURY · AUTHENTICITY VERIFIED · NADINE LUXURY
        </p>
      </div>
    </section>
  );
});
