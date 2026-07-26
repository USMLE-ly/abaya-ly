import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badge = cva(
  "inline-flex items-center gap-1 font-medium rounded-full whitespace-nowrap",
  {
    variants: {
      tone: {
        brand:   "bg-brand text-fg-on-accent",
        neutral: "bg-cotton-200 text-cotton-800",
        success: "bg-success text-fg-on-accent",
        info:    "bg-info text-fg-on-accent",
        warning: "bg-warning text-cotton-950",
        danger:  "bg-danger text-fg-on-accent",
      },
      style: { solid: "", subtle: "" },
      size:  { sm: "text-2xs px-2 py-0.5", md: "text-xs px-2.5 py-1", lg: "text-sm px-3 py-1.5" },
    },
    compoundVariants: [
      { style: "subtle", tone: "brand",   className: "bg-brand-subtle text-brand" },
      { style: "subtle", tone: "neutral", className: "bg-cotton-100 text-cotton-700" },
      { style: "subtle", tone: "success", className: "bg-success-subtle text-mint-700" },
      { style: "subtle", tone: "info",    className: "bg-info-subtle text-sky-700" },
      { style: "subtle", tone: "warning", className: "bg-warning-subtle text-lemon-800" },
      { style: "subtle", tone: "danger",  className: "bg-danger-subtle text-strawberry-700" },
    ],
    defaultVariants: { tone: "brand", style: "solid", size: "md" },
  }
);

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badge> {}

export function Badge({ className, tone, style, size, ...rest }: BadgeProps) {
  return <span className={cn(badge({ tone, style, size }), className)} {...rest} />;
}
