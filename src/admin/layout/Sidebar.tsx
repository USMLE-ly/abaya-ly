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
  ChevronLeft,
  Store,
  Star,
} from "lucide-react";
import { clearPassword } from "../lib/api";
import { ADMIN_PATH } from "../lib/config";

interface NavItem {
  to: string;
  label: string;
  icon: any;
  end?: boolean;
  badge?: number;
}

const NAV: NavItem[] = [
  { to: "/dashboard-nadine-admin", label: "لوحة القيادة", icon: LayoutDashboard, end: true },
  { to: "/dashboard-nadine-admin/orders", label: "الطلبات", icon: ShoppingBag, badge: 0 },
  { to: "/dashboard-nadine-admin/products", label: "المنتجات", icon: Package },
  { to: "/dashboard-nadine-admin/reviews", label: "التقييمات", icon: Star },
  { to: "/dashboard-nadine-admin/analytics", label: "التحليلات", icon: BarChart3 },
  { to: "/dashboard-nadine-admin/calendar", label: "تقويم الشحن", icon: Calendar },
  { to: "/dashboard-nadine-admin/settings", label: "الإعدادات", icon: Settings },
];

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

  // Mobile overlay: full sidebar
  // Desktop collapsed: icons only (80px)
  // Desktop expanded: full sidebar (280px)
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
        className="fixed lg:sticky top-0 h-screen z-50 flex flex-col overflow-hidden nd-sidebar transition-all duration-300 ease-out"
        style={{
          width: open ? 280 : collapsed ? 80 : 0,
          minWidth: open ? 280 : collapsed ? 80 : 0,
          background: "var(--nd-white)",
          borderLeft: "1px solid var(--nd-border)",
          insetInlineEnd: 0,
        }}
      >
        {/* Brand */}
        <div className="flex items-center justify-between h-16 shrink-0 border-b px-3" style={{ borderColor: "var(--nd-border)" }}>
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""}`}>
            <div
              className="w-9 h-9 rounded-xl grid place-items-center text-white font-bold text-sm shrink-0"
              style={{ background: "var(--nd-primary-500)" }}
            >
              N
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: "var(--nd-text)" }}>نادين</p>
                <p className="text-[10px] truncate" style={{ color: "var(--nd-text-3)" }}>لوحة الإدارة</p>
              </div>
            )}
          </div>
          {open && (
            <button onClick={onClose} className="lg:hidden p-1 rounded-lg" style={{ color: "var(--nd-text-3)" }}>
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {!collapsed && (
            <p className="text-[10px] font-bold uppercase tracking-widest px-3 pb-2 pt-2" style={{ color: "var(--nd-text-3)" }}>
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
                className={({ isActive }) =>
                  `flex items-center gap-3 h-11 rounded-xl text-[13px] font-bold transition-all duration-150 ${
                    collapsed ? "justify-center px-0 w-full" : "px-3.5"
                  } ${isActive ? "nd-nav-active" : ""}`
                }
                style={({ isActive }) => ({
                  background: isActive ? "var(--nd-primary-500)" : "transparent",
                  color: isActive ? "#fff" : "var(--nd-text-2)",
                })}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={18} className="shrink-0" />
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {!collapsed && item.badge !== undefined && item.badge > 0 && (
                  <span
                    className="text-[10px] font-extrabold px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
                  >
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        {!open && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex items-center justify-center h-10 mx-2 mb-1 rounded-xl transition-colors hover:bg-gray-100"
            style={{ color: "var(--nd-text-3)" }}
            title={collapsed ? "توسيع" : "طي"}
          >
            <ChevronLeft size={16} className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          </button>
        )}

        {/* User */}
        <div className="border-t shrink-0" style={{ borderColor: "var(--nd-border)" }}>
          <div className={`flex items-center ${collapsed ? "justify-center p-2" : "gap-3 px-3.5 py-2"}`}>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: "var(--nd-primary-200)", color: "var(--nd-primary-500)" }}
            >
              A
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold truncate" style={{ color: "var(--nd-text)" }}>Admin</p>
                  <p className="text-[10px] truncate" style={{ color: "var(--nd-text-3)" }}>admin@nadine.ly</p>
                </div>
                <button
                  onClick={() => setConfirmLogout(true)}
                  className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  style={{ color: "var(--nd-text-3)" }}
                >
                  <LogOut size={15} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Logout confirmation */}
        {confirmLogout && (
          <div
            className="absolute inset-0 z-10 flex items-center justify-center p-4"
            style={{ background: "rgba(255,255,255,0.95)" }}
          >
            <div className="text-center">
              <p className="text-sm font-bold mb-3" style={{ color: "var(--nd-text)" }}>تأكيد تسجيل الخروج؟</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={logout}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white"
                  style={{ background: "var(--nd-primary-500)" }}
                >
                  خروج
                </button>
                <button
                  onClick={() => setConfirmLogout(false)}
                  className="px-5 py-2 rounded-xl text-xs font-bold"
                  style={{ background: "var(--nd-bg)", color: "var(--nd-text-2)", border: "1px solid var(--nd-border)" }}
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
