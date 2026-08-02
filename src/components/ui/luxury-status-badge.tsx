import { memo } from "react";
import { cn } from "@/lib/utils";

export interface StatusTone {
  bg: string;
  border: string;
  text: string;
  dot: string;
}

export const STATUS_TONES: Record<string, StatusTone> = {
  pending: {
    bg: "rgba(201,162,94,0.14)",
    border: "rgba(201,162,94,0.5)",
    text: "#8a6d2f",
    dot: "#c9a25e",
  },
  processing: {
    bg: "rgba(196,40,85,0.08)",
    border: "rgba(196,40,85,0.4)",
    text: "#9c1f44",
    dot: "#c42855",
  },
  waiting_shipping: {
    bg: "rgba(154,116,48,0.1)",
    border: "rgba(154,116,48,0.45)",
    text: "#7c5c22",
    dot: "#b48a45",
  },
  shipped: {
    bg: "rgba(196,40,85,0.07)",
    border: "rgba(196,40,85,0.35)",
    text: "#9c1f44",
    dot: "#e63d6a",
  },
  delivered: {
    bg: "rgba(16,128,84,0.1)",
    border: "rgba(16,128,84,0.4)",
    text: "#0b6b46",
    dot: "#10a060",
  },
};

export const DEFAULT_TONE: StatusTone = STATUS_TONES.pending;

export interface LuxuryStatusBadgeProps {
  status: string;
  label: string;
  className?: string;
}

/** Quiet, luxury status pill with a soft pulsing dot. */
export const LuxuryStatusBadge = memo(function LuxuryStatusBadge({
  status,
  label,
  className,
}: LuxuryStatusBadgeProps) {
  const tone = STATUS_TONES[status] ?? DEFAULT_TONE;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold",
        className
      )}
      style={{ background: tone.bg, border: `1px solid ${tone.border}`, color: tone.text }}
      role="status"
    >
      <span className="relative flex h-2 w-2">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
          style={{ background: tone.dot }}
        />
        <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: tone.dot }} />
      </span>
      {label}
    </span>
  );
});
