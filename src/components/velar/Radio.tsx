import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  sublabel?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  { label, sublabel, disabled, className, id, ...rest },
  ref
) {
  const auto = useId();
  const rid = id ?? auto;
  return (
    <label htmlFor={rid} className={cn("inline-flex items-start gap-2.5 cursor-pointer select-none", disabled && "cursor-not-allowed opacity-60", className)}>
      <span className="relative inline-flex shrink-0 mt-0.5">
        <input ref={ref} id={rid} type="radio" disabled={disabled} className="peer sr-only" {...rest} />
        <span className="w-[18px] h-[18px] rounded-full border-2 border-line-strong bg-raised flex items-center justify-center peer-checked:border-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand/30 transition-colors">
          <span className="w-2 h-2 rounded-full bg-brand scale-0 peer-checked:scale-100 transition-transform" />
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
