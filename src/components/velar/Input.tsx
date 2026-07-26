import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const field = cva(
  "flex items-center gap-2 w-full rounded-lg border bg-raised transition-colors focus-within:ring-2 focus-within:ring-brand/30",
  {
    variants: {
      size: { sm: "h-8 px-2.5 text-sm", md: "h-10 px-3 text-base", lg: "h-12 px-4 text-lg" },
      state: {
        default: "border-line focus-within:border-brand",
        error:   "border-danger focus-within:ring-danger/30 focus-within:border-danger",
        disabled: "border-line-subtle bg-sunken text-fg-disabled cursor-not-allowed",
      },
    },
    defaultVariants: { size: "md", state: "default" },
  }
);

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  sublabel?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  size?: "sm" | "md" | "lg";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, sublabel, hint, error, required, leadingIcon, trailingIcon, size = "md", disabled, className, id, ...rest },
  ref
) {
  const auto = useId();
  const inputId = id ?? auto;
  const state = disabled ? "disabled" : error ? "error" : "default";
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-fg flex items-center gap-1">
          {label}
          {required && <span className="text-danger">*</span>}
          {sublabel && <span className="text-fg-tertiary font-normal">({sublabel})</span>}
        </label>
      )}
      <div className={field({ size, state })}>
        {leadingIcon && <span className="text-fg-tertiary shrink-0">{leadingIcon}</span>}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={!!error}
          className="flex-1 bg-transparent outline-none placeholder:text-fg-tertiary disabled:cursor-not-allowed"
          {...rest}
        />
        {trailingIcon && <span className="text-fg-tertiary shrink-0">{trailingIcon}</span>}
      </div>
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-fg-tertiary">{hint}</p>
      ) : null}
    </div>
  );
});
