import { memo } from "react";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { GOLD_DEEP, GOLD_LINE, GOLD_MID, MUTED, STRAWBERRY } from "@/components/certificate/tokens";

export interface TimelineStage {
  key: string;
  label: string;
  caption?: string;
  icon: LucideIcon;
  eta?: string;
}

export interface LuxuryTimelineProps {
  stages: TimelineStage[];
  currentIndex: number;
  className?: string;
}

/** Vertical luxury order timeline — completed stages in gold, current stage highlighted. */
export const LuxuryTimeline = memo(function LuxuryTimeline({
  stages,
  currentIndex,
  className,
}: LuxuryTimelineProps) {
  return (
    <ol className={cn("relative", className)} aria-label="حالة الطلب">
      {stages.map((stage, i) => {
        const done = currentIndex >= i;
        const isCurrent = currentIndex === i;
        const Icon = stage.icon;
        const isLast = i === stages.length - 1;

        return (
          <motion.li
            key={stage.key}
            className="relative flex items-start gap-4 pb-6 last:pb-0"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.09, duration: 0.4, ease: "easeOut" }}
          >
            {/* Icon node */}
            <div className="relative flex flex-col items-center self-stretch">
              <div
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all"
                style={{
                  background: done
                    ? isCurrent
                      ? "#fffdf9"
                      : "rgba(244,234,208,0.55)"
                    : "#f7f3ea",
                  borderColor: isCurrent
                    ? STRAWBERRY
                    : done
                      ? GOLD_LINE
                      : "rgba(201,162,94,0.25)",
                  boxShadow: isCurrent
                    ? `0 0 0 5px rgba(196,40,85,0.1)`
                    : done
                      ? "0 6px 14px -8px rgba(180,138,69,0.5)"
                      : undefined,
                }}
                aria-hidden="true"
              >
                <Icon
                  size={17}
                  strokeWidth={2.1}
                  style={{
                    color: isCurrent ? STRAWBERRY : done ? GOLD_DEEP : "rgba(34,32,28,0.28)",
                  }}
                />
              </div>
              {!isLast && (
                <div
                  className="absolute top-11 h-[calc(100%-2.75rem)] w-px"
                  style={{
                    background: currentIndex > i ? GOLD_LINE : "rgba(201,162,94,0.22)",
                  }}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Label + ETA */}
            <div className="flex-1 pb-1 pt-1.5">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                <p
                  className="text-sm font-bold"
                  style={{
                    color: done ? "#22201c" : "rgba(34,32,28,0.38)",
                  }}
                >
                  {stage.label}
                  {isCurrent && (
                    <span
                      className="mr-2 inline-block rounded-full px-2 py-0.5 text-[9px] font-bold"
                      style={{ background: "rgba(196,40,85,0.1)", color: STRAWBERRY }}
                    >
                      الحالية
                    </span>
                  )}
                </p>
                {stage.eta && (
                  <p className="text-[11px] font-medium" style={{ color: MUTED }}>
                    {stage.eta}
                  </p>
                )}
              </div>
              {stage.caption && (
                <p className="mt-0.5 text-[11px] leading-relaxed" style={{ color: MUTED }}>
                  {stage.caption}
                </p>
              )}
            </div>
          </motion.li>
        );
      })}

      {/* Gold reference footer */}
      <li className="mt-2 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${GOLD_MID}, transparent)` }} />
        <span className="text-[8px] font-bold tracking-[0.3em]" style={{ color: GOLD_DEEP }}>
          NADINE LUXURY · HOUSE CERTIFIED
        </span>
        <span className="h-px flex-1" style={{ background: `linear-gradient(90deg, transparent, ${GOLD_MID}, transparent)` }} />
      </li>
    </ol>
  );
});
