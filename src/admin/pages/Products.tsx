import { useState, useMemo } from "react";
import { Search, Package, Grid3X3, List } from "lucide-react";
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
import { fmtDate } from "../lib/types";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  collection: string;
  model: string;
  inStock: boolean;
  rating: number;
}

const PAGE_SIZE = 12;

export default function Products() {
  const [q, setQ] = useState("");
  const [collection, setCollection] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  const { data: orders } = useOrders();
  const orderCounts = useMemo(() => {
    const map: Record<string, number> = {};
    orders?.forEach((o) => { map[o.code] = (map[o.code] || 0) + 1; });
    return map;
  }, [orders]);

  // Load products from localStorage or fetch from data file
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const stored = sessionStorage.getItem("admin_products");
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  const [loading, setLoading] = useState(!products.length);

  // Fetch products from the app's data file
  useState(() => {
    if (products.length) return;
    // Dynamic import to avoid bundling issues
    import("@/data/products").then((mod) => {
      const list = (mod.products || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        images: p.images || [],
        colors: p.colors || [],
        sizes: p.sizes || [],
        collection: p.collection || "",
        model: p.model || "",
        inStock: p.inStock !== false,
        rating: p.rating || 0,
      }));
      setProducts(list);
      sessionStorage.setItem("admin_products", JSON.stringify(list));
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  });

  const collections = useMemo(
    () => [...new Set(products.map((p) => p.collection).filter(Boolean))].sort(),
    [products]
  );

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let list = products.filter((p) => {
      if (collection && p.collection !== collection) return false;
      if (!term) return true;
      return [p.id, p.name, p.collection, p.model].join(" ").toLowerCase().includes(term);
    });
    return list;
  }, [products, q, collection]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <ASkeleton className="h-16" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ASkeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] sm:text-[30px] font-extrabold leading-tight" style={{ color: "var(--nd-text)" }}>
            المنتجات
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--nd-text-3)" }}>
            {products.length} منتج
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AButton
            variant={view === "grid" ? "solid" : "default"}
            size="xs"
            icon={<Grid3X3 size={14} />}
            onClick={() => setView("grid")}
          />
          <AButton
            variant={view === "list" ? "solid" : "default"}
            size="xs"
            icon={<List size={14} />}
            onClick={() => setView("list")}
          />
        </div>
      </div>

      {/* Filters */}
      <ACard className="p-4 flex flex-col sm:flex-row gap-3">
        <AInput
          className="flex-1"
          icon={<Search size={15} />}
          placeholder="بحث عن منتج..."
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
        />
        <ASelect
          value={collection}
          onChange={(e) => { setCollection(e.target.value); setPage(1); }}
          className="sm:w-44"
        >
          <option value="">كل المجموعات</option>
          {collections.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </ASelect>
      </ACard>

      {/* Products grid/list */}
      {slice.length === 0 ? (
        <ACard className="p-8">
          <AEmpty icon={<Package size={34} />} title="لا توجد منتجات" hint="حاول تغيير معايير البحث" />
        </ACard>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {slice.map((p) => (
            <ACard key={p.id} className="p-3 overflow-hidden">
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-sunken mb-3">
                {p.images[0] ? (
                  <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--nd-text-4)" }}>
                    <Package size={24} />
                  </div>
                )}
              </div>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--nd-text-4)" }}>
                {p.collection || p.model}
              </p>
              <p className="text-[13px] font-bold mt-0.5 truncate" style={{ color: "var(--nd-text)" }}>
                {p.name.split(" • ").slice(-2).join(" • ")}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[14px] font-extrabold" style={{ color: "var(--nd-primary-500)" }}>
                  {p.price} د.ل
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{
                  background: p.inStock ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                  color: p.inStock ? "#16a34a" : "#dc2626",
                }}>
                  {p.inStock ? "متوفر" : "غير متوفر"}
                </span>
              </div>
              {orderCounts[p.id] > 0 && (
                <p className="text-[10px] mt-1" style={{ color: "var(--nd-text-4)" }}>
                  {orderCounts[p.id]} طلب
                </p>
              )}
            </ACard>
          ))}
        </div>
      ) : (
        /* List view */
        <ACard className="overflow-hidden">
          <div className="divide-y" style={{ borderColor: "var(--nd-border)" }}>
            {slice.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-5 py-3">
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-sunken flex-shrink-0">
                  {p.images[0] ? (
                    <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--nd-text-4)" }}>
                      <Package size={16} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold truncate" style={{ color: "var(--nd-text)" }}>{p.name}</p>
                  <p className="text-[11px]" style={{ color: "var(--nd-text-4)" }}>{p.collection} · {p.model}</p>
                </div>
                <span className="text-[13px] font-extrabold" style={{ color: "var(--nd-primary-500)" }}>{p.price} د.ل</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{
                  background: p.inStock ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                  color: p.inStock ? "#16a34a" : "#dc2626",
                }}>
                  {p.inStock ? "متوفر" : "غير متوفر"}
                </span>
              </div>
            ))}
          </div>
        </ACard>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between" style={{ color: "var(--nd-text-3)" }}>
          <span className="text-[13px]">
            صفحة {current} من {pages} · {filtered.length} منتج
          </span>
          <div className="flex gap-2">
            <AButton variant="default" size="xs" disabled={current <= 1} onClick={() => setPage(current - 1)}>
              السابق
            </AButton>
            <AButton variant="default" size="xs" disabled={current >= pages} onClick={() => setPage(current + 1)}>
              التالي
            </AButton>
          </div>
        </div>
      )}
    </div>
  );
}
