import { useId, type SVGProps } from "react";
import { GOLD_DEEP, GOLD_LIGHT, IVORY, STRAWBERRY } from "./tokens";

/** The Nadine house crest: crown over the N monogram. Vector, transparent, reusable. */
export function HouseMark(props: SVGProps<SVGSVGElement>) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const goldId = `house-mark-gold-${uid}`;
  return (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id={goldId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={GOLD_LIGHT} />
          <stop offset="100%" stopColor={GOLD_DEEP} />
        </linearGradient>
      </defs>
      {/* Crown */}
      <path
        d="M8 28 L14 14 L24 22 L32 10 L40 22 L50 14 L56 28 L52 36 L12 36 Z"
        fill={STRAWBERRY}
        stroke={GOLD_DEEP}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path d="M12 36 L52 36 L52 41 L12 41 Z" fill={GOLD_DEEP} />
      <circle cx="14" cy="16.5" r="2.1" fill={GOLD_LIGHT} />
      <circle cx="32" cy="12.5" r="2.4" fill={GOLD_LIGHT} />
      <circle cx="50" cy="16.5" r="2.1" fill={GOLD_LIGHT} />
      {/* N monogram */}
      <circle cx="32" cy="52" r="9.5" fill={IVORY} stroke={`url(#${goldId})`} strokeWidth="1.2" />
      <path
        d="M27.5 56.5 L27.5 48.5 L36.5 56.5 L36.5 48.5"
        fill="none"
        stroke={GOLD_DEEP}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
