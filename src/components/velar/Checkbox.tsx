import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  sublabel?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, sublabel, indeterminate, disabled, className, id, checked, ...rest },
  ref
) {
  const auto = useId();
  const cid = id ?? auto;
  return (
    <label htmlFor={cid} className={cn("inline-flex items-start gap-2.5 cursor-pointer select-none", disabled && "cursor-not-allowed opacity-60", className)}>
      <span className="relative inline-flex shrink-0 mt-0.5">
        <input
          ref={ref}
          id={cid}
          type="checkbox"
          disabled={disabled}
          checked={checked}
          className="peer sr-only"
          {...rest}
        />
        <span className={cn(
          "w-[18px] h-[18px] rounded border flex items-center justify-center transition-colors",
          "border-line-strong bg-raised",
          "peer-checked:bg-brand peer-checked:border-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand/30",
          indeterminate && "bg-brand border-brand"
        )}>
          {indeterminate ? (
            <Minus size={12} className="text-fg-on-accent" strokeWidth={3} />
          ) : checked ? (
            <Check size={12} className="text-fg-on-accent" strokeWidth={3} />
          ) : null}
        </span>
      </span>
      {(label || sublabel) && (
        <span className="flex flex-col leading-tight">
          {label && <span className="text-sm font-medium text-fg">{label}</span>}
          {sublabel && <span className="text-xs text-fg-tertiary">{sublabel}</span>}
        </span>
      )}
    </label>
  );
});
