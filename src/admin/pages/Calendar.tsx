import { useMemo, useState } from "react";
import { useOrders } from "../lib/metrics";
import { ACard, AEmpty, StatusBadge, ASkeleton } from "../components/ui";
import { fmtDate, STATUSES } from "../lib/types";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { ADMIN_PATH } from "../lib/config";

const MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

const DAYS = ["ح", "ن", "ث", "ر", "خ", "ج", "س"];

export default function OrderCalendar() {
  const { data: orders, isLoading } = useOrders();
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [year, setYear] = useState(() => new Date().getFullYear());

  const calendarData = useMemo(() => {
    if (!orders) return null;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    // Group orders by date
    const byDate: Record<string, typeof orders> = {};
    orders.forEach((o) => {
      const d = o.createdAt?.slice(0, 10);
      if (d && d.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)) {
        if (!byDate[d]) byDate[d] = [];
        byDate[d].push(o);
      }
    });

    // Build calendar grid (weeks)
    const weeks: { day: number; orders: typeof orders }[][] = [];
    let week: { day: number; orders: typeof orders }[] = [];
    for (let i = 0; i < firstDay; i++) {
      week.push({ day: 0, orders: [] });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      week.push({ day: d, orders: byDate[dateStr] || [] });
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push({ day: 0, orders: [] });
      weeks.push(week);
    }

    return { daysInMonth, firstDay, weeks, total: orders.length };
  }, [orders, month, year]);

  const upcoming = useMemo(() => {
    if (!orders) return [];
    return [...orders]
      .filter((o) => o.status === "processing" || o.status === "shipped" || o.status === "waiting_shipping")
      .slice(0, 8);
  }, [orders]);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(m => m + 1); };

  if (isLoading) return <ASkeleton className="h-96 !rounded-2xl" />;
  if (!calendarData) return null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--nd-text)" }}>
          تقويم الشحن
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--nd-text-3)" }}>
          متابعة مواعيد الشحن والتوصيل
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: "var(--nd-white)", border: "1px solid var(--nd-border)" }}>
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: "var(--nd-text-2)" }}>
              <ChevronRight size={18} />
            </button>
            <h3 className="text-sm font-bold" style={{ color: "var(--nd-text)" }}>
              {MONTHS[month]} {year}
            </h3>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100" style={{ color: "var(--nd-text-2)" }}>
              <ChevronLeft size={18} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[11px] font-bold py-2" style={{ color: "var(--nd-text-3)" }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          {calendarData.weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((cell, ci) => (
                <div
                  key={ci}
                  className="min-h-[80px] p-1.5 border text-right transition-colors hover:bg-gray-50"
                  style={{ borderColor: "var(--nd-border)" }}
                >
                  {cell.day > 0 && (
                    <>
                      <span className="text-[10px] font-bold" style={{ color: "var(--nd-text-2)" }}>{cell.day}</span>
                      {cell.orders.length > 0 && (
                        <div className="mt-1 space-y-0.5">
                          {cell.orders.slice(0, 3).map((o) => (
                            <Link
                              key={o.orderId}
                              to={`/${ADMIN_PATH}/orders/${o.orderId}`}
                              className="block text-[8px] px-1 py-0.5 rounded truncate font-semibold"
                              style={{
                                background: STATUSES[o.status]?.bg || "#F1F1F3",
                                color: STATUSES[o.status]?.color || "#5E5E6B",
                              }}
                            >
                              {o.orderId}
                            </Link>
                          ))}
                          {cell.orders.length > 3 && (
                            <span className="text-[8px] px-1 font-bold" style={{ color: "var(--nd-text-3)" }}>
                              +{cell.orders.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Upcoming */}
        <div className="rounded-2xl p-5" style={{ background: "var(--nd-white)", border: "1px solid var(--nd-border)" }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: "var(--nd-text)" }}>
            قيد التجهيز والشحن
          </h3>
          {upcoming.length === 0 ? (
            <AEmpty icon={<Package size={24} />} title="لا توجد طلبات نشطة" hint="كل الطلبات مكتملة" />
          ) : (
            <div className="space-y-3">
              {upcoming.map((o) => (
                <Link
                  key={o.orderId}
                  to={`/${ADMIN_PATH}/orders/${o.orderId}`}
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: STATUSES[o.status]?.color }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-semibold truncate" style={{ color: "var(--nd-text)" }}>{o.orderId}</p>
                    <p className="text-[10px]" style={{ color: "var(--nd-text-3)" }}>{o.location} · {fmtDate(o.createdAt)}</p>
                  </div>
                  <StatusBadge status={o.status} size="sm" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
