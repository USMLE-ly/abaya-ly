"use client";

import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  ChevronsLeft,
  Clock,
  DollarSign,
  LogOut,
  Moon,
  Settings,
  ShoppingCart,
  Sun,
  TrendingUp,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

const PINK = "#CE2C60";

/* ── Types ────────────────────────────────────────────────────── */

export type ActivityColor = "green" | "blue" | "purple" | "orange" | "red";

export interface DashboardNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  external?: boolean;
  end?: boolean;
}

export interface DashboardStats {
  total: number;
  revenue: number;
  uniqueCustomers: number;
  pending: number;
  processing: number;
  recent: number;
  deliveryRate: number;
  todayChange: number;
}

export interface DashboardActivity {
  icon: LucideIcon;
  title: string;
  desc: string;
  time: string;
  color: ActivityColor;
  to?: string;
}

export interface DashboardBar {
  label: string;
  value: number;
  color: string;
}

export interface DashboardTopItem {
  label: string;
  value: string;
}

export interface DashboardData {
  title?: string;
  subtitle?: string;
  userName?: string;
  userPlan?: string;
  stats: DashboardStats;
  pendingCount: number;
  activities: DashboardActivity[];
  quickBars: DashboardBar[];
  topItems: DashboardTopItem[];
}

export interface DashboardShellProps {
  nav: DashboardNavItem[];
  accountNav: DashboardNavItem[];
  data: DashboardData;
  settingsTo: string;
  onLogout?: () => void;
}

/* ── Sidebar pieces (reference port) ──────────────────────────── */

const Logo = () => (
  <div
    className="grid size-10 shrink-0 place-content-center rounded-lg shadow-sm"
    style={{ background: `linear-gradient(135deg, ${PINK}, #A81F47)` }}
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-white">
      <path d="M12 2C9 7 6.5 9 3 10c1.5 4 4.5 6.5 9 12 4.5-5.5 7.5-8 9-12-3.5-1-6-3-9-10Z" />
      <circle cx="12" cy="9" r="2" fill={PINK} />
    </svg>
  </div>
);

const TitleSection = ({ open }: { open: boolean }) => (
  <div className="mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
    <div className="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
      <div className="flex items-center gap-3">
        <Logo />
        {open && (
          <div>
            <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">نادين</span>
            <span className="block text-xs text-gray-500 dark:text-gray-400">لوحة الإدارة</span>
          </div>
        )}
      </div>
      {open && <ChevronDown className="h-4 w-4 text-gray-400 dark:text-gray-500" />}
    </div>
  </div>
);

const Option = ({
  Icon,
  title,
  to,
  badge,
  open,
  collapsed,
  external,
  end,
}: {
  Icon: LucideIcon;
  title: string;
  to: string;
  badge?: number;
  open: boolean;
  collapsed: boolean;
  external?: boolean;
  end?: boolean;
}) => {
  const base =
    "relative flex h-11 w-full items-center rounded-md transition-all duration-200" +
    (collapsed ? " justify-center" : "");
  const idle =
    "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200";
  const content = (
    <>
      <div className="grid h-full w-12 shrink-0 place-content-center">
        <Icon className="h-4 w-4" />
      </div>
      {open && <span className="flex-1 truncate text-sm font-medium">{title}</span>}
      {open && badge !== undefined && badge > 0 && (
        <span
          className="absolute end-3 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-medium text-white"
          style={{ background: PINK }}
        >
          {badge}
        </span>
      )}
    </>
  );
  if (external) {
    return (
      <a href={to} target="_blank" rel="noreferrer" className={`${base} ${idle}`}>
        {content}
      </a>
    );
  }
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `${base} ${
          isActive
            ? "bg-strawberry-100 text-[#CE2C60] shadow-sm"
            : idle
        }`
      }
      style={({ isActive }) => ({
        borderInlineEnd: isActive ? `2px solid ${PINK}` : "2px solid transparent",
      })}
    >
      {content}
    </NavLink>
  );
};

const ToggleClose = ({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) => (
  <button
    onClick={() => setOpen(!open)}
    className="flex w-full items-center border-t border-gray-200 dark:border-gray-800 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
  >
    <div className="grid size-10 shrink-0 place-content-center">
      <ChevronsLeft
        className={`h-4 w-4 transition-transform duration-300 text-gray-500 dark:text-gray-400 ${
          open ? "" : "rotate-180"
        }`}
      />
    </div>
    {open && (
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">طي</span>
    )}
  </button>
);

const Sidebar = ({
  nav,
  accountNav,
  open,
  setOpen,
  onLogout,
}: {
  nav: DashboardNavItem[];
  accountNav: DashboardNavItem[];
  open: boolean;
  setOpen: (v: boolean) => void;
  onLogout?: () => void;
}) => (
  <nav
    className={`sticky top-0 h-screen shrink-0 border-e border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-2 shadow-sm transition-all duration-300 ease-in-out ${
      open ? "w-64" : "w-16"
    }`}
  >
    <div className="flex h-full flex-col">
      <TitleSection open={open} />
      <div className="flex-1 space-y-1 overflow-y-auto pb-4">
        {nav.map((item) => (
          <Option
            key={item.to}
            Icon={item.icon}
            title={item.label}
            to={item.to}
            badge={item.badge}
            open={open}
            collapsed={!open}
            external={item.external}
            end={item.end}
          />
        ))}
      </div>

      {open && (
        <div className="space-y-1 border-t border-gray-200 dark:border-gray-800 pt-3">
          <div className="px-3 py-2 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            الحساب
          </div>
          {accountNav.map((item) => (
            <Option
              key={item.to}
              Icon={item.icon}
              title={item.label}
              to={item.to}
              open={open}
              collapsed={false}
              end
            />
          ))}
          <button
            onClick={onLogout}
            className="flex h-11 w-full items-center rounded-md text-gray-600 dark:text-gray-400 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
          >
            <div className="grid h-full w-12 shrink-0 place-content-center">
              <LogOut className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">تسجيل الخروج</span>
          </button>
        </div>
      )}

      <ToggleClose open={open} setOpen={setOpen} />
    </div>
  </nav>
);

/* ── Content (reference port, data-driven) ────────────────────── */

const activityTint = (color: ActivityColor) =>
  color === "green"
    ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
    : color === "blue"
      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
      : color === "purple"
        ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
        : color === "orange"
          ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
          : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400";

const ExampleContent = ({
  isDark,
  setIsDark,
  data,
  settingsTo,
}: {
  isDark: boolean;
  setIsDark: (v: boolean) => void;
  data: DashboardData;
  settingsTo: string;
}) => {
  const { stats } = data;
  const deltaColor = stats.todayChange >= 0 ? "#16A34A" : "#DC2626";
  const deltaLabel = `${stats.todayChange > 0 ? "+" : ""}${stats.todayChange}% عن الأمس`;

  const statCards = [
    {
      icon: ShoppingCart,
      tint: "bg-strawberry-100",
      iconColor: PINK,
      label: "إجمالي الطلبات",
      value: stats.total.toLocaleString(),
      delta: deltaLabel,
      deltaClass: "text-green-600 dark:text-green-400",
      deltaStyle: { color: deltaColor },
    },
    {
      icon: DollarSign,
      tint: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      label: "الإيرادات التقديرية",
      value: `${stats.revenue.toLocaleString()} د.ل`,
      delta: "تقديري بناءً على متوسط السعر",
      deltaClass: "text-gray-500 dark:text-gray-400",
      deltaStyle: undefined,
    },
    {
      icon: Users,
      tint: "bg-green-50 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
      label: "عملاء فريدون",
      value: stats.uniqueCustomers.toLocaleString(),
      delta: "بناءً على رقم الهاتف",
      deltaClass: "text-gray-500 dark:text-gray-400",
      deltaStyle: undefined,
    },
    {
      icon: Clock,
      tint: "bg-orange-50 dark:bg-orange-900/20",
      iconColor: "text-orange-600 dark:text-orange-400",
      label: "قيد الانتظار",
      value: stats.pending.toLocaleString(),
      delta: stats.processing > 0 ? `${stats.processing} قيد التجهيز` : "لا توجد طلبات بانتظار المراجعة",
      deltaClass: "text-gray-500 dark:text-gray-400",
      deltaStyle: undefined,
    },
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-50 p-6 dark:bg-gray-950">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {data.title ?? "لوحة القيادة"}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {data.subtitle ?? "مرحباً بعودتك إلى لوحة نادين"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <NavLink
            to="/dashboard-nadine-admin/orders?status=pending"
            className="relative rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            title="طلبات بحاجة للمراجعة"
          >
            <Bell className="h-5 w-5" />
            {data.pendingCount > 0 && (
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-red-500" />
            )}
          </NavLink>
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <NavLink
            to={settingsTo}
            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
            title="الإعدادات"
          >
            <User className="h-5 w-5" />
          </NavLink>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className={`rounded-lg p-2 ${card.tint}`}>
                <card.icon className={`h-5 w-5 ${card.iconColor}`} />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <h3 className="mb-1 font-medium text-gray-600 dark:text-gray-400">{card.label}</h3>
            <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">{card.value}</p>
            <p
              className={`mt-1 text-sm ${card.deltaClass}`}
              style={card.deltaStyle ?? undefined}
            >
              {card.delta}
            </p>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">آخر الطلبات</h3>
              <NavLink
                to="/dashboard-nadine-admin/orders"
                className="text-sm font-medium text-[#CE2C60] hover:text-[#A81F47]"
              >
                عرض الكل
              </NavLink>
            </div>
            {data.activities.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">لا توجد طلبات بعد</p>
            ) : (
              <div className="space-y-4">
                {data.activities.map((activity, i) => {
                  const row = (
                    <>
                      <div className={`rounded-lg p-2 ${activityTint(activity.color)}`}>
                        <activity.icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                          {activity.title}
                        </p>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {activity.desc}
                        </p>
                      </div>
                      <div className="shrink-0 text-xs text-gray-400 dark:text-gray-500">
                        {activity.time}
                      </div>
                    </>
                  );
                  return activity.to ? (
                    <NavLink
                      key={i}
                      to={activity.to}
                      className="flex items-center space-x-4 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      {row}
                    </NavLink>
                  ) : (
                    <div
                      key={i}
                      className="flex cursor-pointer items-center space-x-4 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      {row}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">مؤشرات سريعة</h3>
            <div className="space-y-4">
              {data.quickBars.map((bar) => (
                <div key={bar.label}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{bar.label}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{bar.value}%</span>
                  </div>
                  <div className="mt-1.5 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, bar.value))}%`, background: bar.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">أفضل المدن</h3>
            <div className="space-y-3">
              {data.topItems.length === 0 ? (
                <p className="text-sm text-gray-400">لا توجد بيانات كافية</p>
              ) : (
                data.topItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.value}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Main shell (reference port) ──────────────────────────────── */

export const Example = ({ nav, accountNav, data, settingsTo, onLogout }: DashboardShellProps) => {
  const [isDark, setIsDark] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div dir="rtl" className="flex min-h-screen w-full" style={{ fontFamily: "var(--nd-font)" }}>
      <div className="flex w-full bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <Sidebar nav={nav} accountNav={accountNav} open={open} setOpen={setOpen} onLogout={onLogout} />
        <ExampleContent isDark={isDark} setIsDark={setIsDark} data={data} settingsTo={settingsTo} />
      </div>
    </div>
  );
};

export default Example;
