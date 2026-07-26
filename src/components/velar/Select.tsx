import { forwardRef, useId, type SelectHTMLAttributes, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, disabled, className, id, children, ...rest },
  ref
) {
  const auto = useId();
  const sid = id ?? auto;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <label htmlFor={sid} className="text-sm font-medium text-fg">{label}</label>}
      <div className={cn(
        "relative flex items-center rounded-lg border bg-raised h-10 px-3 focus-within:ring-2 focus-within:ring-brand/30",
        error ? "border-danger focus-within:border-danger" : "border-line focus-within:border-brand",
        disabled && "bg-sunken text-fg-disabled cursor-not-allowed"
      )}>
        <select
          ref={ref}
          id={sid}
          disabled={disabled}
          className="flex-1 bg-transparent outline-none appearance-none pr-6 text-base"
          {...rest}
        >
          {children}
        </select>
        <ChevronDown size={16} className="absolute right-3 text-fg-tertiary pointer-events-none" />
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : hint ? <p className="text-xs text-fg-tertiary">{hint}</p> : null}
    </div>
  );
});
