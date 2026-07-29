import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Clock,
  Package,
  Truck,
  CheckCircle2,
  CalendarDays,
  CalendarRange,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useOrders, useMetrics } from "../lib/metrics";
import { StatCard } from "../components/StatCard";
import { ACard, ACardHeader, AButton, StatusBadge, ASkeleton, AEmpty } from "../components/ui";
import { fmtDateTime, relativeAr, STATUS_LIST } from "../lib/types";

export default function Dashboard() {
  const { data, isLoading, error } = useOrders();
  const m = useMetrics(data);
  const orders = data ?? [];
  const recent = [...orders]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ASkeleton key={i} className="h-[112px]" />
          ))}
        </div>
        <ASkeleton className="h-[320px]" />
      </div>
    );
  }

  if (error) {
    return (
      <ACard className="p-8">
        <AEmpty
          icon={<AlertTriangle size={34} />}
          title="تعذّر تحميل الطلبات"
          hint={(error as Error).message}
        />
      </ACard>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1
          className="text-[26px] sm:text-[30px] font-extrabold leading-tight"
          style={{ color: "var(--ad-text)", letterSpacing: "-0.025em" }}
        >
          لوحة القيادة
        </h1>
        <p className="text-[14px] mt-1" style={{ color: "var(--ad-text-3)" }}>
          نظرة تنفيذية شاملة على أداء متجر Nadine
        </p>
      </div>

      {m.stale.length > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3.5 rounded-[var(--ad-r-md)]"
          style={{ background: "#FFF6E5", border: "1px solid #F5DFB0" }}
        >
          <AlertTriangle size={19} style={{ color: "#B26A00" }} />
          <p className="text-[13.5px] font-bold flex-1" style={{ color: "#8A5200" }}>
            {m.stale.length} طلب معلّق منذ أكثر من ٢٤ ساعة ويحتاج متابعة
          </p>
          <Link to="/admin/orders?status=pending">
            <AButton size="xs" variant="default">
              عرض
            </AButton>
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="إجمالي الطلبات" value={m.total} icon={<ShoppingBag size={20} />} delay={0} />
        <StatCard label="انتظار التأكيد" value={m.byStatus.pending} accent="#B26A00" icon={<Clock size={20} />} delay={0.04} />
        <StatCard label="جاري التجهيز" value={m.byStatus.processing} accent="#2C6FD1" icon={<Package size={20} />} delay={0.08} />
        <StatCard label="في انتظار الشحن" value={m.byStatus.waiting_shipping} accent="#5E5E6B" icon={<Truck size={20} />} delay={0.12} />
        <StatCard label="تم التوصيل" value={m.byStatus.delivered} accent="#4F8A16" icon={<CheckCircle2 size={20} />} delay={0.16} />
        <StatCard label="طلبات اليوم" value={m.today} icon={<CalendarDays size={20} />} delay={0.2} />
        <StatCard label="آخر ٧ أيام" value={m.week} icon={<CalendarRange size={20} />} delay={0.24} />
        <StatCard
          label="نسبة التوصيل"
          value={`${m.deliveryRate.toFixed(0)}%`}
          accent="#4F8A16"
          icon={<TrendingUp size={20} />}
          hint={`آخر ٣٠ يوم: ${m.month} طلب`}
          delay={0.28}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <ACard className="xl:col-span-2 pb-4">
          <ACardHeader title="اتجاه الطلبات" subtitle="آخر ١٤ يومًا" />
          <div className="h-[280px] px-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={m.trend} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="adTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c42855" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#c42855" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#ECECEB" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "#878787", fontFamily: "Tajawal" }}
                  axisLine={false}
                  tickLine={false}
                  reversed
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: "#878787", fontFamily: "Tajawal" }}
                  axisLine={false}
                  tickLine={false}
                  orientation="right"
                  width={32}
                />
                <Tooltip
                  contentStyle={{
                    fontFamily: "Tajawal",
                    fontSize: 13,
                    borderRadius: 12,
                    border: "1px solid #ECECEB",
                    direction: "rtl",
                  }}
                  labelStyle={{ fontWeight: 700 }}
                  formatter={(v: number) => [`${v} طلب`, ""]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#c42855"
                  strokeWidth={2.5}
                  fill="url(#adTrend)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ACard>

        <ACard className="pb-4">
          <ACardHeader title="توزيع الحالات" />
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={m.distribution.filter((d) => d.value > 0)}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={54}
                  outerRadius={82}
                  paddingAngle={3}
                  stroke="none"
                >
                  {m.distribution
                    .filter((d) => d.value > 0)
                    .map((d) => (
                      <Cell key={d.id} fill={d.color} />
                    ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    fontFamily: "Tajawal",
                    fontSize: 13,
                    borderRadius: 12,
                    border: "1px solid #ECECEB",
                    direction: "rtl",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="px-5 pt-2 flex flex-col gap-2">
            {STATUS_LIST.map((s) => (
              <div key={s.id} className="flex items-center gap-2 text-[13px]">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                <span className="flex-1" style={{ color: "var(--ad-text-2)" }}>
                  {s.label}
                </span>
                <span className="font-extrabold tabular-nums" style={{ color: "var(--ad-text)" }}>
                  {m.byStatus[s.id]}
                </span>
              </div>
            ))}
          </div>
        </ACard>
      </div>

      {/* Latest + activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <ACard className="xl:col-span-2 pb-2">
          <ACardHeader
            title="أحدث الطلبات"
            action={
              <Link to="/admin/orders">
                <AButton size="xs" variant="plain" icon={<ArrowLeft size={14} />}>
                  الكل
                </AButton>
              </Link>
            }
          />
          {recent.length === 0 ? (
            <AEmpty icon={<ShoppingBag size={30} />} title="لا توجد طلبات بعد" />
          ) : (
            <div className="flex flex-col">
              {recent.map((o) => (
                <Link
                  key={o.orderId}
                  to={`/admin/orders/${o.orderId}`}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--ad-surface-2)] transition-colors"
                  style={{ borderTop: "1px solid var(--ad-border)" }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-bold truncate" style={{ color: "var(--ad-text)" }}>
                      {o.name}
                    </p>
                    <p className="text-[12.5px]" style={{ color: "var(--ad-text-3)" }}>
                      {o.orderId} · {o.location} · {o.size} · {o.color}
                    </p>
                  </div>
                  <div className="hidden sm:block text-[12px]" style={{ color: "var(--ad-text-3)" }}>
                    {fmtDateTime(o.createdAt)}
                  </div>
                  <StatusBadge status={o.status} size="sm" />
                </Link>
              ))}
            </div>
          )}
        </ACard>

        <ACard className="pb-4">
          <ACardHeader title="الخط الزمني للنشاط" />
          <div className="px-5 flex flex-col gap-4">
            {recent.slice(0, 5).map((o) => (
              <div key={o.orderId} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span
                    className="w-2.5 h-2.5 rounded-full mt-1.5"
                    style={{ background: "var(--ad-brand)" }}
                  />
                  <span className="flex-1 w-px my-1" style={{ background: "var(--ad-border)" }} />
                </div>
                <div className="pb-1 min-w-0">
                  <p className="text-[13.5px] font-bold truncate" style={{ color: "var(--ad-text)" }}>
                    طلب جديد — {o.orderId}
                  </p>
                  <p className="text-[12px]" style={{ color: "var(--ad-text-3)" }}>
                    {relativeAr(o.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            {recent.length === 0 && (
              <p className="text-[13px] pb-4" style={{ color: "var(--ad-text-3)" }}>
                لا يوجد نشاط
              </p>
            )}
          </div>
        </ACard>
      </div>
    </div>
  );
}
