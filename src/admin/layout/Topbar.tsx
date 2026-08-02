import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Bell, ChevronDown, RefreshCw } from "lucide-react";
import { useOrders } from "../lib/metrics";
import { ADMIN_PATH } from "../lib/config";

export function Topbar({
  onMenu,
  onCollapse,
  collapsed,
  onRefresh,
  refreshing,
}: {
  onMenu: () => void;
  onCollapse?: () => void;
  collapsed?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const navigate = useNavigate();
  const { data: orders } = useOrders();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const pendingOrders = orders?.filter((o) => o.status === "pending") || [];
  const recentOrders = orders?.slice(0, 5) || [];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    if (showNotif) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showNotif]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    if (searchOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [searchOpen]);

  return (
    <header
      className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 sticky top-0 z-30"
      style={{
        background: "var(--nd-white)",
        borderBottom: "1px solid var(--nd-border)",
      }}
    >
      {/* Left side */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenu}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          style={{ color: "var(--nd-text-2)" }}
        >
          <Menu size={20} />
        </button>
        <button
          onClick={onCollapse}
          className="hidden lg:flex p-2 rounded-lg hover:bg-gray-100 transition-colors"
          style={{ color: "var(--nd-text-2)" }}
          title={collapsed ? "توسيع القائمة" : "طي القائمة"}
        >
          <Menu size={18} />
        </button>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-md">
        {searchOpen ? (
          <div className="relative">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--nd-text-3)" }} />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onBlur={() => !searchQuery && setSearchOpen(false)}
              placeholder="بحث في الطلبات..."
              className="w-full h-10 px-10 rounded-xl text-[13px] outline-none transition-all"
              style={{
                background: "var(--nd-bg)",
                border: "1px solid var(--nd-border)",
                color: "var(--nd-text)",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  navigate(`/${ADMIN_PATH}/orders?q=${encodeURIComponent(searchQuery.trim())}`);
                  setSearchOpen(false);
                  setSearchQuery("");
                }
              }}
            />
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-xl text-[13px] w-full max-w-xs transition-colors"
            style={{
              background: "var(--nd-bg)",
              border: "1px solid var(--nd-border)",
              color: "var(--nd-text-3)",
            }}
          >
            <Search size={15} />
            <span>بحث في الطلبات...</span>
          </button>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Refresh */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "var(--nd-text-3)" }}
          >
            <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
          </button>
        )}

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            className="p-2 rounded-lg transition-colors relative"
            style={{ color: "var(--nd-text-2)" }}
          >
            <Bell size={18} />
            {pendingOrders.length > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                style={{ background: "var(--nd-primary-500)" }}
              >
                {pendingOrders.length}
              </span>
            )}
          </button>

          {showNotif && (
            <div
              className="absolute top-full mt-2 left-0 w-80 rounded-2xl overflow-hidden z-50 shadow-lg"
              style={{
                background: "var(--nd-white)",
                border: "1px solid var(--nd-border)",
              }}
            >
              <div className="p-4 border-b" style={{ borderColor: "var(--nd-border)" }}>
                <p className="text-[13px] font-bold" style={{ color: "var(--nd-text)" }}>
                  الإشعارات
                </p>
              </div>
              {pendingOrders.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-[12px]" style={{ color: "var(--nd-text-3)" }}>لا توجد إشعارات جديدة</p>
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  {pendingOrders.slice(0, 5).map((order) => (
                    <button
                      key={order.orderId}
                      onClick={() => { navigate(`/${ADMIN_PATH}/orders/${order.orderId}`); setShowNotif(false); }}
                      className="w-full flex items-start gap-3 p-3 hover:bg-gray-50 transition-colors text-right"
                    >
                      <div
                        className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                        style={{ background: "#F5A524" }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-semibold truncate" style={{ color: "var(--nd-text)" }}>
                          {order.orderId}
                        </p>
                        <p className="text-[10px]" style={{ color: "var(--nd-text-3)" }}>
                          {order.name?.split(" • ").slice(-1)} — {order.location}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl cursor-pointer transition-colors hover:bg-gray-50"
          onClick={() => navigate(`/${ADMIN_PATH}/settings`)}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: "var(--nd-primary-500)" }}
          >
            A
          </div>
          <div className="hidden sm:block">
            <p className="text-[12px] font-bold" style={{ color: "var(--nd-text)" }}>Admin</p>
            <p className="text-[9px]" style={{ color: "var(--nd-text-3)" }}>مدير المتجر</p>
          </div>
          <ChevronDown size={14} style={{ color: "var(--nd-text-3)" }} />
        </div>
      </div>
    </header>
  );
}
