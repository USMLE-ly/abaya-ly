import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OutfitSealItem {
  name: string;
  code: string;
  collection?: string;
  color?: string;
  size?: string;
  edition?: string;
}

/** Compact gold certification medallion for a single authenticated outfit. */
export function OutfitSeal({
  item,
  orderId,
  className,
}: {
  item: OutfitSealItem;
  orderId: string;
  className?: string;
}) {
  return (
    <div
      title={`${item.name || ""} — ${item.code || ""} — الشهادة: ${orderId}`}
      className={cn(
        "relative flex h-20 w-20 items-center justify-center rounded-full",
        className
      )}
      style={{ border: "1.5px solid #c9a25e", background: "#fdfaf3" }}
    >
      <div
        className="absolute inset-1 rounded-full"
        style={{ border: "1px dashed rgba(201,162,94,0.7)" }}
      />
      <div
        className="absolute inset-2.5 rounded-full"
        style={{ border: "1px solid rgba(196,40,85,0.35)" }}
      />
      <div className="px-2 text-center">
        <Star size={11} className="mx-auto fill-[#c42855] text-[#c42855]" />
        <p className="mt-0.5 line-clamp-2 text-[8.5px] font-bold leading-tight text-fg">
          {item.name || "—"}
        </p>
        <p className="mt-0.5 text-[7px] tabular-nums" style={{ color: "#9c7138" }}>
          {item.code || ""}
        </p>
      </div>
    </div>
  );
}
