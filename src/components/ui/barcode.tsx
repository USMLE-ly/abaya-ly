import { memo, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import { Check, Download } from "lucide-react";
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
  /** Show the barcode value below the code. Defaults to true. */
  showValue?: boolean;
  /** Real scannable QR target — when set, the code is a genuine QR encoding this
   *  URL (readable by phone camera scanners), and acts as a hyperlink when tapped. */
  href?: string;
  /** Card presentation (border + shadow + download). Defaults to true. */
  card?: boolean;
}

/** Deterministic, scannable-looking barcode — identical bars for identical values.
 *  When `href` is provided it becomes a real QR code (scan/tap opens the dress page). */
export const Barcode = memo(function Barcode({
  value,
  className,
  tone = "charcoal",
  label,
  showValue = true,
  href,
  card = true,
}: BarcodeProps) {
  const target = href?.trim() || "";
  const color = tone === "gold" ? GOLD_DEEP : "#22201c";

  if (target) {
    return (
      <BarcodeCard
        value={value}
        target={target}
        color={color}
        tone={tone}
        label={label}
        showValue={showValue}
        card={card}
        className={className}
      />
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

interface BarcodeCardProps {
  value: string;
  target: string;
  color: string;
  tone: "charcoal" | "gold";
  label?: string;
  showValue: boolean;
  card: boolean;
  className?: string;
}

/** Card presentation inspired by the QRCodeDisplay component — white rounded card,
 *  padded code box, scan caption and a download-PNG action with saved/loading states. */
function BarcodeCard({ value, target, color, tone, label, showValue, card, className }: BarcodeCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLAnchorElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    const node = codeRef.current || ref.current;
    if (!node) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(node, {
        pixelRatio: 3,
        backgroundColor: "#ffffff",
        cacheBust: true,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `qr-code-${value.replace(/[^\w-]/g, "_").slice(0, 40)}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 1500);
    } catch (error) {
      console.error("Failed to download QR code:", error);
    } finally {
      setDownloading(false);
    }
  };

  const borderColor = tone === "gold" ? "rgba(201,162,94,0.45)" : "rgba(34,32,28,0.14)";
  const accent = tone === "gold" ? GOLD_DEEP : "#22201c";

  return (
    <div
      ref={ref}
      className={cn("w-full", card && "rounded-xl border bg-white p-4 shadow-sm", className)}
      style={card ? { borderColor } : undefined}
    >
      {label && (
        <p
          className="text-center text-[11px] font-bold tracking-[0.28em] uppercase"
          style={{ color: accent }}
        >
          {label}
        </p>
      )}
      {showValue && (
        <p
          dir="ltr"
          className="mt-1 text-center text-[9px] font-semibold tabular-nums tracking-[0.14em]"
          style={{ color: tone === "gold" ? GOLD_DEEP : MUTED, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}
        >
          {value}
        </p>
      )}
      <a
        ref={codeRef}
        href={target}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`افتح صفحة القطعة: ${target}`}
        title="امسحي رمز QR لفتح صفحة القطعة"
        className="mt-2 block rounded-lg bg-white p-2 transition-all hover:opacity-95 active:scale-[0.99]"
      >
        <QRCodeSVG
          value={target}
          size={140}
          level="M"
          marginSize={4}
          bgColor="#ffffff"
          fgColor={color}
          className="mx-auto block h-auto w-full max-w-[170px]"
        />
      </a>
      <p
        className="mt-1.5 text-center text-[8.5px] font-semibold"
        style={{ color: tone === "gold" ? GOLD_DEEP : "#8c8276" }}
      >
        امسحي الرمز لفتح صفحة القطعة
      </p>
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        aria-busy={downloading}
        aria-live="polite"
        aria-label={
          downloaded
            ? "تم حفظ رمز التوثيق"
            : downloading
              ? "جارٍ تحميل رمز التوثيق"
              : "تحميل رمز التوثيق PNG"
        }
        className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border text-[11px] font-bold transition-all hover:bg-black/[0.02] active:scale-[0.99] disabled:opacity-60"
        style={{ borderColor, color: accent }}
      >
        {downloaded ? (
          <>
            <Check size={14} />
            تم الحفظ
          </>
        ) : (
          <>
            <Download size={14} />
            {downloading ? "جارٍ التحميل…" : "تحميل PNG"}
          </>
        )}
      </button>
    </div>
  );
}

function useBars(value: string): number[] {
  const rng = seededRandom(hashString(value));
  return Array.from({ length: BAR_COUNT }, () => {
    const rand = rng();
    return rand > 0.68 ? 2.4 : rand > 0.34 ? 1.6 : 1;
  });
}
