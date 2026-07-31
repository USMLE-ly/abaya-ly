import { useEffect, useMemo, useState } from "react";
import { Ticket } from "lucide-react";

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

/** Ticket-style rose/white daily countdown voucher for the active promo. */
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
          className="relative rounded-[28px] border border-strawberry-200/80 bg-white shadow-[0_24px_60px_-32px_rgba(196,40,85,0.28)]"
        >
          {/* soft rose tint */}
          <div className="pointer-events-none absolute inset-0 rounded-[27px] bg-gradient-to-b from-strawberry-50/80 via-white to-white" aria-hidden="true" />

          {/* header + countdown */}
          <div className="relative px-6 pt-8 pb-7 md:px-10 md:pt-10 md:pb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-start">
                <span className="inline-flex items-center rounded-full bg-brand-subtle px-3.5 py-1 text-[11px] uppercase tracking-[0.22em] font-semibold text-brand shadow-[inset_0_0_0_1px_rgba(196,40,85,0.12)] mb-3">
                  عرض محدود
                </span>
                <h2 className="font-display text-xl md:text-2xl font-bold text-fg mb-1">{label}</h2>
                <p className="text-xs text-fg-tertiary">
                  استخدمي كود <span className="font-bold text-brand" dir="ltr">NADINE10</span> عند الحجز — ينتهي العداد أدناه
                </p>
              </div>

              <div className="flex items-center gap-2 md:gap-3" dir="ltr">
                {cells.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 md:gap-3">
                    <div className="flex h-16 w-16 md:h-[72px] md:w-[72px] flex-col items-center justify-center rounded-2xl border border-strawberry-200/70 bg-white shadow-sm">
                      <span className="text-xl md:text-2xl font-bold tabular-nums leading-none text-brand">{String(c.value).padStart(2, "0")}</span>
                      <span className="mt-1 text-[9px] text-fg-disabled">{c.label}</span>
                    </div>
                    {i < cells.length - 1 && <span className="text-lg font-bold text-brand/30">:</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* perforation — dashed tear line with punched notches */}
          <div className="relative mx-6 md:mx-10">
            <span className="absolute -left-4 top-1/2 -translate-y-1/2 size-7 rounded-full bg-canvas" aria-hidden="true" />
            <span className="absolute -right-4 top-1/2 -translate-y-1/2 size-7 rounded-full bg-canvas" aria-hidden="true" />
            <div className="border-t-2 border-dashed border-strawberry-300/70" />
          </div>

          {/* stub — booking code */}
          <div className="relative flex flex-col items-center justify-center gap-2 px-6 py-5 md:px-10 md:py-6">
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-fg-quaternary">كوبون الحجز</span>
            <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-brand/35 bg-brand-subtle/50 px-5 py-2.5">
              <Ticket size={16} className="text-brand" />
              <span className="text-lg md:text-xl font-extrabold tracking-[0.28em] text-brand tabular-nums" dir="ltr">NADINE10</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
