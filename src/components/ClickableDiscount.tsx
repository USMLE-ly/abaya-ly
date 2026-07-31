import { useState } from "react";
import { Ticket, Check, Copy } from "lucide-react";

interface Props {
  code: string;
  label?: string;
  onReveal?: (code: string) => void;
}

/** Shrine-style clickable discount: tap to reveal + copy the code. */
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
      onClick={handleClick}
      className={`group flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-start transition-all duration-300 ${
        copied
          ? "border-success bg-success/5"
          : "border-dashed border-strawberry-300/70 bg-strawberry-50/70 hover:border-brand hover:bg-brand-subtle/60"
      }`}
    >
      <span className="flex items-center gap-2.5 min-w-0">
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${copied ? "bg-success/10" : "bg-brand-subtle"}`}>
          {copied ? <Check size={15} className="text-success" /> : <Ticket size={15} className="text-brand" />}
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-bold text-fg truncate">{copied ? "تم نسخ الكود!" : label}</span>
          <span className={`block text-[10px] ${copied ? "text-success" : "text-fg-tertiary"}`}>
            {copied ? "انسخيه واستخدميه في الحجز" : "اضغطي للكشف عن الكود ونسخه"}
          </span>
        </span>
      </span>
      <span className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-sm font-bold tracking-wider text-brand tabular-nums" dir="ltr">{code}</span>
        <Copy size={13} className="text-brand/60" />
      </span>
    </button>
  );
}
