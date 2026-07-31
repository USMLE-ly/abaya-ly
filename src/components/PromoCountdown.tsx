import { useEffect, useMemo, useRef, useState } from "react";
import { ticketPath, useIsRTL, useTicketScale, type TicketGeom } from "./ticket";

const TARGET_KEY = "nadine-promo-end";

function getTarget(): number {
  try {
    const saved = Number(localStorage.getItem(TARGET_KEY));
    if (saved && saved > Date.now()) return saved;
  } catch {
    /* ignore */
  }
  // Next occurrence of 11:59 PM — promo resets daily.
  const t = new Date();
  t.setHours(23, 59, 59, 0);
  return t.getTime();
}

interface Props {
  label?: string;
}

/** Admit-One ticket anatomy (21st.dev reference) in rose/white brand colors. */
const GEO: TicketGeom = { w: 741, h: 425, corner: 25, notch: 21, dividerX: 562 };

export function PromoCountdown({ label = "عرض اليوم — خصم 10% على جميع الفساتين" }: Props) {
  const target = useMemo(() => {
    const t = getTarget();
    try {
      localStorage.setItem(TARGET_KEY, String(t));
    } catch {
      /* ignore */
    }
    return t;
  }, []);

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, target - now);
  const days = Math.floor(diff / 864e5);
  const hours = Math.floor((diff % 864e5) / 36e5);
  const minutes = Math.floor((diff % 36e5) / 6e4);
  const seconds = Math.floor((diff % 6e4) / 1000);

  const cells = [
    { value: days, label: "يوم" },
    { value: hours, label: "ساعة" },
    { value: minutes, label: "دقيقة" },
    { value: seconds, label: "ثانية" },
  ];

  const wrapRef = useRef<HTMLDivElement>(null);
  const rtl = useIsRTL();
  const scale = useTicketScale(wrapRef, GEO.w);
  const clip = ticketPath(GEO, rtl);
  const dividerLeft = rtl ? GEO.w - GEO.dividerX - 0.8 : GEO.dividerX - 0.8;
  const stubLeft = rtl ? 0 : GEO.dividerX;
  const stubWidth = GEO.w - GEO.dividerX;

  return (
    <section className="py-10 md:py-14">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
        <div
          ref={wrapRef}
          className="relative mx-auto w-full"
          style={{ maxWidth: GEO.w, aspectRatio: `${GEO.w} / ${GEO.h}` }}
        >
          <div
            className="absolute"
            style={{
              left: "50%",
              top: 0,
              marginLeft: -GEO.w / 2,
              width: GEO.w,
              height: GEO.h,
              transform: `scale(${scale})`,
              transformOrigin: "top center",
            }}
          >
            <div className="relative h-full w-full" style={{ filter: "drop-shadow(0 24px 44px rgba(196,40,85,0.22))" }}>
              <div
                data-debug="promo-countdown-real"
                className="relative"
                style={{ width: GEO.w, height: GEO.h, clipPath: `path("${clip}")` }}
              >
                {/* rose gradient body */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(135deg, #ffffff 0%, #fff5f7 42%, #ffe4eb 100%)" }}
                />

                {/* perforation — dashed tear line exactly on the divider */}
                <div
                  aria-hidden="true"
                  className="absolute top-0 bottom-0"
                  style={{
                    left: dividerLeft,
                    width: 1.6,
                    backgroundImage:
                      "repeating-linear-gradient(rgba(196,40,85,0.35) 0px, rgba(196,40,85,0.35) 8.9px, transparent 8.9px, transparent 17.8px)",
                  }}
                />

                {/* stub watermark */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute grid place-items-center font-bold tabular-nums"
                  style={{
                    left: stubLeft,
                    top: 0,
                    width: stubWidth,
                    height: GEO.h,
                    color: "rgba(196,40,85,0.10)",
                  }}
                >
                  <span style={{ writingMode: "vertical-rl", fontSize: 118, lineHeight: 1, letterSpacing: "-0.04em" }}>
                    خصم 10%
                  </span>
                </div>

                {/* stub label */}
                <div
                  className="absolute grid place-items-center font-bold"
                  style={{
                    left: stubLeft,
                    top: 0,
                    width: stubWidth,
                    height: GEO.h,
                    color: "#c42855",
                    opacity: 0.9,
                  }}
                >
                  <span
                    dir="ltr"
                    style={{ writingMode: "vertical-rl", fontSize: 34, lineHeight: 1.1, letterSpacing: "0.08em" }}
                  >
                    NADINE10
                  </span>
                </div>

                {/* main body — badge + title */}
                <div className="absolute" style={{ top: 56, insetInlineStart: 57, textAlign: "start" }}>
                  <span className="inline-flex items-center rounded-full bg-brand-subtle px-3.5 py-1 text-[11px] uppercase tracking-[0.22em] font-semibold text-brand shadow-[inset_0_0_0_1px_rgba(196,40,85,0.12)]">
                    عرض محدود
                  </span>
                  <h2 className="mt-3 font-display text-[22px] leading-snug font-bold text-fg">{label}</h2>
                </div>

                {/* countdown */}
                <div className="absolute" style={{ top: 200, insetInlineStart: 57 }}>
                  <div className="flex items-center" dir="ltr">
                    {cells.map((c, i) => (
                      <div key={i} className="flex items-center">
                        <div className="flex h-[76px] w-[88px] flex-col items-center justify-center rounded-2xl border border-strawberry-200/60 bg-white/70 shadow-sm">
                          <span className="text-[40px] font-bold tabular-nums leading-none text-brand">
                            {String(c.value).padStart(2, "0")}
                          </span>
                          <span className="mt-1.5 text-[11px] font-semibold text-fg-disabled">{c.label}</span>
                        </div>
                        {i < cells.length - 1 && (
                          <span className="mx-2 text-2xl font-bold text-brand/30">:</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* bottom note */}
                <div className="absolute" style={{ top: 348, insetInlineStart: 57, textAlign: "start" }}>
                  <p className="text-[13px] font-medium text-fg-tertiary">
                    استخدمي كود{" "}
                    <span className="font-bold text-brand" dir="ltr">
                      NADINE10
                    </span>{" "}
                    عند الحجز — ينتهي العداد أدناه
                  </p>
                </div>

                {/* edge highlight — follows the same outline */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0"
                  style={{
                    clipPath: `path("${clip}")`,
                    boxShadow: "inset 0 0 0 1.5px rgba(196,40,85,0.18), inset 0 0 52px -24px rgba(196,40,85,0.28)",
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
