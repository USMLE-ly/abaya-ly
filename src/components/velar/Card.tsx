import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const card = cva("bg-raised text-fg rounded-2xl", {
  variants: {
    elevation: {
      flat:    "shadow-e0 border border-line-subtle",
      subtle:  "shadow-e1 border border-line-subtle",
      raised:  "shadow-e2 border border-line-subtle",
      overlay: "shadow-e3",
      modal:   "shadow-e4",
      toast:   "shadow-e5",
    },
    padding: { none: "", sm: "p-3", md: "p-4", lg: "p-6", xl: "p-8" },
  },
  defaultVariants: { elevation: "subtle", padding: "md" },
});

export interface CardProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof card> {}
export function Card({ className, elevation, padding, ...rest }: CardProps) {
  return <div className={cn(card({ elevation, padding }), className)} {...rest} />;
}
