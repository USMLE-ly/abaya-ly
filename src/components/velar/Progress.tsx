import { cn } from "@/lib/utils";

export function Progress({
  value = 0,
  max = 100,
  tone = "brand",
  className,
}: {
  value?: number;
  max?: number;
  tone?: "brand" | "success" | "warning" | "danger" | "info";
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const bar: Record<string, string> = {
    brand:   "bg-brand",
    success: "bg-success",
    warning: "bg-warning",
    danger:  "bg-danger",
    info:    "bg-info",
  };
  return (
    <div className={cn("h-2 w-full rounded-full bg-cotton-100 overflow-hidden", className)} role="progressbar" aria-valuenow={value} aria-valuemax={max}>
      <div className={cn("h-full rounded-full transition-all duration-300", bar[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}
