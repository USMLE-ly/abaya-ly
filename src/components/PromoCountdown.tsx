import { useEffect, useMemo, useState } from "react";
import { usePromo } from "@/lib/promo";

function PromoEnded() {
  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-3xl border border-strawberry-200/50 bg-white/70 px-6 py-12 text-center shadow-sm">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">Nadine</span>
          <h2 className="mt-3 font-display text-2xl font-bold text-fg">انتهت صلاحية العرض</h2>
          <p className="mt-2 text-sm font-medium text-fg-tertiary">أهلاً بكِ في نادين — بيت الفساتين الفاخرة</p>
        </div>
      </div>
    </section>
  );
}

export function PromoCountdown() {
  const { promo, loading } = usePromo();
  const target = useMemo(
    () => (promo?.expiresAt ? Date.parse(promo.expiresAt) : NaN),
    [promo?.expiresAt]
  );

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (Number.isNaN(target)) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (loading) return null;
  if (!promo || promo.disabled) return null;
  if (promo.ended || Number.isNaN(target) || target - now <= 0) return <PromoEnded />;

  const diff = target - now;
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

  return (
    <section className="py-10 md:py-14">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
        <div
          data-debug="promo-countdown-real"
          className="relative mx-auto w-full overflow-hidden rounded-3xl"
          style={{
            maxWidth: "min(741px, calc(100vw - 2rem))",
            background: "linear-gradient(135deg, #ffffff 0%, #fff5f7 42%, #ffe4eb 100%)",
            boxShadow: "0 24px 44px rgba(196,40,85,0.22), inset 0 0 52px -24px rgba(196,40,85,0.28)",
          }}
        >
          {/* perforation — dashed vertical tear line */}
          <div
            aria-hidden="true"
            className="absolute top-0 bottom-0 hidden sm:block"
            style={{
              left: "76%",
              width: 1.6,
              backgroundImage:
                "repeating-linear-gradient(rgba(196,40,85,0.35) 0px, rgba(196,40,85,0.35) 8.9px, transparent 8.9px, transparent 17.8px)",
            }}
          />

          <div className="flex flex-col sm:flex-row">
            {/* Main body */}
            <div className="flex-1 px-6 py-8 sm:px-8 sm:py-12">
              <span className="inline-flex items-center rounded-full bg-brand-subtle px-3.5 py-1 text-[11px] uppercase tracking-[0.22em] font-semibold text-brand shadow-[inset_0_0_0_1px_rgba(196,40,85,0.12)]">
                عرض محدود
              </span>
              <h2 className="mt-3 font-display text-lg leading-snug font-bold text-fg sm:text-[22px]">
                {promo.label}
              </h2>

              {/* Countdown */}
              <div className="mt-6 flex items-center justify-start" dir="ltr">
                {cells.map((c, i) => (
                  <div key={i} className="flex items-center">
                    <div
                      className="flex flex-col items-center justify-center"
                      style={{ minWidth: "clamp(56px, 16vw, 88px)", height: "clamp(48px, 13vw, 62px)" }}
                    >
                      <span
                        className="font-bold tabular-nums leading-none text-brand"
                        style={{ fontSize: "clamp(1.6rem, 7vw, 2.5rem)" }}
                      >
                        {String(c.value).padStart(2, "0")}
                      </span>
                      <span className="mt-1 text-[10px] font-semibold text-fg-disabled sm:text-[11px]">{c.label}</span>
                    </div>
                    {i < cells.length - 1 && (
                      <span className="mx-1 text-xl font-bold text-brand/30 sm:mx-2 sm:text-2xl">:</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom note */}
              <p className="mt-5 text-xs font-medium text-fg-tertiary sm:text-[13px]">
                استخدمي كود{" "}
                <span className="font-bold text-brand" dir="ltr">
                  {promo.code}
                </span>{" "}
                عند الحجز — ينتهي العداد أدناه
              </p>
            </div>

            {/* Stub — visible only on wider screens */}
            <div
              className="relative hidden w-[24%] min-w-[140px] items-center justify-center sm:flex"
              aria-hidden="false"
            >
              {/* watermark */}
              <span
                className="pointer-events-none absolute inset-0 grid place-items-center overflow-hidden font-bold tabular-nums"
                style={{ color: "rgba(196,40,85,0.06)" }}
              >
                <span style={{ writingMode: "vertical-rl", fontSize: 96, lineHeight: 1 }}>
                  {promo.value}%
                </span>
              </span>
              <span
                dir="ltr"
                className="relative font-bold"
                style={{
                  writingMode: "vertical-rl",
                  fontSize: "clamp(20px, 3vw, 34px)",
                  letterSpacing: "0.08em",
                  color: "#c42855",
                  opacity: 0.9,
                }}
              >
                {promo.code}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
