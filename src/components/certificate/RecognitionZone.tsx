import type { OutfitSealItem } from "./OutfitSeal";
import { StoreSeal } from "./StoreSeal";

const GOLD = "#c9a25e";
const GOLD_MID = "#b48a45";
const GOLD_DEEP = "#9c7138";
const STRAWBERRY = "#c42855";

/** Symmetric laurel wreath — the award's graphic signature, drawn as two leaf branches. */
function LaurelWreath({ className }: { className?: string }) {
  const leaves: { x: number; y: number; rot: number }[] = [];
  const cx = 100;
  const cy = 100;
  const r = 74;
  const pushBranch = (startDeg: number, endDeg: number, count: number) => {
    for (let i = 0; i < count; i++) {
      const deg = startDeg + ((endDeg - startDeg) * i) / (count - 1);
      const rad = (deg * Math.PI) / 180;
      leaves.push({
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad),
        rot: ((deg + 90) * Math.PI) / 180,
      });
    }
  };
  // Right branch (through 0°), left branch (through 180°) — closed at the bottom,
  // leaving an open crown gap at the top for the award title.
  pushBranch(-58, 90, 10);
  pushBranch(90, 238, 10);

  return (
    <svg className={className} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle
        cx={cx}
        cy={cy}
        r={r - 16}
        fill="none"
        stroke="#e6d5a6"
        strokeWidth="0.9"
        strokeDasharray="2 4"
      />
      {leaves.map((leaf, i) => (
        <ellipse
          key={i}
          cx={leaf.x}
          cy={leaf.y}
          rx={9.5}
          ry={3.8}
          transform={`rotate(${(leaf.rot * 180) / Math.PI} ${leaf.x} ${leaf.y})`}
          className="fill-[#c9a25e]"
          opacity={0.92}
        />
      ))}
      <path
        d="M 92 176 Q 100 168 108 176"
        fill="none"
        stroke={GOLD}
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Recognition Zone — the certificate's visual centerpiece: an excellence award + the embossed authenticity seal. */
export function RecognitionZone({
  items,
  orderId,
  date,
}: {
  items: OutfitSealItem[];
  orderId: string;
  date?: string;
}) {
  const primary = items[0];
  const collection = primary?.collection?.trim() || "مجموعة نادين";
  const edition = primary?.edition?.trim() || "إصدار خاص";
  const pieceLabel = items.length > 1 ? `${items.length} قطع موثّقة` : "قطعة موثّقة";

  return (
    <section className="mt-9">
      {/* Section label */}
      <div className="flex items-center justify-center gap-3">
        <span
          className="h-px w-12 sm:w-16"
          style={{ background: "linear-gradient(90deg, transparent, rgba(201,162,94,0.8))" }}
        />
        <p className="text-[11px] font-bold tracking-[0.26em]" style={{ color: GOLD_DEEP }}>
          منطقة التكريم
        </p>
        <span
          className="h-px w-12 sm:w-16"
          style={{ background: "linear-gradient(90deg, rgba(201,162,94,0.8), transparent)" }}
        />
      </div>
      <p
        className="mt-1 text-center text-[7.5px] font-semibold tracking-[0.42em]"
        style={{ color: GOLD_MID, fontFamily: "'Playfair Display', serif" }}
      >
        RECOGNITION ZONE
      </p>

      <div className="mt-6 grid grid-cols-2 items-center gap-3 sm:gap-8">
        {/* Official Authenticity Seal (right column in RTL) */}
        <div className="flex flex-col items-center text-center">
          <div className="relative grid place-items-center">
            <div
              className="absolute h-40 w-40 rounded-full sm:h-64 sm:w-64"
              style={{
                background:
                  "radial-gradient(circle, rgba(244,234,208,0.75) 0%, rgba(244,234,208,0) 66%)",
              }}
            />
            <StoreSeal date={date} className="relative h-36 w-36 sm:h-60 sm:w-60" />
          </div>
          <div className="mt-2.5">
            <p className="text-[9px] font-bold tracking-[0.22em]" style={{ color: GOLD_DEEP }}>
              ختم الأصالة الرسمي
            </p>
            <p
              className="mt-0.5 text-[7px] font-semibold tracking-[0.3em]"
              style={{ color: GOLD_MID, fontFamily: "'Playfair Display', serif" }}
            >
              OFFICIAL AUTHENTICITY SEAL
            </p>
          </div>
        </div>

        {/* Fashion Excellence Award (left column in RTL) */}
        <div className="flex flex-col items-center text-center">
          <div className="relative grid h-36 w-36 place-items-center sm:h-60 sm:w-60">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.85) 0%, rgba(244,234,208,0.4) 52%, transparent 72%)",
              }}
            />
            <LaurelWreath className="absolute inset-0 h-full w-full" />
            <div className="relative z-10 px-3">
              <p
                className="text-[8px] font-bold tracking-[0.3em]"
                style={{ color: GOLD_MID, fontFamily: "'Playfair Display', serif" }}
              >
                FASHION
              </p>
              <p
                className="-mt-0.5 text-[9px] font-bold tracking-[0.2em]"
                style={{ color: GOLD_DEEP, fontFamily: "'Playfair Display', serif" }}
              >
                EXCELLENCE
              </p>
              <div className="mx-auto my-1.5 flex items-center justify-center gap-1">
                <span
                  className="h-px w-6"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(201,162,94,0.9))" }}
                />
                <span className="block h-1 w-1 rotate-45" style={{ background: STRAWBERRY }} />
                <span
                  className="h-px w-6"
                  style={{ background: "linear-gradient(90deg, rgba(201,162,94,0.9), transparent)" }}
                />
              </div>
              <p className="text-[11px] font-bold leading-tight text-fg">{collection}</p>
              <p className="mt-0.5 text-[8.5px] font-semibold" style={{ color: GOLD_MID }}>
                {edition}
              </p>
              <p className="mt-1.5 text-[7px] tracking-[0.2em]" style={{ color: "#8c8276" }}>
                رقم المرجع
              </p>
              <p className="text-[9.5px] font-bold tabular-nums text-fg">{orderId}</p>
              <p className="mt-1 text-[7.5px] font-semibold" style={{ color: GOLD_DEEP }}>
                {pieceLabel}
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-[10px] leading-relaxed" style={{ color: "#8c8276" }}>
        هذه الشهادة صادرة إلكترونياً من دار نادين للأزياء — رقم الشهادة: {orderId}
      </p>
    </section>
  );
}
