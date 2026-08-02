import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag, Clock, DollarSign, Users, TrendingUp, Bell, Monitor, ArrowLeft,
} from "lucide-react";
import {
  ComposedChart, Line, ReferenceLine, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { useOrders } from "../lib/metrics";
import { fmtDate, relativeAr, STATUSES } from "../lib/types";
import { AButton, StatusBadge, ASkeleton } from "../components/ui";
import { ADMIN_PATH } from "../lib/config";

const STATUS_COLORS = ["#F5A524", "#4892FE", "#8F8F8F", "#4F56D3", "#89D233"];

type TrendTooltipProps = {
  active?: boolean;
  payload?: Array<{ payload: { day: string; orders: number } }>;
};

function TrendTooltip({ active, payload }: TrendTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  return (
    <div
      className="rounded-xl px-3.5 py-2.5 shadow-lg"
      style={{ background: "var(--nd-white)", border: "1px solid var(--nd-border)" }}
    >
      <p className="text-[11px] font-bold mb-0.5" style={{ color: "var(--nd-text-3)" }}>{data.day}</p>
      <p className="text-base font-bold" style={{ color: "var(--nd-text)" }}>{data.orders} طلب</p>
    </div>
  );
}

export default function Dashboard() {
  const { data: orders, isLoading } = useOrders();
  const [range, setRange] = useState<"7" | "30" | "all">("30");

  const stats = useMemo(() => {
    if (!orders) return null;
    const now = Date.now();
    const rangeHours = range === "7" ? 168 : range === "30" ? 720 : Infinity;
    const cutoff = rangeHours === Infinity ? 0 : now - rangeHours * 3600000;
    const filtered = orders.filter((o) => new Date(o.createdAt).getTime() >= cutoff);

    const pending = filtered.filter((o) => o.status === "pending");
    const processing = filtered.filter((o) => o.status === "processing");
    const delivered = filtered.filter((o) => o.status === "delivered");
    const recent = filtered.filter((o) => new Date(o.createdAt).getTime() >= now - 86400000);

    // By day
    const byDay: Record<string, number> = {};
    filtered.forEach((o) => {
      const day = o.createdAt?.slice(0, 10);
      if (day) byDay[day] = (byDay[day] || 0) + 1;
    });
    const timeline = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, count]) => ({ day: day.slice(5), orders: count }));

    // By status
    const byStatus: Record<string, number> = {};
    filtered.forEach((o) => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });
    const statusDist = Object.entries(STATUSES).map(([key, meta]) => ({
      name: meta.label, value: byStatus[key] || 0, color: meta.color,
    }));

    // By city
    const byCity: Record<string, number> = {};
    filtered.forEach((o) => { byCity[o.location] = (byCity[o.location] || 0) + 1; });
    const topCities = Object.entries(byCity)
      .sort(([, a], [, b]) => b - a).slice(0, 5);

    // Customers (unique phones)
    const uniquePhones = new Set(filtered.map((o) => o.phone));
    const recentOrders = [...filtered].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 8);

    const deliveryRate = filtered.length > 0
      ? Math.round((delivered.length / filtered.length) * 100) : 0;

    // Order trends helpers
    const high = timeline.length ? Math.max(...timeline.map((t) => t.orders)) : 0;
    const low = timeline.length ? Math.min(...timeline.map((t) => t.orders)) : 0;
    const firstOrders = timeline.length ? timeline[0].orders : 0;
    const lastOrders = timeline.length ? timeline[timeline.length - 1].orders : 0;
    const rangeChange = firstOrders > 0
      ? Math.round(((lastOrders - firstOrders) / firstOrders) * 100) : 0;
    const yesterday = filtered.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= now - 172800000 && t < now - 86400000;
    }).length;
    const todayChange = yesterday > 0
      ? Math.round(((recent.length - yesterday) / yesterday) * 100)
      : recent.length > 0 ? 100 : 0;

    // Revenue estimate (based on price — fallback)
    const avgPrice = 750; // Average dress price in LYD
    const revenue = filtered.length * avgPrice;
    const weeklyRevenue = filtered.length * avgPrice;

    return {
      total: filtered.length,
      pending: pending.length,
      processing: processing.length,
      delivered: delivered.length,
      recent: recent.length,
      revenue,
      weeklyRevenue,
      uniqueCustomers: uniquePhones.size,
      deliveryRate,
      high,
      low,
      rangeChange,
      todayChange,
      timeline,
      statusDist,
      topCities,
      recentOrders,
    };
  }, [orders, range]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <ASkeleton key={i} className="h-36 !rounded-2xl" />)}
        </div>
        <ASkeleton className="h-80 !rounded-2xl" />
        <ASkeleton className="h-96 !rounded-2xl" />
      </div>
    );
  }

  if (!stats) return null;

  const rangeBtns = [
    { value: "7", label: "7 أيام" },
    { value: "30", label: "30 يوم" },
    { value: "all", label: "الكل" },
  ] as const;

  const deltaColor = stats.todayChange >= 0 ? "#16A34A" : "#DC2626";
  const deltaLabel = `${stats.todayChange > 0 ? "+" : ""}${stats.todayChange}% عن الأمس`;

  const quickBars = [
    { label: "نسبة التوصيل", value: stats.deliveryRate, color: "#16A34A" },
    { label: "قيد التجهيز", value: stats.total ? Math.round((stats.processing / stats.total) * 100) : 0, color: "#4892FE" },
    { label: "قيد الانتظار", value: stats.total ? Math.round((stats.pending / stats.total) * 100) : 0, color: "#F5A524" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--nd-text)" }}>
            لوحة القيادة
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--nd-text-3)" }}>
            مرحباً بعودتك! إليك ملخص المتجر
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 p-1 rounded-xl" style={{ background: "var(--nd-bg)", border: "1px solid var(--nd-border)" }}>
            {rangeBtns.map((r) => (
              <button
                key={r.value}
                onClick={() => setRange(r.value)}
                className="px-3.5 py-1.5 rounded-lg text-[12px] font-bold transition-all"
                style={{
                  background: range === r.value ? "var(--nd-primary-500)" : "transparent",
                  color: range === r.value ? "#fff" : "var(--nd-text-3)",
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Link
            to={`/${ADMIN_PATH}/orders?status=pending`}
            className="relative p-2.5 rounded-xl transition-colors hover:bg-white"
            style={{ background: "var(--nd-white)", border: "1px solid var(--nd-border)", color: "var(--nd-text-3)" }}
            title="طلبات بحاجة للمراجعة"
          >
            <Bell size={18} />
            {stats.pending > 0 && (
              <span
                className="absolute -top-1 -left-1 h-3 w-3 rounded-full border-2"
                style={{ background: "#EF4444", borderColor: "var(--nd-white)" }}
              />
            )}
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:flex items-center gap-2 px-4 h-11 rounded-xl text-[13px] font-bold transition-opacity hover:opacity-90"
            style={{ background: "var(--nd-primary-500)", color: "#fff" }}
          >
            <Monitor size={16} />
            عرض الموقع
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to={`/${ADMIN_PATH}/orders`} className="block transition-shadow hover:shadow-md">
          <div className="p-6 rounded-2xl shadow-sm transition-shadow" style={{ background: "var(--nd-white)", border: "1px solid var(--nd-border)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl" style={{ background: "rgba(206,44,96,0.1)" }}>
                <ShoppingBag size={20} style={{ color: "var(--nd-primary-500)" }} />
              </div>
              <TrendingUp size={16} style={{ color: deltaColor }} />
            </div>
            <p className="text-[13px] font-medium mb-1" style={{ color: "var(--nd-text-3)" }}>إجمالي الطلبات</p>
            <p className="text-[26px] font-extrabold leading-tight tabular-nums" style={{ color: "var(--nd-text)" }}>{stats.total}</p>
            <p className="text-[12px] mt-1" style={{ color: deltaColor }}>{deltaLabel}</p>
          </div>
        </Link>

        <div className="p-6 rounded-2xl shadow-sm transition-shadow" style={{ background: "var(--nd-white)", border: "1px solid var(--nd-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl" style={{ background: "rgba(84,166,255,0.12)" }}>
              <DollarSign size={20} style={{ color: "#54A6FF" }} />
            </div>
            <TrendingUp size={16} style={{ color: "#16A34A" }} />
          </div>
          <p className="text-[13px] font-medium mb-1" style={{ color: "var(--nd-text-3)" }}>الإيرادات التقديرية</p>
          <p className="text-[26px] font-extrabold leading-tight tabular-nums" style={{ color: "var(--nd-text)" }}>{stats.revenue.toLocaleString()} د.ل</p>
          <p className="text-[12px] mt-1" style={{ color: "var(--nd-text-3)" }}>تقديري بناءً على متوسط السعر</p>
        </div>

        <div className="p-6 rounded-2xl shadow-sm transition-shadow" style={{ background: "var(--nd-white)", border: "1px solid var(--nd-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 rounded-xl" style={{ background: "rgba(22,163,74,0.1)" }}>
              <Users size={20} style={{ color: "#16A34A" }} />
            </div>
            <TrendingUp size={16} style={{ color: "#16A34A" }} />
          </div>
          <p className="text-[13px] font-medium mb-1" style={{ color: "var(--nd-text-3)" }}>عملاء فريدون</p>
          <p className="text-[26px] font-extrabold leading-tight tabular-nums" style={{ color: "var(--nd-text)" }}>{stats.uniqueCustomers}</p>
          <p className="text-[12px] mt-1" style={{ color: "var(--nd-text-3)" }}>بناءً على رقم الهاتف</p>
        </div>

        <Link to={`/${ADMIN_PATH}/orders?status=pending`} className="block transition-shadow hover:shadow-md">
          <div className="p-6 rounded-2xl shadow-sm transition-shadow" style={{ background: "var(--nd-white)", border: "1px solid var(--nd-border)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-xl" style={{ background: "rgba(245,165,36,0.12)" }}>
                <Clock size={20} style={{ color: "#F5A524" }} />
              </div>
              <TrendingUp size={16} style={{ color: stats.processing > 0 ? "#16A34A" : "#9CA3AF" }} />
            </div>
            <p className="text-[13px] font-medium mb-1" style={{ color: "var(--nd-text-3)" }}>قيد الانتظار</p>
            <p className="text-[26px] font-extrabold leading-tight tabular-nums" style={{ color: "var(--nd-text)" }}>{stats.pending}</p>
            <p className="text-[12px] mt-1" style={{ color: "var(--nd-text-3)" }}>{stats.processing > 0 ? `${stats.processing} قيد التجهيز` : "لا توجد طلبات بانتظار المراجعة"}</p>
          </div>
        </Link>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Trends Chart */}
        <div className="lg:col-span-2 rounded-2xl p-6 shadow-sm" style={{ background: "var(--nd-white)", border: "1px solid var(--nd-border)" }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: "var(--nd-text)" }}>اتجاه الطلبات</h3>
          {stats.timeline.length === 0 ? (
            <div className="py-12 text-center text-sm" style={{ color: "var(--nd-text-3)" }}>لا توجد بيانات كافية</div>
          ) : (
            <div className="flex flex-col gap-5">
              {/* Header */}
              <div>
                <p className="text-base mb-1" style={{ color: "var(--nd-text-3)", fontWeight: 500 }}>الاتجاه العام</p>
                <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-3.5">
                  <span className="text-4xl font-bold" style={{ color: "var(--nd-text)" }}>{stats.total}</span>
                  <div className="flex items-center gap-1" style={{ color: "#16A34A" }}>
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">{stats.todayChange > 0 ? "+" : ""}{stats.todayChange}%</span>
                    <span className="font-normal" style={{ color: "var(--nd-text-3)" }}>قارنة بالأمس</span>
                  </div>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex items-center justify-between flex-wrap gap-2.5 text-sm mb-2.5">
                <div className="flex items-center gap-2">
                  <span style={{ color: "var(--nd-text-3)" }}>طلبات اليوم:</span>
                  <span className="font-semibold" style={{ color: "var(--nd-text)" }}>{stats.recent}</span>
                  <div className="flex items-center gap-1" style={{ color: "#16A34A" }}>
                    <TrendingUp className="w-3 h-3" />
                    <span>({stats.todayChange > 0 ? "+" : ""}{stats.todayChange}%)</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-6" style={{ color: "var(--nd-text-3)" }}>
                  <span>الأعلى: <span className="font-medium" style={{ color: "#0EA5E9" }}>{stats.high}</span></span>
                  <span>الأدنى: <span className="font-medium" style={{ color: "#EAB308" }}>{stats.low}</span></span>
                  <span>التغير: <span className="font-medium" style={{ color: stats.rangeChange >= 0 ? "#16A34A" : "#DC2626" }}>{stats.rangeChange > 0 ? "+" : ""}{stats.rangeChange}%</span></span>
                </div>
              </div>

              {/* Chart */}
              <div style={{ width: "100%", height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={stats.timeline} margin={{ top: 20, right: 10, left: 5, bottom: 20 }}>
                    <defs>
                      <pattern id="dashDotGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="10" cy="10" r="1" fill="#9CA3AF" fillOpacity="0.25" />
                      </pattern>
                      <filter id="dashDotShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="rgba(206,44,96,0.45)" />
                      </filter>
                      <filter id="dashLineShadow" x="-100%" y="-100%" width="300%" height="300%">
                        <feDropShadow dx="4" dy="6" stdDeviation="25" floodColor="rgba(206,44,96,0.35)" />
                      </filter>
                    </defs>

                    <rect x="0" y="0" width="100%" height="100%" fill="url(#dashDotGrid)" style={{ pointerEvents: "none" }} />

                    <CartesianGrid strokeDasharray="4 8" stroke="#E5E7EB" strokeOpacity={1} horizontal vertical={false} />

                    <ReferenceLine x={stats.timeline[Math.floor(stats.timeline.length / 2)].day} stroke="#CE2C60" strokeDasharray="4 4" strokeWidth={1} />

                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#CE2C60" }} tickMargin={12} interval="preserveStartEnd" tickCount={5} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#CE2C60" }} tickMargin={12} allowDecimals={false} />

                    <Tooltip
                      content={<TrendTooltip />}
                      cursor={{ strokeDasharray: "3 3", stroke: "#9CA3AF", strokeOpacity: 0.5 }}
                    />

                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#CE2C60"
                      strokeWidth={2}
                      filter="url(#dashLineShadow)"
                      dot={(props: any) => {
                        const { cx, cy, payload } = props;
                        const notable = payload.orders === stats.high || payload.orders === stats.low;
                        if (!notable) return <g key={`dot-${payload.day}`} />;
                        return (
                          <circle
                            key={`dot-${payload.day}`}
                            cx={cx}
                            cy={cy}
                            r={5}
                            fill="#CE2C60"
                            stroke="#fff"
                            strokeWidth={2}
                            filter="url(#dashDotShadow)"
                          />
                        );
                      }}
                      activeDot={{ r: 5, fill: "#CE2C60", stroke: "#fff", strokeWidth: 2, filter: "url(#dashDotShadow)" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        {/* Status Distribution Pie */}
        <div className="rounded-2xl p-6 shadow-sm" style={{ background: "var(--nd-white)", border: "1px solid var(--nd-border)" }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: "var(--nd-text)" }}>توزيع الحالات</h3>
          {stats.statusDist.every((s) => s.value === 0) ? (
            <div className="py-12 text-center text-sm" style={{ color: "var(--nd-text-3)" }}>لا توجد بيانات كافية</div>
          ) : (
            <div className="flex flex-col">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={stats.statusDist.filter(s => s.value > 0)} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                    {stats.statusDist.filter(s => s.value > 0).map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2.5 justify-center mt-2">
                {stats.statusDist.filter(s => s.value > 0).map((s) => (
                  <div key={s.name} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg" style={{ background: "var(--nd-bg)" }}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                    <span className="text-[12px]" style={{ color: "var(--nd-text-2)" }}>{s.name}</span>
                    <span className="text-[12px] font-bold" style={{ color: "var(--nd-text)" }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden shadow-sm" style={{ background: "var(--nd-white)", border: "1px solid var(--nd-border)" }}>
          <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "var(--nd-border)" }}>
            <h3 className="text-lg font-semibold" style={{ color: "var(--nd-text)" }}>آخر الطلبات</h3>
            <Link to={`/${ADMIN_PATH}/orders`}>
              <AButton variant="default" size="xs" icon={<ArrowLeft size={14} />}>عرض الكل</AButton>
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <div className="p-8 text-center text-sm" style={{ color: "var(--nd-text-3)" }}>لا توجد طلبات بعد</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right" style={{ minWidth: 600 }}>
                <thead>
                  <tr style={{ background: "var(--nd-bg)" }}>
                    {["رقم الطلب", "العميل", "المدينة", "الحالة", "التاريخ"].map((h) => (
                      <th key={h} className="px-5 py-3 text-[11px] font-bold whitespace-nowrap" style={{ color: "var(--nd-text-3)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: "var(--nd-border)" }}>
                  {stats.recentOrders.map((o, i) => (
                    <tr key={o.orderId} className="hover:bg-gray-50 transition-colors" style={i % 2 === 0 ? { background: "rgba(0,0,0,0.01)" } : undefined}>
                      <td className="px-5 py-3.5">
                        <Link to={`/admin/orders/${o.orderId}`} className="text-[13px] font-bold" style={{ color: "var(--nd-primary-500)" }}>
                          {o.orderId}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-[13px] font-semibold" style={{ color: "var(--nd-text)" }}>{o.name || "—"}</p>
                        <p className="text-[10px]" style={{ color: "var(--nd-text-3)" }} dir="ltr">{o.phone}</p>
                      </td>
                      <td className="px-5 py-3.5 text-[13px]" style={{ color: "var(--nd-text-2)" }}>{o.location}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={o.status} size="sm" /></td>
                      <td className="px-5 py-3.5">
                        <p className="text-[12px]" style={{ color: "var(--nd-text-2)" }}>{fmtDate(o.createdAt)}</p>
                        <p className="text-[10px]" style={{ color: "var(--nd-text-3)" }}>{relativeAr(o.createdAt)}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl p-6 shadow-sm" style={{ background: "var(--nd-white)", border: "1px solid var(--nd-border)" }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--nd-text)" }}>مؤشرات سريعة</h3>
            <div className="space-y-4">
              {quickBars.map((bar) => (
                <div key={bar.label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm" style={{ color: "var(--nd-text-2)" }}>{bar.label}</span>
                    <span className="text-sm font-bold" style={{ color: "var(--nd-text)" }}>{bar.value}%</span>
                  </div>
                  <div className="w-full rounded-full h-2" style={{ background: "var(--nd-bg)" }}>
                    <div
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ width: `${bar.value}%`, background: bar.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {stats.topCities.length > 0 && (
            <div className="rounded-2xl p-6 shadow-sm" style={{ background: "var(--nd-white)", border: "1px solid var(--nd-border)" }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--nd-text)" }}>أفضل المدن</h3>
              <div className="space-y-3">
                {stats.topCities.map(([city, count], i) => (
                  <div key={city} className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: STATUS_COLORS[i] }}>
                        {i + 1}
                      </div>
                      <span className="text-sm" style={{ color: "var(--nd-text-2)" }}>{city}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: "var(--nd-text)" }}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
