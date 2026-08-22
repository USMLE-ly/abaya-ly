import { useEffect, useState, useCallback } from "react";
import { Check, Copy, ShoppingBag } from "lucide-react";

interface CouponCardProps {
  code?: string;
  brandName?: string;
  discountLabel?: string;
  expiresAt?: string;
  onCopy?: () => void;
}

function useCountdown(targetIso: string | null) {
  const calc = useCallback(() => {
    if (!targetIso) return { days: 0, hours: 0, minutes: 0 };
    const diff = Math.max(0, new Date(targetIso).getTime() - Date.now());
    return {
      days: Math.floor(diff / 86_400_000),
      hours: Math.floor((diff % 86_400_000) / 3_600_000),
      minutes: Math.floor((diff % 3_600_000) / 60_000),
    };
  }, [targetIso]);

  const [time, setTime] = useState(calc);

  useEffect(() => {
    if (!targetIso) return;
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, [targetIso, calc]);

  return time;
}

const pad = (n: number) => String(n).padStart(2, "0");

export function CouponCard({
  code = "NADINE10",
  brandName = "نادين",
  discountLabel = "كود خصم — على طلبكِ",
  expiresAt,
  onCopy,
}: CouponCardProps) {
  const { days, hours, minutes } = useCountdown(expiresAt ?? null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(code); } catch {}
    setCopied(true);
    onCopy?.();
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      className="mx-auto w-full overflow-hidden rounded-3xl text-center"
      style={{
        maxWidth: "min(420px, calc(100vw - 2rem))",
        background: "linear-gradient(160deg, #0d0d1a 0%, #1a1a2e 100%)",
        border: "1px solid rgba(212,175,55,0.35)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
      }}
    >
      <div className="px-4 py-5 sm:px-6 sm:py-7">

        {/* Brand URL */}
        <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.25em] text-white/30">
          nadine.luxor.ly
        </p>

        {/* Brand name */}
        <h2 className="mb-3 text-xl font-bold text-white sm:text-2xl">{brandName}</h2>

        {/* Code badge */}
        <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
          <span
            dir="ltr"
            className="inline-flex items-center rounded-full px-4 py-1.5 text-sm font-extrabold tracking-[0.15em] sm:text-base"
            style={{ background: "#e6b84c", color: "#1a1a1a" }}
          >
            {code}
          </span>
          <span className="text-xs " style={{ color: "#e6b84c99" }}>
            {discountLabel}
          </span>
        </div>

        {/* Countdown */}
        <div className="mb-4 flex items-center justify-center gap-3 sm:gap-5" dir="ltr">
          {[
            { value: days, label: "يوم" },
            { value: hours, label: "ساعة" },
            { value: minutes, label: "دقيقة" },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center" style={{ minWidth: "clamp(56px, 18vw, 72px)" }}>
              <span
                className="font-bold tabular-nums leading-none"
                style={{
                  fontSize: "clamp(1.8rem, 9vw, 2.6rem)",
                  color: "#ffffff",
                  fontFamily: "'Inter', system-ui, sans-serif",
                }}
              >
                {pad(value)}
              </span>
              <span className="mt-1 text-[10px] sm:text-xs" style={{ color: "rgba(230,184,76,0.7)" }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="mb-4 text-[11px]" style={{ color: "rgba(255,255,255,0.35)" }}>
          عند الحجز — ينتهي العداد أعلاه
        </p>

        {/* Action buttons */}
        <div className="flex items-stretch justify-center gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-all active:scale-[0.98] ${
              copied ? "bg-green-600/90 text-white" : "text-black"
            }`}
            style={copied ? undefined : { background: "#e6b84c" }}
          >
            {copied ? <Check size={15} strokeWidth={2.5} /> : <Copy size={14} />}
            {copied ? "تم النسخ!" : "نسخ الكود"}
          </button>
          <a
            href="/collections"
            className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-bold transition-all active:scale-[0.98]"
            style={{ borderColor: "rgba(212,175,55,0.5)", color: "#e6b84c" }}
          >
            <ShoppingBag size={14} />
            احجز الآن
          </a>
        </div>
      </div>
    </div>
  );
}
