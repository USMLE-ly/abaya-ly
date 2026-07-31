import { useEffect, useMemo, useState } from "react";
import { Zap } from "lucide-react";

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

/** Shrine-style daily countdown timer for the active promo. */
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
          className="relative overflow-hidden rounded-3xl px-6 py-8 md:px-10 md:py-10 text-white"
          style={{ background: "linear-gradient(135deg, #c42855 0%, #8f1439 100%)" }}
        >
          {/* decorative glows */}
          <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-20 -right-10 w-64 h-64 rounded-full bg-white/10 blur-3xl" aria-hidden="true" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-right">
              <p className="flex items-center justify-center md:justify-start gap-1.5 text-[11px] uppercase tracking-[0.22em] font-semibold text-white/80 mb-2">
                <Zap size={13} />
                عرض محدود
              </p>
              <h2 className="font-display text-xl md:text-2xl font-bold mb-1">{label}</h2>
              <p className="text-xs text-white/70">استخدمي كود <span className="font-bold text-white" dir="ltr">NADINE10</span> عند الحجز — ينتهي العداد أدناه</p>
            </div>

            <div className="flex items-center gap-2 md:gap-3" dir="ltr">
              {cells.map((c, i) => (
                <div key={i} className="flex items-center gap-2 md:gap-3">
                  <div className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex flex-col items-center justify-center">
                    <span className="text-xl md:text-2xl font-bold tabular-nums leading-none">{String(c.value).padStart(2, "0")}</span>
                    <span className="text-[9px] text-white/70 mt-1">{c.label}</span>
                  </div>
                  {i < cells.length - 1 && <span className="text-lg font-bold text-white/60">:</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
