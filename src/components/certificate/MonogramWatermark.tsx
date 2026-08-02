import { useId } from "react";

/** Subtle repeating N monogram watermark behind the certificate surface. */
export function MonogramWatermark() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const patternId = `nadine-monogram-${uid}`;
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id={patternId} width="140" height="140" patternUnits="userSpaceOnUse">
          <g transform="rotate(28 70 70)">
            <text
              x="70"
              y="84"
              textAnchor="middle"
              fontFamily="'Playfair Display', serif"
              fontSize="52"
              fontWeight="600"
              fill="#b48a45"
              opacity="0.055"
            >
              N
            </text>
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
