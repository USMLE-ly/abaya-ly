import { memo } from "react";
import { BadgeCheck, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Barcode } from "@/components/ui/barcode";
import { productPageUrl } from "@/lib/barcode";
import { GOLD_DEEP, GOLD_LINE, GOLD_MID, MUTED, STRAWBERRY } from "@/components/certificate/tokens";

export interface AuthenticatedPiece {
  id?: string;
  name: string;
  code: string;
  collection?: string;
  color?: string;
  size?: string;
  edition?: string;
  image?: string;
  quantity?: number;
}

export interface AuthenticatedProductCardProps {
  piece: AuthenticatedPiece;
  /** 1-based piece number — drives the barcode and the registry row. */
  pieceNumber: number;
  barcodeValue: string;
  onCertificate?: () => void;
  /** Flatten the outer card chrome — used inside a unified order segment. */
  flat?: boolean;
  /** Hide the per-piece barcode (deduplicated in the success ticket). */
  showBarcode?: boolean;
  className?: string;
}

/** Luxury product passport — one card per authenticated piece. */
export const AuthenticatedProductCard = memo(function AuthenticatedProductCard({
  piece,
  pieceNumber,
  barcodeValue,
  onCertificate,
  flat = false,
  showBarcode = true,
  className,
}: AuthenticatedProductCardProps) {
  const fields = [
    { label: "المجموعة", value: piece.collection },
    { label: "اللون", value: piece.color },
    { label: "المقاس", value: piece.size },
    { label: "الإصدار", value: piece.edition },
  ].filter((f) => f.value);

  return (
    <div
      className={cn("w-full overflow-hidden rounded-3xl bg-white", className)}
      style={{
        border: flat ? "1px solid rgba(201,162,94,0.25)" : "1px solid rgba(201,162,94,0.4)",
        boxShadow: flat ? "none" : "0 18px 44px -26px rgba(34,32,28,0.25)",
      }}
    >
      <div className="flex gap-4 p-4 sm:p-5">
        {/* Garment image */}
        {piece.image ? (
          <img
            src={piece.image}
            alt={piece.name}
            className="h-32 w-24 flex-shrink-0 rounded-2xl object-cover"
            style={{ border: "1px solid rgba(201,162,94,0.3)" }}
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-32 w-24 flex-shrink-0 items-center justify-center rounded-2xl"
            style={{ background: "rgba(244,234,208,0.5)", border: "1px solid rgba(201,162,94,0.3)" }}
            aria-hidden="true"
          >
            <ShieldCheck size={28} style={{ color: GOLD_MID }} />
          </div>
        )}

        {/* Identity */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p
              className="truncate text-[15px] font-bold"
              style={{ color: "#22201c", fontFamily: "'Playfair Display', Tajawal, serif" }}
              title={piece.name}
            >
              {piece.name || "—"}
            </p>
            <span
              className="inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold"
              style={{ background: "rgba(196,40,85,0.08)", border: "1px solid rgba(196,40,85,0.35)", color: STRAWBERRY }}
            >
              <BadgeCheck size={11} />
              قطعة موثّقة
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {fields.map((f) => (
              <span
                key={f.label}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium"
                style={{ background: "#faf6ec", border: "1px solid rgba(201,162,94,0.3)", color: MUTED }}
              >
                <span className="font-bold" style={{ color: GOLD_DEEP }}>{f.label}:</span>
                {f.value}
              </span>
            ))}
          </div>

          <p className="mt-2.5 text-[10px] font-semibold tabular-nums tracking-wider" style={{ color: GOLD_DEEP }}>
            رقم القطعة · P{pieceNumber}
            {piece.quantity && piece.quantity > 1 ? ` · الكمية ${piece.quantity}` : ""}
          </p>
        </div>
      </div>

      {/* Barcode strip */}
      <div
        className="flex flex-col items-center gap-1 border-t px-4 py-3"
        style={{ borderColor: "rgba(201,162,94,0.25)", background: "#fffdf9" }}
      >
        {showBarcode && <Barcode value={barcodeValue} href={productPageUrl(piece.id)} label="رمز التوثيق" className="w-full max-w-[320px]" />}
        {onCertificate && (
          <button
            onClick={onCertificate}
            className="mt-1 inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-[11px] font-bold transition-all hover:bg-black/[0.02] active:scale-[0.98]"
            style={{ borderColor: GOLD_LINE, color: GOLD_DEEP }}
          >
            <ShieldCheck size={13} />
            عرض شهادة الأصالة
          </button>
        )}
      </div>
    </div>
  );
});
