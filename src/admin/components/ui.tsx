import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { cn } from "@/lib/utils";
import { statusMeta } from "../lib/types";

/* ── Card (Elstar Card) ───────────────────────────────────────── */
export function ACard({
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-[var(--ad-r-lg)]", className)}
      style={{
        background: "var(--nd-white)",
        border: "1px solid var(--nd-border)",
        boxShadow: "var(--ad-e1)",
      }}
      {...rest}
    />
  );
}

export function ACardHeader({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
      <div>
        <h3 className="text-[18px] font-bold leading-7" style={{ color: "var(--nd-text)" }}>
          {title}
        </h3>
        {subtitle && (
          <p className="text-[13px] mt-0.5" style={{ color: "var(--nd-text-3)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

/* ── Button (Elstar Button) ───────────────────────────────────── */
type BtnVariant = "solid" | "default" | "plain" | "danger";
type BtnSize = "xs" | "sm" | "md";

export function AButton({
  variant = "default",
  size = "md",
  className,
  icon,
  children,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  size?: BtnSize;
  icon?: ReactNode;
}) {
  const sizes: Record<BtnSize, string> = {
    xs: "h-8 px-3 text-[12px] gap-1.5 rounded-[10px]",
    sm: "h-9 px-3.5 text-[13px] gap-2 rounded-[10px]",
    md: "h-11 px-5 text-[14px] gap-2 rounded-[12px]",
  };
  const styles: Record<BtnVariant, React.CSSProperties> = {
    solid: { background: "var(--nd-primary-500)", color: "#fff" },
    default: {
      background: "var(--nd-white)",
      color: "var(--nd-text-2)",
      border: "1px solid var(--nd-border)",
    },
    plain: { background: "transparent", color: "var(--nd-text-2)" },
    danger: { background: "#EF4444", color: "#fff" },
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-bold whitespace-nowrap transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-[0.97] active:scale-[0.985]",
        sizes[size],
        className
      )}
      style={styles[variant]}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

/* ── Input / Select (Elstar Input) ────────────────────────────── */
export function AInput({
  className,
  icon,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { icon?: ReactNode }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 h-11 px-3.5 rounded-[12px] transition-colors focus-within:ring-4",
        className
      )}
      style={{
        background: "var(--nd-white)",
        border: "1px solid var(--nd-border)",
        // @ts-expect-error css var
        "--tw-ring-color": "rgba(206,44,96,0.15)",
      }}
    >
      {icon && <span style={{ color: "var(--nd-text-4)" }}>{icon}</span>}
      <input
        className="flex-1 min-w-0 bg-transparent outline-none text-[14px]"
        style={{ color: "var(--nd-text)" }}
        {...rest}
      />
    </div>
  );
}

export function ASelect({
  className,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 px-3.5 rounded-[12px] text-[14px] outline-none cursor-pointer",
        className
      )}
      style={{
        background: "var(--nd-white)",
        border: "1px solid var(--nd-border)",
        color: "var(--nd-text-2)",
      }}
      {...rest}
    >
      {children}
    </select>
  );
}

/* ── Status badge ─────────────────────────────────────────────── */
export function StatusBadge({ status, size = "md" }: { status: string; size?: "sm" | "md" }) {
  const m = statusMeta(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-bold whitespace-nowrap",
        size === "sm" ? "text-[11px] px-2.5 py-1" : "text-[12px] px-3 py-1.5"
      )}
      style={{ background: m.bg, color: m.color }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: m.color }}
      />
      {m.label}
    </span>
  );
}

/* ── Skeleton ─────────────────────────────────────────────────── */
export function ASkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-[12px]", className)}
      style={{ background: "var(--nd-bg)" }}
    />
  );
}

/* ── Empty state ──────────────────────────────────────────────── */
export function AEmpty({
  icon,
  title,
  hint,
}: {
  icon?: ReactNode;
  title: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      {icon && <div style={{ color: "var(--nd-text-4)" }}>{icon}</div>}
      <p className="text-[15px] font-bold" style={{ color: "var(--nd-text-2)" }}>
        {title}
      </p>
      {hint && (
        <p className="text-[13px]" style={{ color: "var(--nd-text-3)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}
