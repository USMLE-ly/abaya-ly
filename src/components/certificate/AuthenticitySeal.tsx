import { useId } from "react";
import { HouseMark } from "./HouseMark";
import { GOLD_DEEP, GOLD_LINE, GOLD_MID, IVORY } from "./tokens";

/** Serrated outer edge of the official stamp. */
function serratedPath(radius = 96, teeth = 48, depth = 7, cx = 100, cy = 100): string {
  const inner = radius - depth;
  let d = "";
  for (let i = 0; i < teeth * 2; i++) {
    const r = i % 2 === 0 ? radius : inner;
    const angle = (i / (teeth * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return d + " Z";
}

/** The official Nadine authenticity seal — one embossed certification stamp. */
export function AuthenticitySeal({ serial, size = 176 }: { serial: string; size?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const goldId = `seal-gold-${uid}`;
  const embossId = `seal-emboss-${uid}`;
  const topPathId = `seal-top-${uid}`;
  const bottomPathId = `seal-bottom-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="ختم نادين الرسمي"
    >
      <defs>
        <radialGradient id={goldId} cx="50%" cy="40%" r="68%">
          <stop offset="0%" stopColor="#f4ead0" />
          <stop offset="55%" stopColor={GOLD_MID} />
          <stop offset="100%" stopColor={GOLD_DEEP} />
        </radialGradient>
        <filter id={embossId} x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="2.5" stdDeviation="3.5" floodColor="#221a12" floodOpacity="0.35" />
        </filter>
        <path id={topPathId} d="M 28 100 A 72 72 0 0 1 172 100" fill="none" />
        <path id={bottomPathId} d="M 28 100 A 72 72 0 0 0 172 100" fill="none" />
      </defs>

      <g filter={`url(#${embossId})`}>
        {/* Serrated outer edge */}
        <path d={serratedPath(96, 48, 7)} fill={IVORY} stroke={GOLD_MID} strokeWidth="0.6" />
        <circle cx="100" cy="100" r="85" fill={`url(#${goldId})`} stroke={GOLD_DEEP} strokeWidth="1" />
        {/* Inner security rings */}
        <circle cx="100" cy="100" r="77" fill="none" stroke={IVORY} strokeWidth="1.6" strokeOpacity="0.6" />
        <circle cx="100" cy="100" r="73" fill="none" stroke={GOLD_DEEP} strokeWidth="0.7" strokeDasharray="3 2.5" />
        <circle cx="100" cy="100" r="69" fill="none" stroke={GOLD_DEEP} strokeWidth="0.4" strokeOpacity="0.7" />
        {/* Embossed highlight */}
        <path
          d="M 34 74 A 68 68 0 0 1 74 34"
          fill="none"
          stroke={IVORY}
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.35"
        />
      </g>

      {/* Circular arcs */}
      <text direction="ltr" style={{ fontFamily: "'Playfair Display', serif" }}>
        <textPath href={`#${topPathId}`} startOffset="50%" textAnchor="middle" fill="#6e5530" fontSize="11.5" fontWeight="700" letterSpacing="2.6">
          NADINE LUXURY
        </textPath>
      </text>
      <text direction="ltr" style={{ fontFamily: "'Playfair Display', serif" }}>
        <textPath href={`#${bottomPathId}`} startOffset="50%" textAnchor="middle" fill="#6e5530" fontSize="7.5" fontWeight="600" letterSpacing="2.2">
          AUTHENTICITY SEAL
        </textPath>
      </text>

      {/* Center: crest + registry micro-text */}
      <circle cx="100" cy="100" r="51" fill={IVORY} stroke={GOLD_MID} strokeWidth="0.8" />
      <circle cx="100" cy="100" r="47.5" fill="none" stroke={GOLD_LINE} strokeWidth="0.4" strokeDasharray="1.5 2" opacity="0.8" />
      <HouseMark x={82} y={72} width={36} height={36} />
      <text
        x="100"
        y="131"
        textAnchor="middle"
        direction="rtl"
        style={{ fontFamily: "Tajawal, sans-serif" }}
        fill={GOLD_DEEP}
        fontSize="6.5"
        fontWeight="700"
      >
        دار نادين للأزياء
      </text>
      <text
        x="100"
        y="140"
        textAnchor="middle"
        direction="ltr"
        style={{ fontFamily: "'Playfair Display', serif" }}
        fill="#6e5530"
        fontSize="4.8"
        fontWeight="600"
        letterSpacing="1"
      >
        {serial}
      </text>
    </svg>
  );
}
