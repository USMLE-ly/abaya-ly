import { useMemo, useState } from "react";
import {
  ShoppingBag,
  Clock,
  Package,
  Truck,
  MapPin,
  CheckCircle2,
  TrendingUp,
  MapPin as MapIcon,
  CalendarDays,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { useOrders } from "../lib/metrics";
import { ACard, AButton, ASelect, ASkeleton, StatCard } from "../components/ui";
import { STATUSES, fmtDate, type OrderStatus } from "../lib/types";

const COLORS = ["#c42855", "#F5A524", "#4892FE", "#4F56D3", "#89D233", "#8F8F8F"];

export default function Analytics() {
  const { data: orders, isLoading, error } = useOrders();
  const [range, setRange] = useState<"7" | "30" | "90" | "all">("30");

  const stats = useMemo(() => {
    if (!orders) return null;
    const now = Date.now();
    const rangeHours = range === "7" ? 168 : range === "30" ? 720 : range === "90" ? 2160 : Infinity;
    const cutoff = rangeHours === Infinity ? 0 : now - rangeHours * 3600000;

    const filtered = orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff);

    const byStatus: Record<string, number> = {};
    const byCity: Record<string, number> = {};
    const byDay: Record<string, number> = {};
    const recent = filtered.filter((o) => new Date(o.createdAt).getTime() >= now - 86400000);
    const pending = filtered.filter((o) => o.status === "pending");
    const processing = filtered.filter((o) => o.status === "processing");
    const delivered = filtered.filter((o) => o.status === "delivered");
    const shipped = filtered.filter((o) => o.status === "shipped");
    const waitingShipping = filtered.filter((o) => o.status === "waiting_shipping");

    filtered.forEach((o) => {
      byStatus[o.status] = (byStatus[o.status] || 0) + 1;
      byCity[o.location] = (byCity[o.location] || 0) + 1;
      const day = o.createdAt?.slice(0, 10);
      if (day) byDay[day] = (byDay[day] || 0) + 1;
    });

    const statusChart = Object.entries(STATUSES).map(([key, meta]) => ({
      name: meta.label,
      value: byStatus[key] || 0,
      color: meta.color,
    }));

    const cityChart = Object.entries(byCity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));

    const daysSorted = Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b));
    const timelineChart = daysSorted.map(([day, count]) => ({
      day: day.slice(5),
      orders: count,
    }));

    const deliveryRate = filtered.length > 0
      ? Math.round((delivered.length / filtered.length) * 100)
      : 0;

    // Average processing time (hours from pending to shipped/delivered)
    const avgProcessing = (() => {
      const completed = filtered.filter((o) => o.status === "delivered");
      if (completed.length === 0) return 0;
      const totalHours = completed.reduce((sum, o) => {
        const diff = (new Date(o.updatedAt).getTime() - new Date(o.createdAt).getTime()) / 3600000;
        return sum + diff;
      }, 0);
      return Math.round(totalHours / completed.length);
    })();

    // Top cities
    const topCities = Object.entries(byCity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([city, count]) => ({ city, count, percent: Math.round((count / filtered.length) * 100) }));

    return {
      total: filtered.length,
      recent: recent.length,
      pending: pending.length,
      processing: processing.length,
      waitingShipping: waitingShipping.length,
      shipped: shipped.length,
      delivered: delivered.length,
      statusChart,
      cityChart,
      timelineChart,
      deliveryRate,
      avgProcessing,
      topCities,
    };
  }, [orders, range]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <ASkeleton key={i} className="h-28" />)}
        </div>
        <ASkeleton className="h-80" />
        <ASkeleton className="h-64" />
      </div>
    );
  }

  if (!stats) return null;

  const rangeOptions = [
    { value: "7", label: "آخر 7 أيام" },
    { value: "30", label: "آخر 30 يوم" },
    { value: "90", label: "آخر 90 يوم" },
    { value: "all", label: "الكل" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] sm:text-[30px] font-extrabold leading-tight" style={{ color: "var(--ad-text)" }}>
            التحليلات
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--ad-text-3)" }}>
            {stats.total} طلب في النطاق المحدد
          </p>
        </div>
        <ASelect value={range} onChange={(e) => setRange(e.target.value as any)} className="sm:w-44">
          {rangeOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </ASelect>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          icon={<ShoppingBag size={18} />}
          value={stats.total}
          label="إجمالي الطلبات"
          color="#c42855"
        />
        <StatCard
          icon={<Clock size={18} />}
          value={stats.pending}
          label="انتظار التأكيد"
          color="#F5A524"
        />
        <StatCard
          icon={<Package size={18} />}
          value={stats.processing}
          label="قيد التجهيز"
          color="#4892FE"
        />
        <StatCard
          icon={<Truck size={18} />}
          value={stats.shipped + stats.waitingShipping}
          label={stats.waitingShipping > 0 ? `شحن (${stats.waitingShipping} انتظار)` : "جاري الشحن"}
          color="#4F56D3"
        />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          value={stats.delivered}
          label="تم التوصيل"
          color="#89D233"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<TrendingUp size={18} />}
          value={`${stats.deliveryRate}%`}
          label="نسبة التوصيل"
          color="#4F56D3"
        />
        <StatCard
          icon={<Clock size={18} />}
          value={stats.avgProcessing > 0 ? `${stats.avgProcessing} ساعة` : "—"}
          label="معدل وقت المعالجة"
          color="#4892FE"
        />
        <StatCard
          icon={<CalendarDays size={18} />}
          value={stats.recent}
          label="اليوم"
          color="#c42855"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders timeline */}
        <ACard className="p-5 sm:p-6">
          <h3 className="text-[15px] font-extrabold mb-4" style={{ color: "var(--ad-text)" }}>
            الطلبات عبر الوقت
          </h3>
          {stats.timelineChart.length === 0 ? (
            <p className="text-[13px] py-8 text-center" style={{ color: "var(--ad-text-4)" }}>لا توجد بيانات كافية</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={stats.timelineChart}>
                <defs>
                  <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c42855" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#c42855" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#878787" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#878787" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="orders" stroke="#c42855" fill="url(#orderGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ACard>

        {/* Status distribution */}
        <ACard className="p-5 sm:p-6">
          <h3 className="text-[15px] font-extrabold mb-4" style={{ color: "var(--ad-text)" }}>
            توزيع الحالات
          </h3>
          {stats.statusChart.every((s) => s.value === 0) ? (
            <p className="text-[13px] py-8 text-center" style={{ color: "var(--ad-text-4)" }}>لا توجد بيانات كافية</p>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="60%" height={220}>
                <PieChart>
                  <Pie
                    data={stats.statusChart.filter((s) => s.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.statusChart.filter((s) => s.value > 0).map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {stats.statusChart.filter((s) => s.value > 0).map((s) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                    <span className="text-[12px]" style={{ color: "var(--ad-text-2)" }}>{s.name}</span>
                    <span className="text-[12px] font-bold" style={{ color: "var(--ad-text)" }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ACard>

        {/* Top cities */}
        <ACard className="p-5 sm:p-6">
          <h3 className="text-[15px] font-extrabold mb-4" style={{ color: "var(--ad-text)" }}>
            توزيع المدن
          </h3>
          {stats.cityChart.length === 0 ? (
            <p className="text-[13px] py-8 text-center" style={{ color: "var(--ad-text-4)" }}>لا توجد بيانات كافية</p>
          ) : (
            <div className="space-y-3">
              {stats.cityChart.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="text-[12px] w-5 text-center font-bold" style={{ color: "var(--ad-text-4)" }}>{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-[13px] font-semibold" style={{ color: "var(--ad-text)" }}>{c.name}</span>
                      <span className="text-[12px] font-bold" style={{ color: "var(--ad-brand)" }}>{c.value}</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--ad-border)" }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${(c.value / Math.max(...stats.cityChart.map((x) => x.value))) * 100}%`,
                          background: COLORS[i % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ACard>

        {/* Top cities summary */}
        <ACard className="p-5 sm:p-6">
          <h3 className="text-[15px] font-extrabold mb-4" style={{ color: "var(--ad-text)" }}>
            أفضل المدن
          </h3>
          {stats.topCities.length === 0 ? (
            <p className="text-[13px] py-8 text-center" style={{ color: "var(--ad-text-4)" }}>لا توجد بيانات كافية</p>
          ) : (
            <div className="space-y-4">
              {stats.topCities.map((c, i) => (
                <div key={c.city} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[18px] font-extrabold" style={{ color: COLORS[i] }}>{i + 1}</span>
                    <div>
                      <p className="text-[14px] font-semibold" style={{ color: "var(--ad-text)" }}>{c.city}</p>
                      <p className="text-[11px]" style={{ color: "var(--ad-text-4)" }}>{c.count} طلب</p>
                    </div>
                  </div>
                  <span className="text-[13px] font-bold" style={{ color: "var(--ad-brand)" }}>{c.percent}%</span>
                </div>
              ))}
            </div>
          )}
        </ACard>
      </div>
    </div>
  );
}
