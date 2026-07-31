import { Check, AlertTriangle, PackageX } from "lucide-react";

/**
 * Renders availability ONLY when a real stock number exists.
 * No stock data → nothing rendered (never invents scarcity).
 */
export function StockIndicator({
  stock,
  lowStockThreshold = 3,
}: {
  stock?: number;
  lowStockThreshold?: number;
}) {
  if (typeof stock !== "number" || Number.isNaN(stock)) return null;

  if (stock <= 0) {
    return (
      <p className="flex items-center gap-1.5 text-xs font-semibold text-danger" role="status">
        <PackageX size={13} aria-hidden="true" />
        نفدت الكمية حالياً — تواصلي معنا للحجز المسبق
      </p>
    );
  }

  if (stock <= lowStockThreshold) {
    return (
      <p className="flex items-center gap-1.5 text-xs font-semibold text-warning" role="status">
        <AlertTriangle size={13} aria-hidden="true" />
        {stock === 1 ? "آخر قطعة متوفرة" : `بقيت ${stock} قطع فقط`}
      </p>
    );
  }

  return (
    <p className="flex items-center gap-1.5 text-xs font-medium text-status-success" role="status">
      <Check size={13} aria-hidden="true" />
      متوفر — جاهز للشحن
    </p>
  );
}
