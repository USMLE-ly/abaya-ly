import { useMemo } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Calendar,
  Home,
  Monitor,
  Package,
  Settings,
  ShoppingBag,
  ShoppingCart,
  Star,
} from "lucide-react";
import {
  Example,
  type ActivityColor,
  type DashboardData,
  type DashboardNavItem,
} from "@/components/ui/dashboard-with-collapsible-sidebar";
import { useOrders } from "../lib/metrics";
import { relativeAr, STATUSES } from "../lib/types";
import { clearPassword, isAuthed } from "../lib/api";
import { ADMIN_PATH } from "../lib/config";

const statusActivityColor = (status: string): ActivityColor =>
  status === "delivered" ? "green" : status === "shipped" ? "blue" : status === "waiting_shipping" ? "purple" : status === "processing" ? "blue" : "orange";

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data: orders, isLoading } = useOrders();

  const stats = useMemo(() => {
    if (!orders) return null;
    const now = Date.now();
    const filtered = orders.filter((o) => new Date(o.createdAt).getTime() >= now - 30 * 86400000);

    const pending = filtered.filter((o) => o.status === "pending");
    const processing = filtered.filter((o) => o.status === "processing");
    const delivered = filtered.filter((o) => o.status === "delivered");
    const recent = filtered.filter((o) => new Date(o.createdAt).getTime() >= now - 86400000);
    const uniquePhones = new Set(filtered.map((o) => o.phone));

    const byCity: Record<string, number> = {};
    filtered.forEach((o) => { byCity[o.location] = (byCity[o.location] || 0) + 1; });
    const topCities = Object.entries(byCity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([city, count]) => ({ label: city, value: `${count} طلب` }));

    const recentOrders = [...filtered]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    const yesterday = filtered.filter((o) => {
      const t = new Date(o.createdAt).getTime();
      return t >= now - 172800000 && t < now - 86400000;
    }).length;
    const todayChange = yesterday > 0
      ? Math.round(((recent.length - yesterday) / yesterday) * 100)
      : recent.length > 0 ? 100 : 0;

    const deliveryRate = filtered.length > 0
      ? Math.round((delivered.length / filtered.length) * 100) : 0;

    const revenue = filtered.reduce((sum, o) => {
      if (!Array.isArray(o.items) || o.items.length === 0) return sum;
      return sum + o.items.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
    }, 0);
    const pricedOrders = filtered.filter((o) => Array.isArray(o.items) && o.items.length > 0).length;

    // Daily revenue series for the last 30 days (real order data)
    const dayMs = 86400000;
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const days: Array<{ date: string; value: number }> = [];
    for (let i = 29; i >= 0; i -= 1) {
      const d = new Date(todayStart.getTime() - i * dayMs);
      days.push({ date: `${d.getDate()}/${d.getMonth() + 1}`, value: 0 });
    }
    const dayIndex = new Map(days.map((d, i) => [d.date, i]));
    let todayRevenue = 0;
    let yesterdayRevenue = 0;
    orders.forEach((o) => {
      const t = new Date(o.createdAt).getTime();
      if (t < todayStart.getTime() - 29 * dayMs) return;
      const d = new Date(t);
      d.setHours(0, 0, 0, 0);
      const key = `${d.getDate()}/${d.getMonth() + 1}`;
      const i = dayIndex.get(key);
      if (i === undefined) return;
      const sum = Array.isArray(o.items) && o.items.length > 0
        ? o.items.reduce((acc, it) => acc + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0)
        : 0;
      days[i].value += sum;
      if (d.getTime() === todayStart.getTime()) todayRevenue += sum;
      if (d.getTime() === todayStart.getTime() - dayMs) yesterdayRevenue += sum;
    });
    const revenueChange = yesterdayRevenue > 0
      ? Math.round(((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
      : todayRevenue > 0 ? 100 : 0;
    const revenueOverview = {
      balance: days.reduce((acc, d) => acc + d.value, 0),
      today: todayRevenue,
      changePct: revenueChange,
      series: days,
    };

    return {
      total: filtered.length,
      pending: pending.length,
      processing: processing.length,
      delivered: delivered.length,
      recent: recent.length,
      revenue,
      revenueOrders: pricedOrders,
      uniqueCustomers: uniquePhones.size,
      deliveryRate,
      todayChange,
      recentOrders,
      topCities,
      revenueOverview,
    };
  }, [orders]);

  if (!isAuthed()) {
    return <Navigate to={`/${ADMIN_PATH}/login`} replace state={{ from: location.pathname }} />;
  }

  if (isLoading || !stats) {
    return (
      <div dir="rtl" className="flex min-h-screen w-full items-center justify-center bg-gray-50" style={{ fontFamily: "var(--nd-font)" }}>
        <div className="animate-pulse text-sm font-medium text-gray-400">جارٍ تحميل لوحة القيادة...</div>
      </div>
    );
  }

  const pendingCount = stats.pending;

  const nav: DashboardNavItem[] = [
    { to: `/${ADMIN_PATH}`, label: "لوحة القيادة", icon: Home, end: true },
    { to: `/${ADMIN_PATH}/orders`, label: "الطلبات", icon: ShoppingCart, badge: pendingCount },
    { to: "/", label: "عرض الموقع", icon: Monitor, external: true },
    { to: `/${ADMIN_PATH}/products`, label: "المنتجات", icon: Package },
    { to: `/${ADMIN_PATH}/reviews`, label: "التقييمات", icon: Star },
    { to: `/${ADMIN_PATH}/analytics`, label: "التحليلات", icon: BarChart3 },
    { to: `/${ADMIN_PATH}/calendar`, label: "تقويم الشحن", icon: Calendar },
  ];

  const accountNav: DashboardNavItem[] = [
    { to: `/${ADMIN_PATH}/settings`, label: "الإعدادات", icon: Settings, end: true },
  ];

  const data: DashboardData = {
    title: "لوحة القيادة",
    subtitle: "مرحباً بعودتك إلى لوحة نادين",
    stats: {
      total: stats.total,
      revenue: stats.revenue,
      revenueOrders: stats.revenueOrders,
      uniqueCustomers: stats.uniqueCustomers,
      pending: stats.pending,
      processing: stats.processing,
      recent: stats.recent,
      deliveryRate: stats.deliveryRate,
      todayChange: stats.todayChange,
    },
    pendingCount,
    activities: stats.recentOrders.map((o) => ({
      icon: ShoppingBag,
      title: `${o.orderId} — ${o.name || "عميل"}`,
      desc: `${o.location || "—"} • ${o.phone}`,
      time: relativeAr(o.createdAt),
      color: statusActivityColor(o.status),
      to: `/${ADMIN_PATH}/orders/${o.orderId}`,
    })),
    quickBars: [
      { label: "نسبة التوصيل", value: stats.deliveryRate, color: "#16A34A" },
      { label: "قيد التجهيز", value: stats.total ? Math.round((stats.processing / stats.total) * 100) : 0, color: "#4892FE" },
      { label: "قيد الانتظار", value: stats.total ? Math.round((stats.pending / stats.total) * 100) : 0, color: "#F5A524" },
    ],
    topItems: stats.topCities,
    revenue: stats.revenueOverview,
  };

  return (
    <Example
      nav={nav}
      accountNav={accountNav}
      data={data}
      ordersTo={`/${ADMIN_PATH}/orders`}
      settingsTo={`/${ADMIN_PATH}/settings`}
      onLogout={() => {
        clearPassword();
        navigate(`/${ADMIN_PATH}/login`, { replace: true });
      }}
    />
  );
}
