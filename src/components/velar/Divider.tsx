import { cn } from "@/lib/utils";

export function Divider({
  orientation = "horizontal",
  label,
  className,
}: {
  orientation?: "horizontal" | "vertical";
  label?: string;
  className?: string;
}) {
  if (orientation === "vertical") {
    return <div className={cn("w-px h-full bg-line", className)} />;
  }
  if (label) {
    return (
      <div className={cn("flex items-center gap-3 text-xs text-fg-tertiary uppercase tracking-wider", className)}>
        <div className="flex-1 h-px bg-line" />
        <span>{label}</span>
        <div className="flex-1 h-px bg-line" />
      </div>
    );
  }
  return <hr className={cn("border-0 h-px bg-line", className)} />;
}
