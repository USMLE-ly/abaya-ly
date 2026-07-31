import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  size?: "sm" | "md";
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, size = "md", disabled, className, id, checked, ...rest },
  ref
) {
  const auto = useId();
  const sid = id ?? auto;
  const dims = size === "sm" ? "w-8 h-[18px]" : "w-11 h-6";
  const knob = size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5";
  const translate = size === "sm"
    ? "peer-checked:translate-x-[14px] rtl:peer-checked:-translate-x-[14px]"
    : "peer-checked:translate-x-[20px] rtl:peer-checked:-translate-x-[20px]";
  return (
    <label htmlFor={sid} className={cn("inline-flex items-center gap-2.5 cursor-pointer select-none", disabled && "cursor-not-allowed opacity-60", className)}>
      <span className={cn("relative inline-flex items-center rounded-full transition-colors bg-cotton-300 peer-checked:bg-brand", dims)}>
        <input ref={ref} id={sid} type="checkbox" disabled={disabled} checked={checked} className="peer sr-only" {...rest} />
        <span className={cn("absolute start-0.5 rounded-full bg-white shadow-e1 transition-transform", knob, translate)} />
      </span>
      {label && <span className="text-sm font-medium text-fg">{label}</span>}
    </label>
  );
});
