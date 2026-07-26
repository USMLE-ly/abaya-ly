import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";

const button = cva(
  "inline-flex items-center justify-center gap-2 font-medium select-none transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap",
  {
    variants: {
      variant: {
        primary:     "bg-brand text-fg-on-accent hover:bg-brand-hover active:bg-brand-pressed shadow-e1",
        secondary:   "bg-brand-subtle text-brand hover:bg-brand-subtle-hover active:bg-brand-subtle-hover",
        tertiary:    "bg-transparent text-fg border border-line hover:bg-sunken active:bg-cotton-100",
        ghost:       "bg-transparent text-fg hover:bg-sunken active:bg-cotton-100",
        destructive: "bg-danger text-fg-on-accent hover:opacity-90 active:opacity-80 shadow-e1",
      },
      size: {
        sm: "h-8  px-3   text-sm rounded-md gap-1.5",
        md: "h-10 px-4   text-base rounded-lg",
        lg: "h-12 px-5   text-lg rounded-lg",
      },
      iconOnly: { true: "px-0 aspect-square", false: "" },
      block: { true: "w-full", false: "" },
    },
    defaultVariants: { variant: "primary", size: "md", iconOnly: false, block: false },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, iconOnly, block, leadingIcon, trailingIcon, loading, disabled, children, ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(button({ variant, size, iconOnly: iconOnly || (!children && !!leadingIcon), block }), className)}
      {...rest}
    >
      {loading ? <Spinner size={size === "lg" ? 18 : 14} /> : leadingIcon}
      {children}
      {!loading && trailingIcon}
    </button>
  );
});
