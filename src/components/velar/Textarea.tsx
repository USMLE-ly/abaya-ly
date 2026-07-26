import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, required, disabled, className, id, ...rest },
  ref
) {
  const auto = useId();
  const tid = id ?? auto;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={tid} className="text-sm font-medium text-fg">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={tid}
        disabled={disabled}
        aria-invalid={!!error}
        className={cn(
          "min-h-24 w-full rounded-lg border bg-raised px-3 py-2 text-base outline-none transition-colors focus:ring-2 focus:ring-brand/30",
          error ? "border-danger focus:border-danger focus:ring-danger/30" : "border-line focus:border-brand",
          disabled && "bg-sunken text-fg-disabled cursor-not-allowed border-line-subtle"
        )}
        {...rest}
      />
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="text-xs text-fg-tertiary">{hint}</p>
      ) : null}
    </div>
  );
});
