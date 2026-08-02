import { memo, useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";
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
  /** Real linear barcode target — when set, the code is a genuine Code 128 barcode
   *  encoding this URL (readable by barcode scanner apps), and acts as a hyperlink
   *  when tapped. */
  href?: string;
}

/** Deterministic, scannable-looking barcode — identical bars for identical values.
 *  When `href` is provided it becomes a real Code 128 linear barcode encoding that
 *  URL (tap opens the dress page; scanner apps read the URL). */
export const Barcode = memo(function Barcode({
  value,
  className,
  tone = "charcoal",
  label,
  showValue = true,
  href,
}: BarcodeProps) {
  const target = href?.trim() || "";
  const color = tone === "gold" ? GOLD_DEEP : "#22201c";

  if (target) {
    return (
      <div className={cn("flex flex-col items-center", className)}>
        {label && (
          <p
            className="mb-1.5 text-[9px] font-bold tracking-[0.28em] uppercase"
            style={{ color: tone === "gold" ? GOLD_DEEP : MUTED }}
          >
            {label}
          </p>
        )}
        <a
          href={target}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`افتح صفحة القطعة: ${target}`}
          title="امسحي الرمز لفتح صفحة القطعة"
          className="inline-flex flex-col items-center rounded-xl border bg-white px-4 py-3 transition-all hover:bg-black/[0.02] active:scale-[0.98]"
          style={{ borderColor: tone === "gold" ? "rgba(201,162,94,0.45)" : "rgba(34,32,28,0.14)" }}
        >
          <LinearBarcode value={target} color={color} />
          <span
            className="mt-1.5 text-[8.5px] font-semibold"
            style={{ color: tone === "gold" ? GOLD_DEEP : "#8c8276" }}
          >
            امسحي الرمز لفتح صفحة القطعة
          </span>
        </a>
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
  }

  const bars = useBars(value);
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

function LinearBarcode({ value, color }: { value: string; color: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    try {
      JsBarcode(el, value, {
        format: "CODE128",
        width: 1.6,
        height: 46,
        margin: 0,
        displayValue: false,
        lineColor: color,
        background: "#ffffff",
      });
    } catch {
      // Code 128 cannot encode this value — keep the element empty rather than crash.
    }
  }, [value, color]);

  return (
    <svg
      ref={ref}
      className="h-14 w-full min-w-[180px] max-w-[300px]"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    />
  );
}

function useBars(value: string): number[] {
  const rng = seededRandom(hashString(value));
  return Array.from({ length: BAR_COUNT }, () => {
    const rand = rng();
    return rand > 0.68 ? 2.4 : rand > 0.34 ? 1.6 : 1;
  });
}
