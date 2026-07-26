import type { HTMLAttributes, ReactNode } from "react";
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alert = cva("flex gap-3 rounded-xl border p-4", {
  variants: {
    tone: {
      info:    "bg-info-subtle border-sky-200 text-sky-900",
      success: "bg-success-subtle border-mint-200 text-mint-900",
      warning: "bg-warning-subtle border-lemon-200 text-lemon-900",
      danger:  "bg-danger-subtle border-strawberry-200 text-strawberry-900",
      neutral: "bg-sunken border-line text-fg",
    },
  },
  defaultVariants: { tone: "info" },
});

const ICONS = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  neutral: Info,
} as const;

export interface AlertProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof alert> {
  title?: string;
  action?: ReactNode;
  onDismiss?: () => void;
}

export function Alert({ tone = "info", title, action, onDismiss, className, children, ...rest }: AlertProps) {
  const Icon = ICONS[tone ?? "info"];
  return (
    <div role="alert" className={cn(alert({ tone }), className)} {...rest}>
      <Icon size={20} className="shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && <div className="font-semibold text-base leading-tight mb-0.5">{title}</div>}
        {children && <div className="text-sm opacity-90">{children}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
