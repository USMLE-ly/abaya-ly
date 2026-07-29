import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ACard } from "./ui";

export function StatCard({
  label,
  value,
  icon,
  accent,
  hint,
  delay = 0,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  accent?: string;
  hint?: ReactNode;
  delay?: number;
}) {
  const color = accent ?? "var(--nd-primary-500)";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
    >
      <ACard className="p-5 h-full">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className="text-[13px] font-medium truncate"
              style={{ color: "var(--nd-text-3)" }}
            >
              {label}
            </p>
            <p
              className="text-[28px] font-extrabold leading-tight mt-1 tabular-nums"
              style={{ color: "var(--nd-text)", letterSpacing: "-0.02em" }}
            >
              {value}
            </p>
            {hint && (
              <p className="text-[12px] mt-1" style={{ color: "var(--nd-text-3)" }}>
                {hint}
              </p>
            )}
          </div>
          <div
            className="shrink-0 w-11 h-11 rounded-[var(--ad-r-md)] flex items-center justify-center"
            style={{ background: `color-mix(in srgb, ${color} 12%, white)`, color }}
          >
            {icon}
          </div>
        </div>
      </ACard>
    </motion.div>
  );
}
