import { useId } from "react";
import { GOLD_LINE, GOLD_MID } from "./tokens";

/** Fine security guilloche line — subtle, elegant pattern strip. */
export function Guilloche({ className }: { className?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const patternId = `nadine-guilloche-${uid}`;
  return (
    <svg
      className={className}
      viewBox="0 0 240 14"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id={patternId} width="30" height="14" patternUnits="userSpaceOnUse">
          <path d="M0 7 Q 7.5 1 15 7 T 30 7" fill="none" stroke={GOLD_MID} strokeWidth="0.6" />
          <path d="M0 9.5 Q 7.5 3.5 15 9.5 T 30 9.5" fill="none" stroke={GOLD_LINE} strokeWidth="0.4" opacity="0.7" />
          <circle cx="7.5" cy="7" r="0.8" fill={GOLD_LINE} opacity="0.8" />
          <circle cx="22.5" cy="7" r="0.8" fill={GOLD_LINE} opacity="0.8" />
        </pattern>
      </defs>
      <rect width="240" height="14" fill={`url(#${patternId})`} />
    </svg>
  );
}
