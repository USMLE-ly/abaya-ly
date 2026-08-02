import { useMemo, useState, useEffect } from "react";
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
  Eye,
  Users,
  ShoppingCart,
  Mail,
  Gift,
  Activity,
} from "lucide-react";
import {
  ComposedChart,
  Line,
  ReferenceLine,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useOrders } from "../lib/metrics";
import { useQuery } from "@tanstack/react-query";
import { fetchStorefrontAnalytics } from "../lib/api";
import { ACard, AButton, ASelect, ASkeleton, AEmpty } from "../components/ui";
import { StatCard } from "../components/StatCard";
import { STATUSES, fmtDate, type OrderStatus } from "../lib/types";

const COLORS = ["#c42855", "#F5A524", "#4892FE", "#4F56D3", "#89D233", "#8F8F8F"];

const EVENT_LABELS: Record<string, string> = {
  page_view: "مشاهدة صفحة",
  view_item: "مشاهدة منتج",
  add_to_cart: "إضافة للسلة",
  remove_from_cart: "إزالة من السلة",
  add_to_wishlist: "إضافة للمفضلة",
  begin_checkout: "بدء الدفع",
  purchase: "شراء",
  cta_click: "نقرة CTA",
  newsletter_signup: "اشتراك نشرة",
  scroll_depth: "عمق التمرير",
  popup_shown: "ظهور نافذة",
  popup_converted: "تحويل نافذة",
  popup_dismissed: "إغلاق نافذة",
  coupon_applied: "كوبون مطبق",
  coupon_rejected: "كوبون مرفوض",
};

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

export default function Analytics() {
  const { data: orders, isLoading, error } = useOrders();
  const [range, setRange] = useState<"7" | "30" | "90" | "all">("30");
  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ["admin", "storefront-analytics"],
    queryFn: fetchStorefrontAnalytics,
    refetchInterval: 60_000,
  });
  const [productNames, setProductNames] = useState<Record<string, string>>({});

  useEffect(() => {
    let alive = true;
    import("@/data/products")
      .then((m) => {
        if (!alive) return;
        const map: Record<string, string> = {};
        for (const p of m.products) {
          map[p.id] = (p.name || "").split(" • ").slice(2).join(" • ") || p.name;
        }
        setProductNames(map);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

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

    const high = timelineChart.length ? Math.max(...timelineChart.map((t) => t.orders)) : 0;
    const low = timelineChart.length ? Math.min(...timelineChart.map((t) => t.orders)) : 0;
    const firstOrders = timelineChart.length ? timelineChart[0].orders : 0;
    const lastOrders = timelineChart.length ? timelineChart[timelineChart.length - 1].orders : 0;
    const rangeChange = firstOrders > 0
      ? Math.round(((lastOrders - firstOrders) / firstOrders) * 100) : 0;
    const yesterday = filtered.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= now - 172800000 && t < now - 86400000;
    }).length;
    const todayChange = yesterday > 0
      ? Math.round(((recent.length - yesterday) / yesterday) * 100)
      : recent.length > 0 ? 100 : 0;

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
      high,
      low,
      rangeChange,
      todayChange,
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
          <h1 className="text-[26px] sm:text-[30px] font-extrabold leading-tight" style={{ color: "var(--nd-text)" }}>
            التحليلات
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--nd-text-3)" }}>
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
          accent="#c42855"
        />
        <StatCard
          icon={<Clock size={18} />}
          value={stats.pending}
          label="انتظار التأكيد"
          accent="#F5A524"
        />
        <StatCard
          icon={<Package size={18} />}
          value={stats.processing}
          label="قيد التجهيز"
          accent="#4892FE"
        />
        <StatCard
          icon={<Truck size={18} />}
          value={stats.shipped + stats.waitingShipping}
          label={stats.waitingShipping > 0 ? `شحن (${stats.waitingShipping} انتظار)` : "جاري الشحن"}
          accent="#4F56D3"
        />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          value={stats.delivered}
          label="تم التوصيل"
          accent="#89D233"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={<TrendingUp size={18} />}
          value={`${stats.deliveryRate}%`}
          label="نسبة التوصيل"
          accent="#4F56D3"
        />
        <StatCard
          icon={<Clock size={18} />}
          value={stats.avgProcessing > 0 ? `${stats.avgProcessing} ساعة` : "—"}
          label="معدل وقت المعالجة"
          accent="#4892FE"
        />
        <StatCard
          icon={<CalendarDays size={18} />}
          value={stats.recent}
          label="اليوم"
          accent="#c42855"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders timeline */}
        <ACard className="p-5 sm:p-6">
          <h3 className="text-[15px] font-extrabold mb-4" style={{ color: "var(--nd-text)" }}>
            الطلبات عبر الوقت
          </h3>
          {stats.timelineChart.length === 0 ? (
            <p className="text-[13px] py-8 text-center" style={{ color: "var(--nd-text-4)" }}>لا توجد بيانات كافية</p>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Header */}
              <div>
                <p className="text-sm mb-1" style={{ color: "var(--nd-text-3)", fontWeight: 500 }}>الاتجاه العام</p>
                <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-3.5">
                  <span className="text-3xl font-extrabold" style={{ color: "var(--nd-text)" }}>{stats.total}</span>
                  <div className="flex items-center gap-1" style={{ color: stats.todayChange >= 0 ? "#16A34A" : "#DC2626" }}>
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-medium">{stats.todayChange > 0 ? "+" : ""}{stats.todayChange}%</span>
                    <span className="font-normal" style={{ color: "var(--nd-text-3)" }}>قارنة بالأمس</span>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-between flex-wrap gap-2.5 text-sm">
                <span style={{ color: "var(--nd-text-3)" }}>طلبات اليوم: <span className="font-semibold" style={{ color: "var(--nd-text)" }}>{stats.recent}</span></span>
                <span style={{ color: "var(--nd-text-3)" }}>الأعلى: <span className="font-medium" style={{ color: "#0EA5E9" }}>{stats.high}</span></span>
                <span style={{ color: "var(--nd-text-3)" }}>الأدنى: <span className="font-medium" style={{ color: "#EAB308" }}>{stats.low}</span></span>
                <span style={{ color: "var(--nd-text-3)" }}>التغير: <span className="font-medium" style={{ color: stats.rangeChange >= 0 ? "#16A34A" : "#DC2626" }}>{stats.rangeChange > 0 ? "+" : ""}{stats.rangeChange}%</span></span>
              </div>

              {/* Chart */}
              <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={stats.timelineChart} margin={{ top: 20, right: 10, left: 5, bottom: 20 }}>
                    <defs>
                      <pattern id="analyticsDotGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="10" cy="10" r="1" fill="#9CA3AF" fillOpacity="0.25" />
                      </pattern>
                      <filter id="analyticsDotShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="rgba(196,40,85,0.45)" />
                      </filter>
                      <filter id="analyticsLineShadow" x="-100%" y="-100%" width="300%" height="300%">
                        <feDropShadow dx="4" dy="6" stdDeviation="25" floodColor="rgba(196,40,85,0.35)" />
                      </filter>
                    </defs>

                    <rect x="0" y="0" width="100%" height="100%" fill="url(#analyticsDotGrid)" style={{ pointerEvents: "none" }} />

                    <CartesianGrid strokeDasharray="4 8" stroke="#E5E7EB" strokeOpacity={1} horizontal vertical={false} />

                    <ReferenceLine x={stats.timelineChart[Math.floor(stats.timelineChart.length / 2)].day} stroke="#c42855" strokeDasharray="4 4" strokeWidth={1} />

                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#c42855" }} tickMargin={12} interval="preserveStartEnd" tickCount={5} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#c42855" }} tickMargin={12} allowDecimals={false} />

                    <Tooltip
                      content={<TrendTooltip />}
                      cursor={{ strokeDasharray: "3 3", stroke: "#9CA3AF", strokeOpacity: 0.5 }}
                    />

                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#c42855"
                      strokeWidth={2}
                      filter="url(#analyticsLineShadow)"
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
                            fill="#c42855"
                            stroke="#fff"
                            strokeWidth={2}
                            filter="url(#analyticsDotShadow)"
                          />
                        );
                      }}
                      activeDot={{ r: 5, fill: "#c42855", stroke: "#fff", strokeWidth: 2, filter: "url(#analyticsDotShadow)" }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </ACard>

        {/* Status distribution */}
        <ACard className="p-5 sm:p-6">
          <h3 className="text-[15px] font-extrabold mb-4" style={{ color: "var(--nd-text)" }}>
            توزيع الحالات
          </h3>
          {stats.statusChart.every((s) => s.value === 0) ? (
            <p className="text-[13px] py-8 text-center" style={{ color: "var(--nd-text-4)" }}>لا توجد بيانات كافية</p>
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
                    <span className="text-[12px]" style={{ color: "var(--nd-text-2)" }}>{s.name}</span>
                    <span className="text-[12px] font-bold" style={{ color: "var(--nd-text)" }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ACard>

        {/* Top cities */}
        <ACard className="p-5 sm:p-6">
          <h3 className="text-[15px] font-extrabold mb-4" style={{ color: "var(--nd-text)" }}>
            توزيع المدن
          </h3>
          {stats.cityChart.length === 0 ? (
            <p className="text-[13px] py-8 text-center" style={{ color: "var(--nd-text-4)" }}>لا توجد بيانات كافية</p>
          ) : (
            <div className="space-y-3">
              {stats.cityChart.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="text-[12px] w-5 text-center font-bold" style={{ color: "var(--nd-text-4)" }}>{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-[13px] font-semibold" style={{ color: "var(--nd-text)" }}>{c.name}</span>
                      <span className="text-[12px] font-bold" style={{ color: "var(--nd-primary-500)" }}>{c.value}</span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "var(--nd-border)" }}>
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
          <h3 className="text-[15px] font-extrabold mb-4" style={{ color: "var(--nd-text)" }}>
            أفضل المدن
          </h3>
          {stats.topCities.length === 0 ? (
            <p className="text-[13px] py-8 text-center" style={{ color: "var(--nd-text-4)" }}>لا توجد بيانات كافية</p>
          ) : (
            <div className="space-y-4">
              {stats.topCities.map((c, i) => (
                <div key={c.city} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[18px] font-extrabold" style={{ color: COLORS[i] }}>{i + 1}</span>
                    <div>
                      <p className="text-[14px] font-semibold" style={{ color: "var(--nd-text)" }}>{c.city}</p>
                      <p className="text-[11px]" style={{ color: "var(--nd-text-4)" }}>{c.count} طلب</p>
                    </div>
                  </div>
                  <span className="text-[13px] font-bold" style={{ color: "var(--nd-primary-500)" }}>{c.percent}%</span>
                </div>
              ))}
            </div>
          )}
        </ACard>
      </div>

      {/* ── Storefront analytics (internal, no third-party) ── */}
      <div className="mt-2">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-extrabold" style={{ color: "var(--nd-text)" }}>
              نشاط المتجر
            </h2>
            <p className="text-[12.5px] mt-0.5" style={{ color: "var(--nd-text-3)" }}>
              تحليلات داخلية من متجرنا — بدون Google أو أي خدمة خارجية
            </p>
          </div>
        </div>

        {storeLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => <ASkeleton key={i} className="h-28" />)}
          </div>
        ) : !store || !store.analytics || Object.keys(store.analytics.counts || {}).length === 0 ? (
          <ACard className="p-10">
            <AEmpty
              icon={<Activity size={34} />}
              title="لا توجد بيانات بعد"
              hint="ستظهر هنا مشاهدات المتجر فور بدء الزيارات"
            />
          </ACard>
        ) : (
          <>
            {/* Storefront stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard icon={<Eye size={18} />} value={store.analytics.counts.page_view ?? 0} label="مشاهدات الصفحات" accent="#c42855" />
              <StatCard icon={<Users size={18} />} value={store.analytics.visitors ?? 0} label="زوار فريدون (30 يوم)" accent="#4892FE" />
              <StatCard icon={<ShoppingCart size={18} />} value={store.analytics.counts.add_to_cart ?? 0} label="إضافات للسلة" accent="#4F56D3" />
              <StatCard icon={<Mail size={18} />} value={store.analytics.counts.newsletter_signup ?? 0} label="اشتراكات النشرة" accent="#89D233" />
              <StatCard icon={<Gift size={18} />} value={store.analytics.counts.popup_converted ?? 0} label="تحويلات النوافذ" accent="#F5A524" />
            </div>

            {/* Top pages + products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <ACard className="p-5 sm:p-6">
                <h3 className="text-[15px] font-extrabold mb-4" style={{ color: "var(--nd-text)" }}>
                  أفضل الصفحات
                </h3>
                {store.analytics.topPages.length === 0 ? (
                  <p className="text-[13px] py-8 text-center" style={{ color: "var(--nd-text-4)" }}>لا توجد بيانات كافية</p>
                ) : (
                  <div className="space-y-3">
                    {store.analytics.topPages.map((p: { path: string; count: number }, i: number) => (
                      <div key={p.path} className="flex items-center gap-3">
                        <span className="text-[12px] w-5 text-center font-bold" style={{ color: "var(--nd-text-4)" }}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between gap-2 mb-1">
                            <span className="text-[12.5px] font-semibold truncate" style={{ color: "var(--nd-text)", direction: "ltr", textAlign: "right" }}>{p.path}</span>
                            <span className="text-[12px] font-bold whitespace-nowrap" style={{ color: "var(--nd-primary-500)" }}>{p.count}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--nd-border)" }}>
                            <div className="h-full rounded-full" style={{ width: `${(p.count / store.analytics.topPages[0].count) * 100}%`, background: COLORS[i % COLORS.length] }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ACard>

              <ACard className="p-5 sm:p-6">
                <h3 className="text-[15px] font-extrabold mb-4" style={{ color: "var(--nd-text)" }}>
                  أفضل المنتجات (مشاهدة + إضافة)
                </h3>
                {store.analytics.topProducts.length === 0 ? (
                  <p className="text-[13px] py-8 text-center" style={{ color: "var(--nd-text-4)" }}>لا توجد بيانات كافية</p>
                ) : (
                  <div className="space-y-3">
                    {store.analytics.topProducts.map((p: { id: string; count: number }, i: number) => (
                      <div key={p.id} className="flex items-center gap-3">
                        <span className="text-[12px] w-5 text-center font-bold" style={{ color: "var(--nd-text-4)" }}>{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12.5px] font-semibold truncate" style={{ color: "var(--nd-text)" }}>
                            {productNames[p.id] || p.id}
                          </p>
                          <p className="text-[10.5px] mt-0.5 truncate" style={{ color: "var(--nd-text-4)", direction: "ltr", textAlign: "right" }}>{p.id}</p>
                        </div>
                        <span className="text-[12px] font-bold whitespace-nowrap" style={{ color: "var(--nd-primary-500)" }}>{p.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </ACard>
            </div>

            {/* Recent events */}
            <ACard className="p-5 sm:p-6 mt-6 overflow-hidden">
              <h3 className="text-[15px] font-extrabold mb-4" style={{ color: "var(--nd-text)" }}>
                آخر الأحداث
              </h3>
              {store.analytics.recent.length === 0 ? (
                <p className="text-[13px] py-8 text-center" style={{ color: "var(--nd-text-4)" }}>لا توجد أحداث بعد</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b" style={{ borderColor: "var(--nd-border)" }}>
                        <th className="p-3 font-bold" style={{ color: "var(--nd-text-3)" }}>الحدث</th>
                        <th className="p-3 font-bold" style={{ color: "var(--nd-text-3)" }}>الصفحة</th>
                        <th className="p-3 font-bold" style={{ color: "var(--nd-text-3)" }}>الوقت</th>
                      </tr>
                    </thead>
                    <tbody>
                      {store.analytics.recent.map((e: { name: string; path: string; ts: string }, i: number) => (
                        <tr key={i} className="border-b last:border-0" style={{ borderColor: "var(--nd-border)" }}>
                          <td className="p-3 font-semibold" style={{ color: "var(--nd-text)" }}>
                            {EVENT_LABELS[e.name] || e.name}
                          </td>
                          <td className="p-3 max-w-[260px] truncate" style={{ color: "var(--nd-text-2)", direction: "ltr", textAlign: "right" }}>{e.path || "—"}</td>
                          <td className="p-3 whitespace-nowrap" style={{ color: "var(--nd-text-3)" }}>
                            {new Date(e.ts).toLocaleString("ar-LY", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ACard>
          </>
        )}
      </div>
    </div>
  );
}
