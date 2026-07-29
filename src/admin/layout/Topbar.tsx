import { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, Search, Bell, AlertTriangle, RefreshCw } from "lucide-react";
import { type Order, relativeAr } from "../lib/types";
import { StatusBadge } from "../components/ui";

export function Topbar({
  onMenu,
  orders,
  onRefresh,
  refreshing,
}: {
  onMenu: () => void;
  orders: Order[];
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [openSearch, setOpenSearch] = useState(false);
  const [openBell, setOpenBell] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) {
        setOpenSearch(false);
        setOpenBell(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    return orders
      .filter((o) =>
        [o.orderId, o.phone, o.name, o.code, o.location]
          .join(" ")
          .toLowerCase()
          .includes(term)
      )
      .slice(0, 6);
  }, [q, orders]);

  const alerts = useMemo(() => {
    const stale = orders.filter(
      (o) =>
        o.status === "pending" &&
        (Date.now() - new Date(o.createdAt).getTime()) / 36e5 > 24
    );
    const recent = [...orders]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 4);
    return { stale, recent };
  }, [orders]);

  const alertCount = alerts.stale.length;

  return (
    <header
      ref={wrap}
      className="admin-no-print sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 h-[76px] shrink-0"
      style={{
        background: "rgba(255,255,255,0.82)",
        backdropFilter: "blur(14px)",
        borderBottom: "1px solid var(--ad-border)",
      }}
    >
      <button
        onClick={onMenu}
        className="lg:hidden p-2 rounded-[var(--ad-r-sm)]"
        aria-label="فتح القائمة"
        style={{ color: "var(--ad-text-2)", border: "1px solid var(--ad-border-2)" }}
      >
        <Menu size={18} />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-[460px]">
        <div
          className="flex items-center gap-2 h-11 px-3.5 rounded-[var(--ad-r-md)]"
          style={{ background: "var(--ad-surface-2)", border: "1px solid transparent" }}
        >
          <Search size={17} style={{ color: "var(--ad-text-4)" }} />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpenSearch(true);
            }}
            onFocus={() => setOpenSearch(true)}
            placeholder="ابحث برقم الطلب أو الهاتف أو المنتج…"
            className="flex-1 min-w-0 bg-transparent outline-none text-[14px]"
            style={{ color: "var(--ad-text)" }}
          />
        </div>
        {openSearch && q.trim() && (
          <div
            className="absolute top-[52px] inset-x-0 rounded-[var(--ad-r-md)] overflow-hidden z-50"
            style={{
              background: "var(--ad-surface)",
              border: "1px solid var(--ad-border)",
              boxShadow: "var(--ad-e3)",
            }}
          >
            {results.length === 0 ? (
              <p className="p-4 text-[13px]" style={{ color: "var(--ad-text-3)" }}>
                لا توجد نتائج
              </p>
            ) : (
              results.map((o) => (
                <button
                  key={o.orderId}
                  onClick={() => {
                    navigate(`/admin/orders/${o.orderId}`);
                    setQ("");
                    setOpenSearch(false);
                  }}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 text-start hover:bg-[var(--ad-surface-2)] transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold truncate" style={{ color: "var(--ad-text)" }}>
                      {o.orderId} · {o.name}
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--ad-text-3)" }}>
                      {o.phone} — {o.location}
                    </p>
                  </div>
                  <StatusBadge status={o.status} size="sm" />
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex-1" />

      <button
        onClick={onRefresh}
        className="p-2.5 rounded-[var(--ad-r-md)] transition-colors"
        aria-label="تحديث"
        style={{ color: "var(--ad-text-2)", border: "1px solid var(--ad-border-2)" }}
      >
        <RefreshCw size={17} className={refreshing ? "animate-spin" : ""} />
      </button>

      {/* Notifications */}
      <div className="relative">
        <button
          onClick={() => setOpenBell((v) => !v)}
          className="relative p-2.5 rounded-[var(--ad-r-md)]"
          aria-label="التنبيهات"
          style={{ color: "var(--ad-text-2)", border: "1px solid var(--ad-border-2)" }}
        >
          <Bell size={17} />
          {alertCount > 0 && (
            <span
              className="absolute -top-1.5 -end-1.5 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full text-[10px] font-extrabold text-white tabular-nums"
              style={{ background: "var(--ad-brand)" }}
            >
              {alertCount}
            </span>
          )}
        </button>
        {openBell && (
          <div
            className="absolute top-[52px] end-0 w-[320px] rounded-[var(--ad-r-md)] overflow-hidden z-50"
            style={{
              background: "var(--ad-surface)",
              border: "1px solid var(--ad-border)",
              boxShadow: "var(--ad-e3)",
            }}
          >
            <p
              className="px-4 py-3 text-[13px] font-extrabold"
              style={{ color: "var(--ad-text)", borderBottom: "1px solid var(--ad-border)" }}
            >
              التنبيهات
            </p>
            <div className="max-h-[380px] overflow-y-auto">
              {alerts.stale.map((o) => (
                <button
                  key={`s-${o.orderId}`}
                  onClick={() => {
                    navigate(`/admin/orders/${o.orderId}`);
                    setOpenBell(false);
                  }}
                  className="w-full flex items-start gap-2.5 px-4 py-3 text-start hover:bg-[var(--ad-surface-2)]"
                >
                  <AlertTriangle size={16} className="mt-0.5" style={{ color: "#B26A00" }} />
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold" style={{ color: "var(--ad-text)" }}>
                      {o.orderId} معلّق أكثر من ٢٤ ساعة
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--ad-text-3)" }}>
                      {relativeAr(o.createdAt)} — {o.location}
                    </p>
                  </div>
                </button>
              ))}
              {alerts.recent.map((o) => (
                <button
                  key={`r-${o.orderId}`}
                  onClick={() => {
                    navigate(`/admin/orders/${o.orderId}`);
                    setOpenBell(false);
                  }}
                  className="w-full flex items-start gap-2.5 px-4 py-3 text-start hover:bg-[var(--ad-surface-2)]"
                >
                  <span
                    className="mt-1.5 w-2 h-2 rounded-full shrink-0"
                    style={{ background: "var(--ad-brand)" }}
                  />
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold truncate" style={{ color: "var(--ad-text)" }}>
                      {o.name}
                    </p>
                    <p className="text-[12px]" style={{ color: "var(--ad-text-3)" }}>
                      {o.orderId} · {relativeAr(o.createdAt)}
                    </p>
                  </div>
                </button>
              ))}
              {alerts.stale.length === 0 && alerts.recent.length === 0 && (
                <p className="p-4 text-[13px]" style={{ color: "var(--ad-text-3)" }}>
                  لا توجد تنبيهات
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="hidden sm:flex items-center gap-2.5 ps-3" style={{ borderInlineStart: "1px solid var(--ad-border)" }}>
        <div
          className="w-9 h-9 rounded-full grid place-items-center text-[13px] font-extrabold"
          style={{ background: "var(--ad-brand-subtle)", color: "var(--ad-brand)" }}
        >
          ن
        </div>
        <div className="leading-tight">
          <p className="text-[13px] font-bold" style={{ color: "var(--ad-text)" }}>
            المديرة
          </p>
          <p className="text-[11px]" style={{ color: "var(--ad-text-3)" }}>
            Super Admin
          </p>
        </div>
      </div>
    </header>
  );
}
