import { useState } from "react";
import { Check, Copy } from "lucide-react";

interface Props {
  code: string;
  label?: string;
  onReveal?: (code: string) => void;
}

export function ClickableDiscount({ code, label = "كوبون خصم خاص بكِ", onReveal }: Props) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch { /* clipboard unavailable */ }
    setCopied(true);
    onReveal?.(code);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      data-debug="clickable-discount-real"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClick(); }}
      aria-label={label}
      className={`w-full max-w-full cursor-pointer select-none rounded-2xl border px-3 py-3.5 transition-colors duration-200 ${
        copied
          ? "border-green-300 bg-green-50"
          : "border-pink-200 bg-gradient-to-br from-white via-pink-50/80 to-pink-100/60"
      }`}
      style={{ boxSizing: "border-box" }}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Left: label + helper */}
        <div className="flex flex-col gap-0.5 min-w-0 overflow-hidden">
          <span className={`text-sm font-bold truncate leading-tight ${copied ? "text-green-700" : "text-gray-900"} sm:text-[15px]`}>
            {copied ? "تم نسخ الكود!" : label}
          </span>
          <span className={`text-[11px] leading-tight ${copied ? "text-green-600" : "text-gray-400"}`}>
            {copied ? "انسخيه واستخدميه في الحجز" : "اضغطي للكشف عن الكود"}
          </span>
        </div>

        {/* Right: code badge */}
        <div
          className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold tracking-widest ${
            copied ? "bg-green-100 text-green-700" : "bg-pink-50 text-pink-600"
          }`}
          dir="ltr"
        >
          <span>{code}</span>
          {copied ? <Check size={12} strokeWidth={3} /> : <Copy size={11} strokeWidth={2} />}
        </div>
      </div>
    </div>
  );
}
