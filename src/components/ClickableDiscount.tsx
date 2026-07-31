import { useState } from "react";
import { Ticket, Check, Copy } from "lucide-react";

interface Props {
  code: string;
  label?: string;
  onReveal?: (code: string) => void;
}

/** Ticket-style clickable discount: tap to reveal + copy the code. */
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
      className={`group relative flex w-full items-stretch overflow-visible rounded-2xl border-2 bg-white text-start shadow-sm transition-all duration-300 ${
        copied
          ? "border-success"
          : "border-strawberry-300/70 hover:border-brand hover:shadow-[0_14px_34px_-20px_rgba(196,40,85,0.45)]"
      }`}
    >
      {/* info */}
      <span className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${copied ? "bg-success/10" : "bg-brand-subtle"}`}>
          {copied ? <Check size={16} className="text-success" /> : <Ticket size={16} className="text-brand" />}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-xs font-bold text-fg">{copied ? "تم نسخ الكود!" : label}</span>
          <span className={`block text-[10px] ${copied ? "text-success" : "text-fg-tertiary"}`}>
            {copied ? "انسخيه واستخدميه في الحجز" : "اضغطي للكشف عن الكود ونسخه"}
          </span>
        </span>
      </span>

      {/* perforation */}
      <span className="relative flex items-center px-1" aria-hidden="true">
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 size-5 rounded-full bg-canvas" />
        <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 size-5 rounded-full bg-canvas" />
        <span className="h-9 w-px border-l-2 border-dashed border-strawberry-300/70" />
      </span>

      {/* code stub */}
      <span className="flex items-center gap-2 px-4">
        <span className={`text-sm font-extrabold tabular-nums tracking-[0.18em] ${copied ? "text-success" : "text-brand"}`} dir="ltr">
          {code}
        </span>
        <Copy size={13} className={copied ? "text-success" : "text-brand/60"} />
      </span>
    </button>
  );
}
