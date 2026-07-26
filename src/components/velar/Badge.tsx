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
      appearance: { solid: "", subtle: "" },
      size:  { sm: "text-2xs px-2 py-0.5", md: "text-xs px-2.5 py-1", lg: "text-sm px-3 py-1.5" },
    },
    compoundVariants: [
      { appearance: "subtle", tone: "brand",   className: "bg-brand-subtle text-brand" },
      { appearance: "subtle", tone: "neutral", className: "bg-cotton-100 text-cotton-700" },
      { appearance: "subtle", tone: "success", className: "bg-success-subtle text-mint-700" },
      { appearance: "subtle", tone: "info",    className: "bg-info-subtle text-sky-700" },
      { appearance: "subtle", tone: "warning", className: "bg-warning-subtle text-lemon-800" },
      { appearance: "subtle", tone: "danger",  className: "bg-danger-subtle text-strawberry-700" },
    ],
    defaultVariants: { tone: "brand", appearance: "solid", size: "md" },
  }
);

export interface BadgeProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "style">,
    VariantProps<typeof badge> {
  style?: React.CSSProperties;
}

export function Badge({ className, tone, appearance, size, style, ...rest }: BadgeProps) {
  return <span style={style} className={cn(badge({ tone, appearance, size }), className)} {...rest} />;
}
