import { useEffect, useMemo, useState } from "react";

const TARGET_KEY = "nadine-promo-end";

function getTarget(): number {
  try {
    const saved = Number(localStorage.getItem(TARGET_KEY));
    if (saved && saved > Date.now()) return saved;
  } catch { /* ignore */ }
  // Next occurrence of 11:59 PM — promo resets daily.
  const t = new Date();
  t.setHours(23, 59, 59, 0);
  return t.getTime();
}

interface Props {
  label?: string;
}

/** Rose/white/strawberry daily countdown timer for the active promo. */
export function PromoCountdown({ label = "عرض اليوم — خصم 10% على جميع الفساتين" }: Props) {
  const target = useMemo(() => {
    const t = getTarget();
    try { localStorage.setItem(TARGET_KEY, String(t)); } catch { /* ignore */ }
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

  return (
    <section className="py-10 md:py-14">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
        <div
          data-debug="promo-countdown-real"
          className="relative overflow-hidden rounded-3xl border border-strawberry-100 bg-gradient-to-b from-strawberry-50/70 via-canvas to-strawberry-50/70 px-6 py-8 md:px-10 md:py-10"
        >
          {/* decorative glows */}
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-strawberry-200/40 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 -right-10 w-64 h-64 rounded-full bg-strawberry-100/50 blur-3xl" aria-hidden="true" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-start">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-subtle px-3 py-1 text-[11px] uppercase tracking-[0.22em] font-semibold text-brand mb-3">
                DEBUG PROMO ACTIVE
              </span>
              <h2 className="font-display text-xl md:text-2xl font-bold text-fg mb-1">{label}</h2>
              <p className="text-xs text-fg-tertiary">استخدمي كود <span className="font-bold text-brand" dir="ltr">NADINE10</span> عند الحجز — ينتهي العداد أدناه</p>
            </div>

            <div className="flex items-center gap-2 md:gap-3" dir="ltr">
              {cells.map((c, i) => (
                <div key={i} className="flex items-center gap-2 md:gap-3">
                  <div className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl bg-white/85 border border-strawberry-200/60 shadow-sm backdrop-blur-sm flex flex-col items-center justify-center">
                    <span className="text-xl md:text-2xl font-bold tabular-nums leading-none text-brand">{String(c.value).padStart(2, "0")}</span>
                    <span className="text-[9px] text-fg-disabled mt-1">{c.label}</span>
                  </div>
                  {i < cells.length - 1 && <span className="text-lg font-bold text-brand/30">:</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
