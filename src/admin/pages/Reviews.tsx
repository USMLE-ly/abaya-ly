import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search, Star, Eye, Edit3, Trash2, X, Save, Loader2, AlertTriangle, MessageSquare, BadgeCheck,
} from "lucide-react";
import { ACard, ACardHeader, AButton, AInput, ASelect, ASkeleton, AEmpty } from "../components/ui";
import {
  fetchAllReviews, fetchAdminProducts, updateReview, deleteReview,
  type AdminReview,
} from "../lib/api";

const PAGE_SIZE = 10;

const shortName = (name: string) => name.split(" • ").slice(2).join(" • ") || name;

function Stars({ rating, size = 13 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          style={{
            color: i <= rating ? "#F5A524" : "var(--nd-border)",
            fill: i <= rating ? "#F5A524" : "transparent",
          }}
        />
      ))}
    </span>
  );
}

export default function Reviews() {
  const queryClient = useQueryClient();
  const { data: reviews, isLoading, error } = useQuery({
    queryKey: ["admin", "reviews"],
    queryFn: fetchAllReviews,
  });

  // Product name lookup: static catalog + Edge Config managed products
  const { data: customProducts } = useQuery({
    queryKey: ["admin", "products-map"],
    queryFn: fetchAdminProducts,
    staleTime: 60_000,
  });
  const [staticProducts, setStaticProducts] = useState<any[]>([]);
  useEffect(() => {
    let alive = true;
    import("@/data/products")
      .then((mod) => { if (alive) setStaticProducts(mod.products || []); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const productNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of staticProducts) map[p.id] = shortName(p.name);
    for (const p of customProducts ?? []) map[p.id] = shortName(p.name);
    return map;
  }, [staticProducts, customProducts]);

  const [q, setQ] = useState("");
  const [rating, setRating] = useState("");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<AdminReview | null>(null);
  const [editing, setEditing] = useState<AdminReview | null>(null);
  const [deleting, setDeleting] = useState<AdminReview | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editName, setEditName] = useState("");
  const [editComment, setEditComment] = useState("");
  const [editImage, setEditImage] = useState("");
  const [editVerified, setEditVerified] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const flash = (type: "ok" | "err", text: string) => {
    setMsg({ type, text });
    window.setTimeout(() => setMsg(null), 3500);
  };

  const list = reviews ?? [];

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return list.filter((r) => {
      if (rating && r.rating !== Number(rating)) return false;
      if (!term) return true;
      const product = (productNames[r.productId] ?? r.productId).toLowerCase();
      return [r.name, r.comment, r.productId, product].join(" ").toLowerCase().includes(term);
    });
  }, [list, q, rating, productNames]);

  const avg = list.length
    ? (list.reduce((s, r) => s + r.rating, 0) / list.length).toFixed(1)
    : "0";

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const openEdit = (r: AdminReview) => {
    setEditing(r);
    setEditRating(r.rating);
    setEditName(r.name);
    setEditComment(r.comment);
    setEditImage(r.image || "");
    setEditVerified(r.verified === true);
  };

  const saveMut = useMutation({
    mutationFn: (r: AdminReview) =>
      updateReview(r.productId, r.id, {
        rating: editRating,
        name: editName,
        comment: editComment,
        image: editImage.trim(),
        verified: editVerified,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      setEditing(null);
      flash("ok", "تم حفظ التقييم بنجاح");
    },
    onError: (e) => flash("err", `فشل حفظ التقييم: ${(e as Error).message}`),
  });

  const delMut = useMutation({
    mutationFn: (r: AdminReview) => deleteReview(r.productId, r.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] });
      setDeleting(null);
      flash("ok", "تم حذف التقييم");
    },
    onError: (e) => flash("err", `فشل حذف التقييم: ${(e as Error).message}`),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <ASkeleton className="h-16" />
        <ASkeleton className="h-[480px]" />
      </div>
    );
  }

  if (error) {
    return (
      <ACard className="p-8">
        <AEmpty
          icon={<AlertTriangle size={34} />}
          title="تعذّر تحميل التقييمات"
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
            التقييمات
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--nd-text-3)" }}>
            {list.length} تقييم · متوسط التقييم {avg} من 5
          </p>
        </div>
      </div>

      {msg && (
        <div
          className="px-4 py-3 rounded-xl text-[13px] font-bold"
          style={{
            background: msg.type === "ok" ? "rgba(137,210,51,0.12)" : "rgba(239,68,68,0.10)",
            color: msg.type === "ok" ? "#4d8a16" : "#dc2626",
            border: `1px solid ${msg.type === "ok" ? "rgba(137,210,51,0.35)" : "rgba(239,68,68,0.3)"}`,
          }}
        >
          {msg.text}
        </div>
      )}

      {/* Filters */}
      <ACard className="p-4 flex flex-col sm:flex-row gap-3">
        <AInput
          className="flex-1"
          icon={<Search size={16} />}
          placeholder="بحث بالمنتج، الاسم، أو التعليق…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
        />
        <ASelect
          className="w-full sm:w-44"
          value={rating}
          onChange={(e) => { setRating(e.target.value); setPage(1); }}
        >
          <option value="">كل التقييمات</option>
          <option value="5">5 نجوم</option>
          <option value="4">4 نجوم</option>
          <option value="3">3 نجوم</option>
          <option value="2">نجمتان</option>
          <option value="1">نجمة واحدة</option>
        </ASelect>
      </ACard>

      {/* Table */}
      <ACard>
        {slice.length === 0 ? (
          <AEmpty
            icon={<MessageSquare size={34} />}
            title="لا توجد تقييمات"
            hint="لم يتم إضافة أي تقييم بعد"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--nd-border)", background: "var(--nd-bg)" }}>
                  <th className={th}>المنتج</th>
                  <th className={th}>التقييم</th>
                  <th className={th}>العميلة</th>
                  <th className={th}>التعليق</th>
                  <th className={th}>التاريخ</th>
                  <th className={th + " text-end"}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((r) => (
                  <tr
                    key={r.id}
                    style={{ borderBottom: "1px solid var(--nd-border)", transition: "background 0.15s" }}
                    className="hover:bg-[var(--nd-bg)]"
                  >
                    <td className={td}>
                      <p className="max-w-[220px] truncate font-bold" style={{ color: "var(--nd-text)" }}>
                        {productNames[r.productId] ?? r.productId}
                      </p>
                      <p className="text-[11px] mt-0.5" dir="ltr" style={{ color: "var(--nd-text-4)", textAlign: "start" }}>
                        {r.productId}
                      </p>
                    </td>
                    <td className={td}><Stars rating={r.rating} /></td>
                    <td className={td}>
                      <div className="flex items-center gap-1.5">
                        <span style={{ color: "var(--nd-text-2)" }}>{r.name}</span>
                        {r.verified === true && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                            style={{ color: "#4d8a16", background: "rgba(137,210,51,0.12)" }}
                          >
                            <BadgeCheck size={11} /> شراء موثّق
                          </span>
                        )}
                      </div>
                    </td>
                    <td className={td}>
                      <p className="max-w-[260px] truncate" style={{ color: "var(--nd-text-2)" }} title={r.comment}>
                        {r.comment}
                      </p>
                    </td>
                    <td className={td} style={{ color: "var(--nd-text-3)" }}>
                      {new Date(r.createdAt).toLocaleDateString("ar-LY")}
                    </td>
                    <td className={td + " text-end"}>
                      <div className="inline-flex items-center gap-1.5">
                        <AButton variant="plain" size="xs" icon={<Eye size={14} />} onClick={() => setViewing(r)}>
                          عرض
                        </AButton>
                        <AButton variant="plain" size="xs" icon={<Edit3 size={14} />} onClick={() => openEdit(r)}>
                          تعديل
                        </AButton>
                        <AButton variant="danger" size="xs" icon={<Trash2 size={14} />} onClick={() => setDeleting(r)}>
                          حذف
                        </AButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: "1px solid var(--nd-border)" }}>
            <p className="text-[12.5px]" style={{ color: "var(--nd-text-3)" }}>
              صفحة {current} من {pages}
            </p>
            <div className="flex items-center gap-2">
              <AButton variant="default" size="xs" disabled={current <= 1} onClick={() => setPage(current - 1)}>
                السابق
              </AButton>
              <AButton variant="default" size="xs" disabled={current >= pages} onClick={() => setPage(current + 1)}>
                التالي
              </AButton>
            </div>
          </div>
        )}
      </ACard>

      {/* View modal */}
      {viewing && (
        <Modal onClose={() => setViewing(null)} title="تفاصيل التقييم">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>المنتج</p>
              <p className="text-[13.5px] font-bold" style={{ color: "var(--nd-text)" }}>
                {productNames[viewing.productId] ?? viewing.productId}
              </p>
              <p className="text-[11.5px]" dir="ltr" style={{ color: "var(--nd-text-3)", textAlign: "start" }}>
                {viewing.productId}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>التقييم</p>
                <Stars rating={viewing.rating} size={16} />
              </div>
              <div>
                <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>العميلة</p>
                <p className="text-[13.5px] font-bold" style={{ color: "var(--nd-text)" }}>{viewing.name}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>التاريخ</p>
                <p className="text-[13.5px]" style={{ color: "var(--nd-text-2)" }}>
                  {new Date(viewing.createdAt).toLocaleString("ar-LY")}
                </p>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>التعليق</p>
              <div
                className="px-4 py-3 rounded-xl text-[13.5px] leading-relaxed"
                style={{ background: "var(--nd-bg)", border: "1px solid var(--nd-border)", color: "var(--nd-text-2)" }}
              >
                {viewing.comment}
              </div>
            </div>
            {viewing.image && (
              <div>
                <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>صورة العميلة</p>
                <a href={viewing.image} target="_blank" rel="noopener noreferrer" className="block">
                  <img
                    src={viewing.image}
                    alt={`صورة من ${viewing.name}`}
                    className="w-full max-h-80 object-cover rounded-xl"
                    style={{ border: "1px solid var(--nd-border)" }}
                  />
                </a>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <AButton variant="default" onClick={() => setViewing(null)}>إغلاق</AButton>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit modal */}
      {editing && (
        <Modal onClose={() => setEditing(null)} title="تعديل التقييم">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>المنتج</p>
              <p className="text-[13.5px] font-bold" style={{ color: "var(--nd-text)" }}>
                {productNames[editing.productId] ?? editing.productId}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>التقييم</p>
              <ASelect
                className="w-full"
                value={String(editRating)}
                onChange={(e) => setEditRating(Number(e.target.value))}
              >
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} نجوم</option>)}
              </ASelect>
            </div>
            <div>
              <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>اسم العميلة</p>
              <AInput value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div>
              <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>التعليق</p>
              <textarea
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] outline-none resize-none"
                style={{ background: "var(--nd-bg)", border: "1px solid var(--nd-border)", color: "var(--nd-text)" }}
              />
            </div>
            <div>
              <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>رابط صورة العميلة (اختياري)</p>
              <AInput
                value={editImage}
                onChange={(e) => setEditImage(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                dir="ltr"
              />
              {editImage.trim() && (
                <img
                  src={editImage.trim()}
                  alt="معاينة"
                  className="mt-2 w-24 h-24 object-cover rounded-xl"
                  style={{ border: "1px solid var(--nd-border)" }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.25"; }}
                />
              )}
            </div>
            <button
              type="button"
              onClick={() => setEditVerified((v) => !v)}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[13px] font-bold transition-colors"
              style={{
                background: editVerified ? "rgba(137,210,51,0.10)" : "var(--nd-bg)",
                border: "1px solid " + (editVerified ? "rgba(137,210,51,0.4)" : "var(--nd-border)"),
                color: editVerified ? "#4d8a16" : "var(--nd-text-3)",
              }}
            >
              <span
                className="w-4 h-4 rounded flex items-center justify-center text-white text-[10px]"
                style={{ background: editVerified ? "#7ab648" : "var(--nd-border)" }}
              >
                {editVerified ? "✓" : ""}
              </span>
              <BadgeCheck size={15} />
              شراء موثّق — عرض شارة التأكيد في المتجر
            </button>
            <div className="flex justify-end gap-2 pt-2">
              <AButton variant="default" onClick={() => setEditing(null)}>إلغاء</AButton>
              <AButton
                variant="solid"
                icon={saveMut.isPending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                disabled={saveMut.isPending || editComment.trim().length < 3}
                onClick={() => saveMut.mutate(editing)}
              >
                حفظ
              </AButton>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete confirm */}
      {deleting && (
        <Modal onClose={() => setDeleting(null)} title="حذف التقييم">
          <div className="space-y-4">
            <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--nd-text-2)" }}>
              هل أنتِ متأكدة من حذف تقييم{" "}
              <span className="font-bold" style={{ color: "var(--nd-text)" }}>{deleting.name}</span>؟
              لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div
              className="px-4 py-3 rounded-xl text-[13px] leading-relaxed"
              style={{ background: "var(--nd-bg)", border: "1px solid var(--nd-border)", color: "var(--nd-text-2)" }}
            >
              {deleting.comment}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <AButton variant="default" onClick={() => setDeleting(null)}>إلغاء</AButton>
              <AButton
                variant="danger"
                icon={delMut.isPending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                disabled={delMut.isPending}
                onClick={() => delMut.mutate(deleting)}
              >
                حذف نهائي
              </AButton>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 overflow-y-auto"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: "var(--nd-white)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--nd-border)" }}>
          <h3 className="text-base font-bold" style={{ color: "var(--nd-text)" }}>{title}</h3>
          <button onClick={onClose} style={{ color: "var(--nd-text-3)" }} aria-label="إغلاق">
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
