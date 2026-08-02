import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  BarChart3,
  Settings,
  LogOut,
  X,
  Calendar,
  ChevronDown,
  ChevronsLeft,
  Star,
  Monitor,
} from "lucide-react";
import { clearPassword } from "../lib/api";
import { ADMIN_PATH } from "../lib/config";

interface NavItem {
  to: string;
  label: string;
  icon: any;
  end?: boolean;
  badge?: number;
  external?: boolean;
}

const NAV: NavItem[] = [
  { to: "/dashboard-nadine-admin", label: "لوحة القيادة", icon: LayoutDashboard, end: true },
  { to: "/dashboard-nadine-admin/orders", label: "الطلبات", icon: ShoppingBag, badge: 0 },
  { to: "/dashboard-nadine-admin/products", label: "المنتجات", icon: Package },
  { to: "/dashboard-nadine-admin/reviews", label: "التقييمات", icon: Star },
  { to: "/dashboard-nadine-admin/analytics", label: "التحليلات", icon: BarChart3 },
  { to: "/dashboard-nadine-admin/calendar", label: "تقويم الشحن", icon: Calendar },
];

const PINK = "#CE2C60";

export function Sidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapse,
  pendingCount,
}: {
  open: boolean;
  onClose: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  pendingCount: number;
}) {
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const logout = () => {
    clearPassword();
    navigate(`/${ADMIN_PATH}/login`, { replace: true });
  };

  const sidebarW = collapsed ? 80 : 280;

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(16,24,40,0.5)" }}
          onClick={onClose}
        />
      )}

      <aside
        className="fixed lg:sticky top-0 h-screen z-50 flex flex-col overflow-hidden nd-sidebar transition-all duration-300 ease-in-out"
        style={{
          width: open ? 280 : collapsed ? 80 : 0,
          minWidth: open ? 280 : collapsed ? 80 : 0,
          background: "var(--nd-white)",
          borderLeft: "1px solid var(--nd-border)",
          insetInlineEnd: 0,
        }}
      >
        {/* Brand / Title section (reference style) */}
        <div className="shrink-0 border-b" style={{ borderColor: "var(--nd-border)" }}>
          <div className="flex items-center justify-between p-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="grid size-10 shrink-0 place-content-center rounded-lg text-white font-bold shadow-sm"
                style={{ background: `linear-gradient(135deg, ${PINK}, #A81F47)` }}
              >
                <svg width="20" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-white">
                  <path d="M12 2C9 7 6.5 9 3 10c1.5 4 4.5 6.5 9 12 4.5-5.5 7.5-8 9-12-3.5-1-6-3-9-10Z" />
                  <circle cx="12" cy="9" r="2" fill="var(--nd-primary-500)" />
                </svg>
              </div>
              {!collapsed && (
                <div className="min-w-0 transition-opacity duration-200">
                  <p className="text-sm font-bold truncate" style={{ color: "var(--nd-text)" }}>نادين</p>
                  <p className="text-xs truncate" style={{ color: "var(--nd-text-3)" }}>لوحة الإدارة</p>
                </div>
              )}
            </div>
            {!collapsed && !open ? (
              <ChevronDown className="h-4 w-4" style={{ color: "var(--nd-text-3)" }} />
            ) : open ? (
              <button onClick={onClose} className="lg:hidden p-1 rounded-lg" style={{ color: "var(--nd-text-3)" }}>
                <X size={18} />
              </button>
            ) : null}
          </div>
        </div>

        {/* Navigation (reference Option style) */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {!collapsed && (
            <p
              className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide"
              style={{ color: "var(--nd-text-3)" }}
            >
              القائمة
            </p>
          )}
          {NAV.map((item) => {
            const navItem = { ...item };
            if (navItem.to === "/dashboard-nadine-admin/orders") navItem.badge = pendingCount;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `relative flex h-11 w-full items-center rounded-md transition-all duration-200 ${
                    collapsed ? "justify-center" : ""
                  }`
                }
                style={({ isActive }) => ({
                  background: isActive ? "var(--nd-primary-100)" : "transparent",
                  color: isActive ? PINK : "var(--nd-text-2)",
                  boxShadow: isActive ? "var(--nd-e1)" : undefined,
                  borderInlineStart: isActive ? "2px solid " + PINK : "2px solid transparent",
                })}
              >
                <div className="grid h-full w-12 shrink-0 place-content-center">
                  <item.icon className="h-4 w-4" />
                </div>
                {!collapsed && (
                  <span className="flex-1 text-sm font-medium truncate">{item.label}</span>
                )}
                {!collapsed && navItem.badge !== undefined && navItem.badge > 0 && (
                  <span
                    className="absolute right-3 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs font-medium text-white"
                    style={{ background: PINK }}
                  >
                    {navItem.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {/* View Site */}
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className={`relative flex h-11 w-full items-center rounded-md transition-all duration-200 ${
              collapsed ? "justify-center" : ""
            }`}
            style={{ color: "var(--nd-text-2)" }}
            title={collapsed ? "عرض الموقع" : undefined}
          >
            <div className="grid h-full w-12 shrink-0 place-content-center">
              <Monitor className="h-4 w-4" />
            </div>
            {!collapsed && <span className="flex-1 text-sm font-medium">عرض الموقع</span>}
          </a>
        </nav>

        {/* Account section (reference style) */}
        {!collapsed && (
          <div className="shrink-0 border-t pt-3 space-y-1 px-2" style={{ borderColor: "var(--nd-border)" }}>
            <p
              className="px-3 py-1 text-[11px] font-bold uppercase tracking-wide"
              style={{ color: "var(--nd-text-3)" }}
            >
              الحساب
            </p>
            <NavLink
              to={`/${ADMIN_PATH}/settings`}
              onClick={onClose}
              className={({ isActive }) =>
                `relative flex h-11 w-full items-center rounded-md transition-all duration-200`
              }
              style={({ isActive }) => ({
                background: isActive ? "var(--nd-primary-100)" : "transparent",
                color: isActive ? PINK : "var(--nd-text-2)",
                borderInlineStart: isActive ? "2px solid " + PINK : "2px solid transparent",
              })}
            >
              <div className="grid h-full w-12 shrink-0 place-content-center">
                <Settings className="h-4 w-4" />
              </div>
              <span className="flex-1 text-sm font-medium">الإعدادات</span>
            </NavLink>
            <button
              onClick={() => setConfirmLogout(true)}
              className="relative flex h-11 w-full items-center rounded-md transition-all duration-200"
              style={{ color: "var(--nd-text-2)" }}
            >
              <div className="grid h-full w-12 shrink-0 place-content-center">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="flex-1 text-sm font-medium">تسجيل الخروج</span>
            </button>
          </div>
        )}

        {/* Collapse toggle (reference style, bottom) */}
        {!open && (
          <button
            onClick={onToggleCollapse}
            className="shrink-0 flex w-full items-center transition-colors hover:bg-gray-50"
            style={{ borderTop: "1px solid var(--nd-border)" }}
            title={collapsed ? "توسيع" : "طي"}
          >
            <div className="grid size-12 shrink-0 place-content-center">
              <ChevronsLeft
                className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
                style={{ color: "var(--nd-text-3)" }}
              />
            </div>
            {!collapsed && (
              <span className="text-sm font-medium" style={{ color: "var(--nd-text-2)" }}>
                طي
              </span>
            )}
          </button>
        )}

        {/* Logout confirmation */}
        {confirmLogout && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center p-4"
            style={{ background: "rgba(255,255,255,0.95)" }}
          >
            <div className="text-center">
              <p className="text-sm font-bold mb-1" style={{ color: "var(--nd-text)" }}>تسجيل الخروج؟</p>
              <p className="text-[12px] mb-3" style={{ color: "var(--nd-text-3)" }}>ستحتاج كلمة المرور للدخول مجدداً</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-lg text-white text-[12px] font-bold"
                  style={{ background: "#DC2626" }}
                >
                  نعم، خروج
                </button>
                <button
                  onClick={() => setConfirmLogout(false)}
                  className="px-4 py-2 rounded-lg text-[12px] font-bold"
                  style={{ background: "var(--nd-bg)", color: "var(--nd-text-2)" }}
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

export default Sidebar;
