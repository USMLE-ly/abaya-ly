import { Flame } from "lucide-react";

interface Props {
  message?: string;
}

/** Shrine-style urgency line shown above the booking button. */
export function UrgencyText({ message = "🔥 الطلب مرتفع هذا الأسبوع — عدد القطع المتاحة محدود" }: Props) {
  return (
    <p className="flex items-center justify-center gap-1.5 text-[11px] font-semibold text-warning">
      <Flame size={12} aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}
