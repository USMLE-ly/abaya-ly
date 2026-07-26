import type { HTMLAttributes, ReactNode } from "react";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const tag = cva(
  "inline-flex items-center gap-1.5 font-medium rounded-md text-xs px-2 py-1 border",
  {
    variants: {
      tone: {
        brand:   "border-transparent",
        neutral: "border-transparent",
        success: "border-transparent",
        info:    "border-transparent",
        warning: "border-transparent",
        danger:  "border-transparent",
      },
      appearance: { solid: "", subtle: "" },
    },
    compoundVariants: [
      { appearance: "solid", tone: "brand",   className: "bg-brand text-fg-on-accent" },
      { appearance: "solid", tone: "neutral", className: "bg-cotton-800 text-fg-on-accent" },
      { appearance: "solid", tone: "success", className: "bg-success text-fg-on-accent" },
      { appearance: "solid", tone: "info",    className: "bg-info text-fg-on-accent" },
      { appearance: "solid", tone: "warning", className: "bg-warning text-cotton-950" },
      { appearance: "solid", tone: "danger",  className: "bg-danger text-fg-on-accent" },

      { appearance: "subtle", tone: "brand",   className: "bg-brand-subtle text-brand border-strawberry-200" },
      { appearance: "subtle", tone: "neutral", className: "bg-cotton-100 text-cotton-800 border-cotton-200" },
      { appearance: "subtle", tone: "success", className: "bg-success-subtle text-mint-700 border-mint-200" },
      { appearance: "subtle", tone: "info",    className: "bg-info-subtle text-sky-700 border-sky-200" },
      { appearance: "subtle", tone: "warning", className: "bg-warning-subtle text-lemon-800 border-lemon-200" },
      { appearance: "subtle", tone: "danger",  className: "bg-danger-subtle text-strawberry-700 border-strawberry-200" },
    ],
    defaultVariants: { tone: "neutral", appearance: "subtle" },
  }
);

export interface TagProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "onRemove">,
    VariantProps<typeof tag> {
  leadingIcon?: ReactNode;
  onRemove?: () => void;
}

export function Tag({ className, tone, appearance, leadingIcon, onRemove, children, ...rest }: TagProps) {
  return (
    <span className={cn(tag({ tone, appearance }), className)} {...rest}>
      {leadingIcon}
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="hover:opacity-70 -mr-0.5"
          aria-label="Remove"
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}
