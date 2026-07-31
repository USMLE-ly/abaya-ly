import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag, Clock, Package, Truck, CheckCircle2, TrendingUp, DollarSign,
  Users, AlertTriangle, ArrowLeft,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { useOrders } from "../lib/metrics";
import { fmtDate, fmtDateTime, relativeAr, STATUSES } from "../lib/types";
import { StatCard } from "../components/StatCard";
import { AButton, AEmpty, StatusBadge, ACard, ASkeleton } from "../components/ui";
import { ADMIN_PATH } from "../lib/config";

const STATUS_COLORS = ["#F5A524", "#4892FE", "#8F8F8F", "#4F56D3", "#89D233"];

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
      timeline,
      statusDist,
      topCities,
      recentOrders,
    };
  }, [orders, range]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <ASkeleton key={i} className="h-28 !rounded-2xl" />)}
        </div>
        <ASkeleton className="h-72 !rounded-2xl" />
        <ASkeleton className="h-80 !rounded-2xl" />
      </div>
    );
  }

  if (!stats) return null;

  const rangeBtns = [
    { value: "7", label: "7 أيام" },
    { value: "30", label: "30 يوم" },
    { value: "all", label: "الكل" },
  ] as const;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--nd-text)" }}>
            لوحة القيادة
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--nd-text-3)" }}>
            مرحباً بعودتك! إليك ملخص المتجر
          </p>
        </div>
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
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to={`/${ADMIN_PATH}/orders`} className="block transition-opacity hover:opacity-80">
          <StatCard
            icon={<ShoppingBag size={18} />}
            value={stats.total}
            label="إجمالي الطلبات"
            accent="var(--nd-primary-500)"
          />
        </Link>
        <Link to={`/${ADMIN_PATH}/orders?status=pending`} className="block transition-opacity hover:opacity-80">
          <StatCard
            icon={<Clock size={18} />}
            value={stats.pending}
            label="قيد الانتظار"
            hint={stats.pending > 0 ? `${stats.pending} طلب بحاجة للمراجعة` : undefined}
          />
        </Link>
        <StatCard
          icon={<Users size={18} />}
          value={stats.uniqueCustomers}
          label="عملاء فريدون"
          hint="بناءً على رقم الهاتف"
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          value={`${stats.deliveryRate}%`}
          label="نسبة التوصيل"
          hint="من إجمالي الطلبات"
        />
      </div>

      {/* Secondary KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "var(--nd-white)", border: "1px solid var(--nd-border)" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(206,44,96,0.1)" }}>
            <DollarSign size={20} style={{ color: "var(--nd-primary-500)" }} />
          </div>
          <div>
            <p className="text-[11px] font-bold" style={{ color: "var(--nd-text-3)" }}>الإيرادات التقديرية</p>
            <p className="text-lg font-bold" style={{ color: "var(--nd-text)" }}>{stats.revenue.toLocaleString()} د.ل</p>
          </div>
        </div>
        <Link to={`/${ADMIN_PATH}/orders?status=processing`} className="block transition-opacity hover:opacity-80">
          <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "var(--nd-white)", border: "1px solid var(--nd-border)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(84,166,255,0.1)" }}>
              <Package size={20} style={{ color: "#54A6FF" }} />
            </div>
            <div>
              <p className="text-[11px] font-bold" style={{ color: "var(--nd-text-3)" }}>قيد التجهيز</p>
              <p className="text-lg font-bold" style={{ color: "var(--nd-text)" }}>{stats.processing}</p>
            </div>
          </div>
        </Link>
        <Link to={`/${ADMIN_PATH}/orders?status=delivered`} className="block transition-opacity hover:opacity-80">
          <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "var(--nd-white)", border: "1px solid var(--nd-border)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(156,211,35,0.1)" }}>
              <CheckCircle2 size={20} style={{ color: "#9CD323" }} />
            </div>
            <div>
              <p className="text-[11px] font-bold" style={{ color: "var(--nd-text-3)" }}>تم التوصيل</p>
              <p className="text-lg font-bold" style={{ color: "var(--nd-text)" }}>{stats.delivered}</p>
            </div>
          </div>
        </Link>
        <div className="rounded-2xl p-5 flex items-center gap-4" style={{ background: "var(--nd-white)", border: "1px solid var(--nd-border)" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(206,44,96,0.06)" }}>
            <ShoppingBag size={20} style={{ color: "var(--nd-primary-300)" }} />
          </div>
          <div>
            <p className="text-[11px] font-bold" style={{ color: "var(--nd-text-3)" }}>اليوم</p>
            <p className="text-lg font-bold" style={{ color: "var(--nd-text)" }}>{stats.recent}</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Order Timeline Chart */}
        <div className="rounded-2xl p-5" style={{ background: "var(--nd-white)", border: "1px solid var(--nd-border)" }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: "var(--nd-text)" }}>اتجاه الطلبات</h3>
          {stats.timeline.length === 0 ? (
            <div className="py-12 text-center text-sm" style={{ color: "var(--nd-text-3)" }}>لا توجد بيانات كافية</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={stats.timeline}>
                <defs>
                  <linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#CE2C60" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#CE2C60" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="orders" stroke="#CE2C60" strokeWidth={2} fill="url(#dashGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Distribution Pie */}
        <div className="rounded-2xl p-5" style={{ background: "var(--nd-white)", border: "1px solid var(--nd-border)" }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: "var(--nd-text)" }}>توزيع الحالات</h3>
          {stats.statusDist.every((s) => s.value === 0) ? (
            <div className="py-12 text-center text-sm" style={{ color: "var(--nd-text-3)" }}>لا توجد بيانات كافية</div>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={240}>
                <PieChart>
                  <Pie data={stats.statusDist.filter(s => s.value > 0)} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value">
                    {stats.statusDist.filter(s => s.value > 0).map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2.5">
                {stats.statusDist.filter(s => s.value > 0).map((s) => (
                  <div key={s.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: s.color }} />
                    <span className="text-[12px]" style={{ color: "var(--nd-text-2)" }}>{s.name}</span>
                    <span className="text-[12px] font-bold" style={{ color: "var(--nd-text)" }}>{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--nd-white)", border: "1px solid var(--nd-border)" }}>
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--nd-border)" }}>
          <h3 className="text-sm font-bold" style={{ color: "var(--nd-text)" }}>آخر الطلبات</h3>
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

      {/* Top Cities */}
      {stats.topCities.length > 0 && (
        <div className="rounded-2xl p-5" style={{ background: "var(--nd-white)", border: "1px solid var(--nd-border)" }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: "var(--nd-text)" }}>أفضل المدن</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {stats.topCities.map(([city, count], i) => (
              <div key={city} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--nd-bg)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: STATUS_COLORS[i] }}>
                  {i + 1}
                </div>
                <div>
                  <p className="text-[13px] font-semibold" style={{ color: "var(--nd-text)" }}>{city}</p>
                  <p className="text-[10px]" style={{ color: "var(--nd-text-3)" }}>{count} طلب</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
