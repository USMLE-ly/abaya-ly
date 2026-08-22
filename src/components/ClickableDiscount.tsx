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
    } catch {
      /* clipboard unavailable — still show success state */
    }
    setCopied(true);
    onReveal?.(code);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <button
      type="button"
      data-debug="clickable-discount-real"
      onClick={handleClick}
      aria-label={label}
      className={`group relative block w-full cursor-pointer rounded-2xl border border-brand/15 bg-gradient-to-br from-white via-pink-50 to-pink-100 px-4 py-4 text-start shadow-lg shadow-brand/10 transition-all duration-200 active:scale-[0.99] sm:px-6 ${
        copied ? "!border-success/30" : ""
      }`}
      dir="rtl"
    >
      <span className="flex items-center justify-between gap-3">
        {/* main body — label + helper */}
        <span className="flex min-w-0 flex-col justify-center gap-1">
          <span
            className={`truncate text-sm font-bold leading-snug ${copied ? "text-success" : "text-fg"} sm:text-base`}
          >
            {copied ? "تم نسخ الكود!" : label}
          </span>
          <span
            className={`text-xs leading-snug ${copied ? "text-success/80" : "text-fg-tertiary"} sm:text-[13px]`}
          >
            {copied ? "انسخيه واستخدميه في الحجز" : "اضغطي للكشف عن الكود ونسخه"}
          </span>
        </span>

        {/* perforation + stub — code + copy icon */}
        <span className="flex flex-shrink-0 items-center gap-3">
          {/* dashed tear line */}
          <span
            aria-hidden="true"
            className="h-full min-h-[48px] w-px self-stretch"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, rgba(196,40,85,0.35) 0px, rgba(196,40,85,0.35) 6px, transparent 6px, transparent 12px)",
            }}
          />

          <span
            className={`flex flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 font-bold tabular-nums ${
              copied ? "bg-success/10 text-success" : "bg-brand/8 text-brand"
            }`}
          >
            <span dir="ltr" className="text-sm tracking-wider sm:text-base">
              {code}
            </span>
            {copied ? (
              <Check size={14} strokeWidth={2.5} aria-hidden="true" />
            ) : (
              <Copy size={13} strokeWidth={2.25} aria-hidden="true" />
            )}
          </span>
        </span>
      </span>
    </button>
  );
}
