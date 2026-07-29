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
import {
  ACard,
  AButton,
  AInput,
  ASelect,
  StatusBadge,
  ASkeleton,
  AEmpty,
} from "../components/ui";
import { fmtDate, fmtDateTime, STATUS_LIST, type Order } from "../lib/types";

type SortKey = "createdAt" | "updatedAt" | "orderId" | "location" | "status";
const PAGE_SIZE = 12;

export default function Orders() {
  const { data, isLoading, error } = useOrders();
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const status = params.get("status") ?? "";
  const orders = data ?? [];

  const cities = useMemo(
    () => [...new Set(orders.map((o) => o.location).filter(Boolean))].sort(),
    [orders]
  );

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
      "رقم الطلب","الكود","المنتج","اللون","المقاس","العميل","الهاتف","المدينة","الحالة","تاريخ الإنشاء","آخر تحديث",
    ];
    const csv = [
      head.join(","),
      ...rows.map((o) =>
        [o.orderId, o.code, o.name, o.color, o.size, o.phone, o.phone, o.location, o.statusLabel, o.createdAt, o.updatedAt]
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
          value={status}
          onChange={(e) => {
            const v = e.target.value;
            setParams(v ? { status: v } : {});
            setPage(1);
          }}
        >
          <option value="">كل الحالات</option>
          {STATUS_LIST.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </ASelect>
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
              <MobileOrderCard key={o.orderId} order={o} />
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

function MobileOrderCard({ order: o }: { order: Order }) {
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
        <p className="text-[11.5px] mt-2.5 pt-2.5" style={{ color: "var(--nd-text-3)", borderTop: "1px solid var(--nd-border)" }}>
          {fmtDateTime(o.createdAt)}
        </p>
      </ACard>
    </Link>
  );
}
