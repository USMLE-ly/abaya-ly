import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ShoppingBag,
  AlertTriangle,
} from "lucide-react";
import { useOrders } from "../lib/metrics";
import { useQuery } from "@tanstack/react-query";
import { fetchCoupons } from "../lib/api";
import {
  ACard,
  AButton,
  AInput,
  ASelect,
  StatusBadge,
  ASkeleton,
  AEmpty,
} from "../components/ui";
import {
  fmtDate, fmtDateTime, STATUS_LIST, statusMeta, checkCoupon, COUPON_STATUS_META,
  type Order, type AdminCoupon, type CouponCheck,
} from "../lib/types";

type SortKey = "createdAt" | "updatedAt" | "orderId" | "location" | "status";
const PAGE_SIZE = 12;

export default function Orders() {
  const { data, isLoading, error } = useOrders();
  const { data: coupons } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: fetchCoupons,
    staleTime: 60_000,
  });
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const status = params.get("status") ?? "";
  const orders = data ?? [];

  const couponMap = useMemo(() => {
    const map: Record<string, AdminCoupon> = {};
    for (const c of coupons ?? []) map[c.code.toLowerCase()] = c;
    return map;
  }, [coupons]);

  const cities = useMemo(
    () => [...new Set(orders.map((o) => o.location).filter(Boolean))].sort(),
    [orders]
  );

  // Real statuses present in the data (canonical order first, extras after)
  const statusCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const o of orders) counts.set(o.status, (counts.get(o.status) || 0) + 1);
    return counts;
  }, [orders]);

  const realStatuses = useMemo(() => {
    const extras = [...statusCounts.keys()].filter((s) => !STATUS_LIST.some((m) => m.id === s));
    return [...STATUS_LIST.map((m) => m.id), ...extras];
  }, [statusCounts]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = orders.filter((o) => {
      if (status && o.status !== status) return false;
      if (city && o.location !== city) return false;
      if (!term) return true;
      return [o.orderId, o.phone, o.name, o.code, o.location, o.color, o.size]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
    list = [...list].sort((a, b) => {
      const av = String(a[sortKey] ?? "");
      const bv = String(b[sortKey] ?? "");
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });
    return list;
  }, [orders, q, status, city, sortKey, sortDir]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const toggleSort = (k: SortKey) => {
    if (k === sortKey) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("desc");
    }
  };

  const toggleAll = () => {
    if (slice.every((o) => selected.has(o.orderId))) {
      const next = new Set(selected);
      slice.forEach((o) => next.delete(o.orderId));
      setSelected(next);
    } else {
      setSelected(new Set([...selected, ...slice.map((o) => o.orderId)]));
    }
  };

  const exportCsv = () => {
    const rows = (selected.size ? filtered.filter((o) => selected.has(o.orderId)) : filtered);
    const head = [
      "رقم الطلب","الكود","المنتج","اللون","المقاس","العميل","الهاتف","المدينة","الكوبون","الحالة","تاريخ الإنشاء","آخر تحديث",
    ];
    const csv = [
      head.join(","),
      ...rows.map((o) =>
        [o.orderId, o.code, o.name, o.color, o.size, o.phone, o.phone, o.location, o.couponCode || "", o.statusLabel, o.createdAt, o.updatedAt]
          .map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nadine-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <ASkeleton className="h-16" />
        <ASkeleton className="h-[520px]" />
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

  const th = "px-4 py-3.5 text-[12.5px] font-extrabold whitespace-nowrap text-start";
  const td = "px-4 py-3.5 text-[13.5px] whitespace-nowrap";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1
            className="text-[26px] sm:text-[30px] font-extrabold leading-tight"
            style={{ color: "var(--nd-text)", letterSpacing: "-0.025em" }}
          >
            الطلبات
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--nd-text-3)" }}>
            {filtered.length} طلب
            {selected.size > 0 && ` · ${selected.size} محدد`}
          </p>
        </div>
        <AButton variant="solid" size="sm" icon={<Download size={15} />} onClick={exportCsv}>
          تصدير CSV
        </AButton>
      </div>

      {/* Filters */}
      <ACard className="p-4 flex flex-col sm:flex-row gap-3">
        <AInput
          className="flex-1"
          icon={<Search size={16} />}
          placeholder="بحث برقم الطلب، الهاتف، المنتج، المدينة…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
        <ASelect
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setPage(1);
          }}
        >
          <option value="">كل المدن</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </ASelect>
      </ACard>

      {/* Status chips — reflects the real statuses in the data */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setParams({}); setPage(1); }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] font-bold transition-all"
          style={{
            background: !status ? "var(--nd-primary-500)" : "var(--nd-white)",
            color: !status ? "#fff" : "var(--nd-text-2)",
            border: "1px solid var(--nd-border)",
            boxShadow: !status ? "0 4px 12px rgba(206,44,96,0.25)" : "none",
          }}
        >
          الكل
          <span
            className="px-1.5 py-0.5 rounded-full text-[10.5px] tabular-nums"
            style={{ background: !status ? "rgba(255,255,255,0.22)" : "var(--nd-bg)" }}
          >
            {orders.length}
          </span>
        </button>
        {realStatuses.map((s) => {
          const meta = statusMeta(s);
          const active = status === s;
          return (
            <button
              key={s}
              onClick={() => { setParams({ status: s }); setPage(1); }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12.5px] font-bold transition-all hover:brightness-[0.98] active:scale-[0.98]"
              style={{
                background: active ? meta.color : "var(--nd-white)",
                color: active ? "#fff" : "var(--nd-text-2)",
                border: `1px solid ${active ? meta.color : "var(--nd-border)"}`,
                boxShadow: active ? `0 4px 12px ${meta.color}40` : "none",
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: active ? "#fff" : meta.color }}
              />
              {meta.label}
              <span
                className="px-1.5 py-0.5 rounded-full text-[10.5px] tabular-nums"
                style={{ background: active ? "rgba(255,255,255,0.22)" : "var(--nd-bg)" }}
              >
                {statusCounts.get(s) || 0}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <ACard>
          <AEmpty icon={<ShoppingBag size={34} />} title="لا توجد طلبات مطابقة" hint="جرّبي تعديل الفلاتر" />
        </ACard>
      ) : (
        <>
          {/* Desktop table */}
          <ACard className="hidden lg:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr style={{ background: "var(--nd-bg)", color: "var(--nd-text-2)" }}>
                    <th className="px-4 py-3.5 w-10">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-[var(--nd-primary-500)] cursor-pointer"
                        checked={slice.length > 0 && slice.every((o) => selected.has(o.orderId))}
                        onChange={toggleAll}
                      />
                    </th>
                    <SortTh label="رقم الطلب" k="orderId" active={sortKey} dir={sortDir} onClick={toggleSort} cls={th} />
                    <th className={th}>الهاتف</th>
                    <SortTh label="المدينة" k="location" active={sortKey} dir={sortDir} onClick={toggleSort} cls={th} />
                    <th className={th}>الكود</th>
                    <th className={th}>المنتج</th>
                    <th className={th}>الكوبون</th>
                    <th className={th}>اللون</th>
                    <th className={th}>المقاس</th>
                    <SortTh label="الحالة" k="status" active={sortKey} dir={sortDir} onClick={toggleSort} cls={th} />
                    <SortTh label="التاريخ" k="createdAt" active={sortKey} dir={sortDir} onClick={toggleSort} cls={th} />
                    <SortTh label="آخر تحديث" k="updatedAt" active={sortKey} dir={sortDir} onClick={toggleSort} cls={th} />
                    <th className={th}>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {slice.map((o) => (
                    <tr
                      key={o.orderId}
                      className="hover:bg-[var(--nd-bg)] transition-colors"
                      style={{ borderTop: "1px solid var(--nd-border)" }}
                    >
                      <td className="px-4">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[var(--nd-primary-500)] cursor-pointer"
                          checked={selected.has(o.orderId)}
                          onChange={() => {
                            const next = new Set(selected);
                            next.has(o.orderId) ? next.delete(o.orderId) : next.add(o.orderId);
                            setSelected(next);
                          }}
                        />
                      </td>
                      <td className={td}>
                        <Link
                          to={`/admin/orders/${o.orderId}`}
                          className="font-extrabold"
                          style={{ color: "var(--nd-primary-500)" }}
                        >
                          {o.orderId}
                        </Link>
                      </td>
                      <td className={td} style={{ color: "var(--nd-text-2)", direction: "ltr", textAlign: "right" }}>
                        {o.phone}
                      </td>
                      <td className={td} style={{ color: "var(--nd-text-2)" }}>{o.location || "—"}</td>
                      <td className={td} style={{ color: "var(--nd-text-3)" }}>{o.code}</td>
                      <td className={`${td} max-w-[220px] truncate`} style={{ color: "var(--nd-text)", fontWeight: 700 }}>
                        {o.name}
                      </td>
                      <td className={td}><CouponCell order={o} couponMap={couponMap} /></td>
                      <td className={td} style={{ color: "var(--nd-text-2)" }}>{o.color || "—"}</td>
                      <td className={td} style={{ color: "var(--nd-text-2)" }}>{o.size || "—"}</td>
                      <td className={td}><StatusBadge status={o.status} size="sm" /></td>
                      <td className={td} style={{ color: "var(--nd-text-3)" }}>{fmtDate(o.createdAt)}</td>
                      <td className={td} style={{ color: "var(--nd-text-3)" }}>{fmtDateTime(o.updatedAt)}</td>
                      <td className={td}>
                        <Link to={`/admin/orders/${o.orderId}`}>
                          <AButton size="xs">تفاصيل</AButton>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ACard>

          {/* Mobile / tablet cards (390px + 800px frames) */}
          <div className="lg:hidden flex flex-col gap-3">
            {slice.map((o) => (
              <MobileOrderCard key={o.orderId} order={o} couponMap={couponMap} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between gap-3">
            <p className="text-[13px]" style={{ color: "var(--nd-text-3)" }}>
              صفحة {current} من {pages}
            </p>
            <div className="flex items-center gap-2">
              <AButton
                size="sm"
                disabled={current <= 1}
                onClick={() => setPage(current - 1)}
                icon={<ChevronRight size={15} />}
              >
                السابق
              </AButton>
              <AButton
                size="sm"
                disabled={current >= pages}
                onClick={() => setPage(current + 1)}
              >
                التالي
                <ChevronLeft size={15} />
              </AButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SortTh({
  label,
  k,
  active,
  dir,
  onClick,
  cls,
}: {
  label: string;
  k: SortKey;
  active: SortKey;
  dir: "asc" | "desc";
  onClick: (k: SortKey) => void;
  cls: string;
}) {
  return (
    <th className={cls}>
      <button
        onClick={() => onClick(k)}
        className="inline-flex items-center gap-1"
        style={{ color: active === k ? "var(--nd-primary-500)" : "inherit" }}
      >
        {label}
        <ArrowUpDown size={12} className={active === k && dir === "asc" ? "rotate-180" : ""} />
      </button>
    </th>
  );
}

function MobileOrderCard({ order: o, couponMap }: { order: Order; couponMap: Record<string, AdminCoupon> }) {
  return (
    <Link to={`/admin/orders/${o.orderId}`}>
      <ACard className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="min-w-0">
            <p className="text-[14.5px] font-extrabold truncate" style={{ color: "var(--nd-text)" }}>
              {o.name}
            </p>
            <p className="text-[12.5px] font-bold" style={{ color: "var(--nd-primary-500)" }}>
              {o.orderId}
            </p>
          </div>
          <StatusBadge status={o.status} size="sm" />
        </div>
        <div className="grid grid-cols-2 gap-y-1.5 text-[12.5px]" style={{ color: "var(--nd-text-2)" }}>
          <span>📞 <span style={{ direction: "ltr", display: "inline-block" }}>{o.phone}</span></span>
          <span>📍 {o.location || "—"}</span>
          <span>🎨 {o.color || "—"}</span>
          <span>📏 {o.size || "—"}</span>
        </div>
        <CouponCell order={o} couponMap={couponMap} />
        <p className="text-[11.5px] mt-2.5 pt-2.5" style={{ color: "var(--nd-text-3)", borderTop: "1px solid var(--nd-border)" }}>
          {fmtDateTime(o.createdAt)}
        </p>
      </ACard>
    </Link>
  );
}

function CouponCell({
  order,
  couponMap,
}: {
  order: Order;
  couponMap: Record<string, AdminCoupon>;
}) {
  const check: CouponCheck | null = checkCoupon(order.couponCode, couponMap);
  if (!check) return <span style={{ color: "var(--nd-text-4)" }}>—</span>;
  const meta = COUPON_STATUS_META[check.status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-bold whitespace-nowrap px-2.5 py-1 text-[11px]"
      style={{ background: meta.bg, color: meta.color }}
      title={`${order.couponCode} — ${meta.label}`}
    >
      <span dir="ltr" className="tabular-nums">{order.couponCode}</span>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
      {meta.label}
    </span>
  );
}
