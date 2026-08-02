import { memo } from "react";
import { cn } from "@/lib/utils";
import { hashString, seededRandom } from "@/lib/barcode";
import { GOLD_DEEP, MUTED } from "@/components/certificate/tokens";

const BAR_COUNT = 56;
const VIEW_W = 280;
const VIEW_H = 60;
const BAR_Y = 8;
const BAR_H = 44;

export interface BarcodeProps {
  value: string;
  className?: string;
  /** Gold for the certificate, charcoal for screen cards. */
  tone?: "charcoal" | "gold";
  /** Optional caption above the barcode. */
  label?: string;
  /** Show the barcode value below the bars. Defaults to true. */
  showValue?: boolean;
}

/** Deterministic, scannable-looking barcode — identical bars for identical values. */
export const Barcode = memo(function Barcode({
  value,
  className,
  tone = "charcoal",
  label,
  showValue = true,
}: BarcodeProps) {
  const bars = useBars(value);
  const color = tone === "gold" ? GOLD_DEEP : "#22201c";
  const gap = 1.6;
  const total = bars.reduce((acc, w) => acc + w + gap, 0) - gap;
  let x = (VIEW_W - total) / 2;

  return (
    <div
      className={cn("flex flex-col items-center", className)}
      role="img"
      aria-label={`Barcode ${value}`}
    >
      {label && (
        <p
          className="mb-1.5 text-[9px] font-bold tracking-[0.28em] uppercase"
          style={{ color: tone === "gold" ? GOLD_DEEP : MUTED }}
        >
          {label}
        </p>
      )}
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-14 w-full max-w-[300px]"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {bars.map((width, i) => {
          const left = x;
          x += width + gap;
          return (
            <rect
              key={i}
              x={left}
              y={BAR_Y}
              width={width}
              height={BAR_H}
              rx={0.4}
              fill={color}
            />
          );
        })}
      </svg>
      {showValue && (
        <p
          dir="ltr"
          className="mt-1.5 text-[10px] font-semibold tabular-nums tracking-[0.18em]"
          style={{ color: tone === "gold" ? GOLD_DEEP : "#22201c", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
        >
          {value}
        </p>
      )}
    </div>
  );
});

function useBars(value: string): number[] {
  const rng = seededRandom(hashString(value));
  return Array.from({ length: BAR_COUNT }, () => {
    const rand = rng();
    return rand > 0.68 ? 2.4 : rand > 0.34 ? 1.6 : 1;
  });
}
