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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearPassword } from "../lib/api";

const NAV = [
  { to: "/admin", label: "لوحة القيادة", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "الطلبات", icon: ShoppingBag },
  { to: "/admin/products", label: "المنتجات", icon: Package },
  { to: "/admin/analytics", label: "التحليلات", icon: BarChart3 },
  { to: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export function Sidebar({
  open,
  onClose,
  pendingCount,
}: {
  open: boolean;
  onClose: () => void;
  pendingCount: number;
}) {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);

  const logout = () => {
    clearPassword();
    navigate("/admin/login", { replace: true });
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden admin-no-print"
          style={{ background: "rgba(16,24,40,0.45)" }}
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "admin-no-print fixed lg:sticky top-0 z-50 h-screen shrink-0 flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
        style={{
          width: "var(--ad-sidebar-w)",
          background: "var(--ad-sidebar)",
          borderInlineStart: "1px solid var(--ad-border)",
          insetInlineEnd: 0,
        }}
      >
        {/* Brand */}
        <div className="flex items-center justify-between gap-2 px-6 h-[76px] shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-[10px] grid place-items-center text-white font-extrabold text-[15px]"
              style={{ background: "var(--ad-brand)" }}
            >
              N
            </div>
            <div className="leading-tight">
              <p className="text-[17px] font-extrabold" style={{ color: "var(--ad-text)" }}>
                Nadine
              </p>
              <p className="text-[11px]" style={{ color: "var(--ad-text-3)" }}>
                لوحة الإدارة
              </p>
            </div>
          </div>
          <button
            className="lg:hidden p-1.5 rounded-md"
            onClick={onClose}
            aria-label="إغلاق القائمة"
            style={{ color: "var(--ad-text-3)" }}
          >
            <X size={18} />
          </button>
        </div>

        <p
          className="px-6 pb-2 text-[11px] font-bold tracking-widest"
          style={{ color: "var(--ad-text-4)" }}
        >
          القائمة الرئيسية
        </p>

        <nav className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 h-[46px] px-3.5 rounded-[var(--ad-r-md)] text-[14px] font-bold transition-colors"
                )
              }
              style={({ isActive }) =>
                isActive
                  ? { background: "var(--ad-brand)", color: "#fff" }
                  : { color: "var(--ad-text-2)" }
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={19} />
                  <span className="flex-1">{item.label}</span>
                  {item.to === "/admin/orders" && pendingCount > 0 && (
                    <span
                      className="text-[11px] font-extrabold px-2 py-0.5 rounded-full tabular-nums"
                      style={
                        isActive
                          ? { background: "rgba(255,255,255,0.24)", color: "#fff" }
                          : { background: "var(--ad-brand-subtle)", color: "var(--ad-brand)" }
                      }
                    >
                      {pendingCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-5">
          {confirming ? (
            <div
              className="p-3 rounded-[var(--ad-r-md)] flex flex-col gap-2"
              style={{ background: "var(--ad-surface-2)" }}
            >
              <p className="text-[13px]" style={{ color: "var(--ad-text-2)" }}>
                تأكيد تسجيل الخروج؟
              </p>
              <div className="flex gap-2">
                <button
                  onClick={logout}
                  className="flex-1 h-9 rounded-[var(--ad-r-sm)] text-[13px] font-bold text-white"
                  style={{ background: "var(--ad-brand)" }}
                >
                  خروج
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  className="flex-1 h-9 rounded-[var(--ad-r-sm)] text-[13px] font-bold"
                  style={{ background: "#fff", border: "1px solid var(--ad-border-2)", color: "var(--ad-text-2)" }}
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="w-full flex items-center gap-3 h-[46px] px-3.5 rounded-[var(--ad-r-md)] text-[14px] font-bold transition-colors"
              style={{ color: "var(--ad-text-3)" }}
            >
              <LogOut size={19} />
              تسجيل الخروج
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
