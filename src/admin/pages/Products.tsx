import { useState, useEffect, useMemo } from "react";
import {
  Search, Package, Grid3X3, List, Plus, Edit3, Trash2,
  X, Check, Loader2, Save, Image,
} from "lucide-react";
import {
  ACard, AButton, AInput, ASelect, StatusBadge, ASkeleton, AEmpty,
} from "../components/ui";
import {
  fetchAdminProducts, createProduct, updateProduct, deleteProduct,
  type AdminProduct,
} from "../lib/api";

const COLLECTIONS = ["Noir Atelier", "Lumière", "Rouge Héritage", "Azure", "Botanique", "Maison d'Or"];
const CATEGORIES = ["السهرة", "الرسمية", "الكاجوال", "المطرّزة"];
const PAGE_SIZE = 12;

const EMPTY_FORM: Partial<AdminProduct> = {
  id: "", name: "", price: 0, collection: "", model: "", fabric: "",
  category: "", images: [], colors: [], sizes: ["S", "M", "L", "XL"],
  badge: "", description: "", details: [], highlights: [], tags: [],
};

export default function Products() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [collection, setCollection] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<AdminProduct>>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      // Fetch Edge Config products (custom/managed)
      const custom = await fetchAdminProducts().catch(() => []);
      // Load static products from data file
      const mod = await import("@/data/products").catch(() => null);
      const statics: AdminProduct[] = (mod?.products || []).map((p: any) => ({
        id: p.id, name: p.name, price: p.price, originalPrice: p.originalPrice,
        collection: p.collection || "", model: p.model || "",
        fabric: p.fabric || "", category: p.category || "",
        images: p.images || [], colors: p.colors || [], sizes: p.sizes || [],
        badge: p.badge || "", description: p.description || "",
        details: p.details || [], highlights: p.highlights || [], tags: p.tags || [],
        rating: p.rating || 0, reviewCount: p.reviewCount || 0, inStock: true,
      }));

      // Merge: Edge Config products override static ones by ID
      const merged = [...statics];
      for (const p of custom) {
        const idx = merged.findIndex((m) => m.id === p.id);
        if (idx >= 0) merged[idx] = p;
        else merged.push(p);
      }
      setProducts(merged);
    } catch (e) {
      setError("فشل تحميل المنتجات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

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

  const openNew = () => {
    setForm({ ...EMPTY_FORM });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (p: AdminProduct) => {
    setForm({ ...p });
    setEditing(p.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.id || !form.name) {
      setError("المعرف والاسم مطلوبان");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editing) {
        await updateProduct(editing, form);
      } else {
        await createProduct(form);
      }
      setShowForm(false);
      await load();
    } catch (e: any) {
      setError(e.message || "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    setError("");
    try {
      await deleteProduct(id);
      setDeleting(null);
      await load();
    } catch (e: any) {
      setError(e.message || "فشل الحذف");
      setDeleting(null);
    }
  };

  // Form field helpers
  const updateForm = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));
  const updateArray = (key: string, idx: number, value: string) => {
    const arr = [...((form as any)[key] || [])];
    arr[idx] = value;
    updateForm(key, arr);
  };
  const addArrayItem = (key: string, value: string = "") => {
    updateForm(key, [...((form as any)[key] || []), value]);
  };
  const removeArrayItem = (key: string, idx: number) => {
    const arr = [...((form as any)[key] || [])];
    arr.splice(idx, 1);
    updateForm(key, arr);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <ASkeleton className="h-16" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (<ASkeleton key={i} className="h-64" />))}
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
        <AButton variant="solid" size="md" icon={<Plus size={15} />} onClick={openNew}>
          إضافة منتج
        </AButton>
      </div>

      {error && (
        <div className="p-3 rounded-xl text-[13px] font-bold" style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626" }}>
          {error}
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowForm(false)}
        >
          <div className="w-full max-w-2xl rounded-2xl overflow-hidden"
            style={{ background: "var(--nd-white)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--nd-border)" }}>
              <h3 className="text-base font-bold" style={{ color: "var(--nd-text)" }}>
                {editing ? "تعديل المنتج" : "إضافة منتج جديد"}
              </h3>
              <button onClick={() => setShowForm(false)} style={{ color: "var(--nd-text-3)" }}>
                <X size={18} />
              </button>
            </div>

            <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>المعرف (ID)</p>
                  <AInput value={form.id || ""} onChange={(e: any) => updateForm("id", e.target.value)} placeholder="my-product-id" style={{ direction: "ltr" } as any} />
                </div>
                <div>
                  <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>الاسم</p>
                  <AInput value={form.name || ""} onChange={(e: any) => updateForm("name", e.target.value)} />
                </div>
                <div>
                  <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>السعر (د.ل)</p>
                  <AInput type="number" value={String(form.price || "")} onChange={(e: any) => updateForm("price", Number(e.target.value))} style={{ direction: "ltr" } as any} />
                </div>
                <div>
                  <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>السعر الأصلي</p>
                  <AInput type="number" value={String(form.originalPrice || "")} onChange={(e: any) => updateForm("originalPrice", Number(e.target.value))} style={{ direction: "ltr" } as any} />
                </div>
                <div>
                  <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>المجموعة</p>
                  <ASelect value={form.collection || ""} onChange={(e: any) => updateForm("collection", e.target.value)}>
                    <option value="">اختر المجموعة</option>
                    {COLLECTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </ASelect>
                </div>
                <div>
                  <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>الموديل</p>
                  <AInput value={form.model || ""} onChange={(e: any) => updateForm("model", e.target.value)} />
                </div>
                <div>
                  <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>القماش</p>
                  <AInput value={form.fabric || ""} onChange={(e: any) => updateForm("fabric", e.target.value)} />
                </div>
                <div>
                  <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>التصنيف</p>
                  <ASelect value={form.category || ""} onChange={(e: any) => updateForm("category", e.target.value)}>
                    <option value="">اختر التصنيف</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </ASelect>
                </div>
                <div>
                  <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>الوسام (Badge)</p>
                  <AInput value={form.badge || ""} onChange={(e: any) => updateForm("badge", e.target.value)} placeholder="جديد, حصري..." />
                </div>
              </div>

              {/* Images */}
              <div>
                <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>الصور (روابط)</p>
                <div className="space-y-2">
                  {(form.images || []).map((img, i) => (
                    <div key={i} className="flex gap-2">
                      <AInput value={img} onChange={(e: any) => updateArray("images", i, e.target.value)} style={{ direction: "ltr" } as any} />
                      <button onClick={() => removeArrayItem("images", i)} className="p-2 rounded-lg hover:bg-red-50" style={{ color: "var(--nd-text-3)" }}><X size={14} /></button>
                    </div>
                  ))}
                  <AButton variant="default" size="sm" icon={<Image size={13} />} onClick={() => addArrayItem("images", "/outfits/")}>
                    إضافة صورة
                  </AButton>
                </div>
              </div>

              {/* Colors */}
              <div>
                <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>الألوان</p>
                <div className="space-y-2">
                  {(form.colors || []).map((c, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input type="color" value={c.hex || "#000000"} onChange={(e) => { const arr = [...(form.colors || [])]; arr[i] = { ...arr[i], hex: e.target.value }; updateForm("colors", arr); }}
                        className="w-8 h-8 rounded-lg cursor-pointer border" style={{ borderColor: "var(--nd-border)" }} />
                      <AInput value={c.name || ""} onChange={(e: any) => { const arr = [...(form.colors || [])]; arr[i] = { ...arr[i], name: e.target.value }; updateForm("colors", arr); }} placeholder="اسم اللون" />
                      <button onClick={() => removeArrayItem("colors", i)} className="p-2 rounded-lg hover:bg-red-50" style={{ color: "var(--nd-text-3)" }}><X size={14} /></button>
                    </div>
                  ))}
                  <AButton variant="default" size="sm" onClick={() => updateForm("colors", [...(form.colors || []), { name: "", hex: "#c42855" }])}>
                    + إضافة لون
                  </AButton>
                </div>
              </div>

              {/* Description */}
              <div>
                <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>الوصف</p>
                <textarea
                  value={form.description || ""}
                  onChange={(e) => updateForm("description", e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none resize-none"
                  style={{ background: "var(--nd-bg)", border: "1px solid var(--nd-border)", color: "var(--nd-text)" }}
                />
              </div>

              {/* Highlights */}
              <div>
                <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>المميزات (Highlight)</p>
                <div className="space-y-2">
                  {(form.highlights || []).map((h, i) => (
                    <div key={i} className="flex gap-2">
                      <AInput value={h} onChange={(e: any) => updateArray("highlights", i, e.target.value)} />
                      <button onClick={() => removeArrayItem("highlights", i)} className="p-2 rounded-lg hover:bg-red-50" style={{ color: "var(--nd-text-3)" }}><X size={14} /></button>
                    </div>
                  ))}
                  <AButton variant="default" size="sm" onClick={() => addArrayItem("highlights", "")}>+ إضافة</AButton>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>المقاسات</p>
                <div className="flex flex-wrap gap-2">
                  {["XS", "S", "M", "L", "XL", "2XL", "3XL"].map((s) => {
                    const active = (form.sizes || []).includes(s);
                    return (
                      <button key={s} onClick={() => {
                        const sizes = form.sizes || [];
                        updateForm("sizes", active ? sizes.filter((x) => x !== s) : [...sizes, s]);
                      }}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                        style={{
                          background: active ? "var(--nd-primary-500)" : "var(--nd-bg)",
                          color: active ? "#fff" : "var(--nd-text-3)",
                          border: active ? "none" : "1px solid var(--nd-border)",
                        }}
                      >{s}</button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Form actions */}
            <div className="flex justify-end gap-2 p-5 border-t" style={{ borderColor: "var(--nd-border)" }}>
              <AButton variant="plain" onClick={() => setShowForm(false)}>إلغاء</AButton>
              <AButton variant="solid" icon={saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} onClick={handleSave} disabled={saving}>
                {saving ? "جاري الحفظ..." : editing ? "تحديث" : "إضافة"}
              </AButton>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--nd-text-3)" }} />
          <AInput value={q} onChange={(e: any) => { setQ(e.target.value); setPage(1); }}
            placeholder="بحث..." style={{ paddingRight: "2.25rem" } as any} />
        </div>
        <ASelect value={collection} onChange={(e: any) => { setCollection(e.target.value); setPage(1); }}>
          <option value="">كل المجموعات</option>
          {collections.map((c) => <option key={c} value={c}>{c}</option>)}
        </ASelect>
        <div className="flex rounded-lg overflow-hidden border" style={{ borderColor: "var(--nd-border)" }}>
          <button onClick={() => setView("grid")} className="p-2 transition-colors" style={{ background: view === "grid" ? "var(--nd-primary-100)" : "transparent", color: "var(--nd-text-3)" }}>
            <Grid3X3 size={16} />
          </button>
          <button onClick={() => setView("list")} className="p-2 transition-colors" style={{ background: view === "list" ? "var(--nd-primary-100)" : "transparent", color: "var(--nd-text-3)" }}>
            <List size={16} />
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <AEmpty title="لا توجد منتجات" hint={q || collection ? "جرب تغيير معايير البحث" : "لم يتم إضافة أي منتج بعد. اضغط إضافة منتج للبدء."} />
      ) : view === "grid" ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {slice.map((p) => (
              <ACard key={p.id} className="overflow-hidden group">
                <div className="relative aspect-[4/3] overflow-hidden" style={{ background: "var(--nd-bg)" }}>
                  {p.images?.[0] ? (
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={32} style={{ color: "var(--nd-text-3)" }} />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/90 backdrop-blur-sm hover:bg-white transition-all" style={{ color: "var(--nd-text-2)" }}>
                      <Edit3 size={14} />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/90 backdrop-blur-sm hover:bg-white transition-all" style={{ color: "#dc2626" }}>
                      {deleting === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  </div>
                  {p.badge && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold text-white" style={{ background: "var(--nd-primary-500)" }}>
                      {p.badge}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-[10px] font-bold" style={{ color: "var(--nd-primary-500)" }}>{p.collection}</p>
                  <p className="text-sm font-bold truncate" style={{ color: "var(--nd-text)" }}>{p.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-bold" style={{ color: "var(--nd-primary-500)" }}>{p.price} د.ل</span>
                    <span className="text-[10px]" style={{ color: "var(--nd-text-3)" }}>{p.id}</span>
                  </div>
                </div>
              </ACard>
            ))}
          </div>
          {pages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <AButton variant="plain" size="sm" disabled={current <= 1} onClick={() => setPage(current - 1)}>السابق</AButton>
              <span className="flex items-center px-3 text-xs" style={{ color: "var(--nd-text-3)" }}>{current} / {pages}</span>
              <AButton variant="plain" size="sm" disabled={current >= pages} onClick={() => setPage(current + 1)}>التالي</AButton>
            </div>
          )}
        </>
      ) : (
        /* List View */
        <ACard className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b" style={{ borderColor: "var(--nd-border)" }}>
                  <th className="p-3 font-bold" style={{ color: "var(--nd-text-3)" }}>ID</th>
                  <th className="p-3 font-bold" style={{ color: "var(--nd-text-3)" }}>الاسم</th>
                  <th className="p-3 font-bold" style={{ color: "var(--nd-text-3)" }}>المجموعة</th>
                  <th className="p-3 font-bold" style={{ color: "var(--nd-text-3)" }}>السعر</th>
                  <th className="p-3 font-bold" style={{ color: "var(--nd-text-3)" }}>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((p) => (
                  <tr key={p.id} className="border-b" style={{ borderColor: "var(--nd-border)" }}>
                    <td className="p-3 font-mono text-[11px]" style={{ color: "var(--nd-text-2)", direction: "ltr" }}>{p.id}</td>
                    <td className="p-3 font-semibold" style={{ color: "var(--nd-text)" }}>{p.name}</td>
                    <td className="p-3" style={{ color: "var(--nd-text-2)" }}>{p.collection}</td>
                    <td className="p-3 font-bold" style={{ color: "var(--nd-primary-500)" }}>{p.price} د.ل</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: "var(--nd-text-3)" }}>
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" style={{ color: "#dc2626" }}>
                          {deleting === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="flex justify-center gap-2 p-3 border-t" style={{ borderColor: "var(--nd-border)" }}>
              <AButton variant="plain" size="sm" disabled={current <= 1} onClick={() => setPage(current - 1)}>السابق</AButton>
              <span className="flex items-center px-3 text-xs" style={{ color: "var(--nd-text-3)" }}>{current} / {pages}</span>
              <AButton variant="plain" size="sm" disabled={current >= pages} onClick={() => setPage(current + 1)}>التالي</AButton>
            </div>
          )}
        </ACard>
      )}
    </div>
  );
}
