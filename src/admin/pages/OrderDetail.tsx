import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  Copy,
  Printer,
  Clock,
  Package,
  Truck,
  MapPin,
  CheckCircle2,
  Loader2,
  ChevronDown,
  AlertTriangle,
  MessageSquare,
  Send,
  MessageCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { useOrders } from "../lib/metrics";
import { useQuery } from "@tanstack/react-query";
import { fetchNotes, addNote, updateStatus, type Note } from "../lib/api";
import { fetchCoupons } from "../lib/api";
import {
  ACard,
  AButton,
  StatusBadge,
  ASkeleton,
  AEmpty,
} from "../components/ui";
import { ADMIN_PATH } from "../lib/config";
import {
  statusMeta,
  STATUSES,
  fmtDate,
  fmtDateTime,
  relativeAr,
  checkCoupon,
  COUPON_STATUS_META,
  type AdminCoupon,
  type Order,
  type OrderStatus,
} from "../lib/types";

const TIMELINE_STEPS = [
  { key: "pending", icon: Clock, label: "انتظار التأكيد" },
  { key: "processing", icon: Package, label: "جاري التجهيز" },
  { key: "waiting_shipping", icon: Truck, label: "في انتظار الشحن" },
  { key: "shipped", icon: MapPin, label: "جاري الشحن" },
  { key: "delivered", icon: CheckCircle2, label: "تم التوصيل" },
];

const STATUS_ORDER: OrderStatus[] = ["pending", "processing", "waiting_shipping", "shipped", "delivered"];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: orders, isLoading, error } = useOrders();
  const { data: coupons } = useQuery({
    queryKey: ["admin", "coupons"],
    queryFn: fetchCoupons,
    staleTime: 60_000,
  });
  const order = orders?.find((o) => o.orderId === id);
  const couponMap = useMemo(() => {
    const map: Record<string, AdminCoupon> = {};
    for (const c of coupons ?? []) map[c.code.toLowerCase()] = c;
    return map;
  }, [coupons]);

  const [updating, setUpdating] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusError, setStatusError] = useState("");

  // Load notes
  useEffect(() => {
    if (id) {
      fetchNotes(id)
        .then(setNotes)
        .catch(() => {});
    }
  }, [id]);

  // Copy order number
  const copyOrder = useCallback(() => {
    if (!order) return;
    navigator.clipboard.writeText(order.orderId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [order]);

  // Print order
  const printOrder = useCallback(() => {
    window.print();
  }, []);

  // Update status
  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order || newStatus === order.status) return;
    setUpdating(true);
    setStatusError("");
    try {
      await updateStatus(order.orderId, newStatus);
      window.location.reload();
    } catch (err) {
      setStatusError("فشل تحديث الحالة");
    } finally {
      setUpdating(false);
    }
  };

  // Save note
  const handleAddNote = async () => {
    if (!id || !noteText.trim()) return;
    setSavingNote(true);
    try {
      const note = await addNote(id, noteText.trim());
      setNotes((prev) => [...prev, note]);
      setNoteText("");
    } catch {
      // ignore
    } finally {
      setSavingNote(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <ASkeleton className="h-12 w-48" />
        <ASkeleton className="h-64" />
        <ASkeleton className="h-48" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <ACard className="p-8">
        <AEmpty
          icon={<AlertTriangle size={34} />}
          title="الطلب غير موجود"
          hint="لم يتم العثور على طلب بهذا الرقم"
        />
        <div className="text-center mt-4">
          <Link to={`/${ADMIN_PATH}/orders`}>
            <AButton variant="default" size="sm" icon={<ArrowRight size={15} />}>
              العودة للطلبات
            </AButton>
          </Link>
        </div>
      </ACard>
    );
  }

  const currentIdx = STATUS_ORDER.indexOf(order.status as OrderStatus);
  const canAdvance = currentIdx < STATUS_ORDER.length - 1;
  const nextStatus = canAdvance ? STATUS_ORDER[currentIdx + 1] : null;
  const prevStatus = currentIdx > 0 ? STATUS_ORDER[currentIdx - 1] : null;

  return (
    <div className="flex flex-col gap-6 print:gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:flex-col print:items-start">
        <div className="flex items-center gap-3">
          <Link
            to={`/${ADMIN_PATH}/orders`}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-bold transition-colors"
            style={{ color: "var(--nd-text-3)", background: "var(--nd-surface)" }}
          >
            <ArrowRight size={15} />
            الطلبات
          </Link>
          <div>
            <h1
              className="text-[22px] sm:text-[26px] font-extrabold leading-tight flex items-center gap-3"
              style={{ color: "var(--nd-text)" }}
            >
              {order.orderId}
              <StatusBadge status={order.status} />
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--nd-text-3)" }}>
              تم الإنشاء {fmtDateTime(order.createdAt)} · آخر تحديث {relativeAr(order.updatedAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <AButton
            variant="default"
            size="sm"
            icon={copied ? <CheckCircle2 size={14} style={{ color: "var(--nd-primary-500)" }} /> : <Copy size={14} />}
            onClick={copyOrder}
          >
            {copied ? "تم النسخ" : "نسخ رقم الطلب"}
          </AButton>
          <AButton variant="default" size="sm" icon={<Printer size={14} />} onClick={printOrder}>
            طباعة
          </AButton>
          {order.phone && (
            <AButton
              variant="default"
              size="sm"
              icon={<MessageCircle size={14} style={{ color: "#25D366" }} />}
              onClick={() => {
                const msg = `السلام عليكم، بخصوص طلبك ${order.orderId} — الحالة: ${order.statusLabel || ""}. للاستفسار يرجى الرد على هذه الرسالة.`;
                window.open(`https://wa.me/${order.phone}?text=${encodeURIComponent(msg)}`, "_blank", "noopener,noreferrer");
              }}
            >
              واتساب
            </AButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-1">
        {/* Main column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Status Timeline */}
          <ACard className="p-5 sm:p-6">
            <h3
              className="text-[15px] font-extrabold mb-5"
              style={{ color: "var(--nd-text)" }}
            >
              مسار الطلب
            </h3>
            <div className="flex items-start gap-0">
              {TIMELINE_STEPS.map((step, i) => {
                const done = i <= currentIdx;
                const isCurrent = i === currentIdx;
                return (
                  <div key={step.key} className="flex-1 flex flex-col items-center relative">
                    {/* Connector line */}
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div
                        className="absolute h-0.5 w-full top-5"
                        style={{
                          background: i < currentIdx
                            ? "var(--nd-primary-500)"
                            : i === currentIdx
                            ? "linear-gradient(90deg, var(--nd-primary-500) 50%, var(--nd-border-2) 50%)"
                            : "var(--nd-border-2)",
                          right: "50%",
                        }}
                      />
                    )}
                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all"
                      style={{
                        background: done ? "var(--nd-primary-500)" : "var(--nd-surface)",
                        border: done ? "none" : "2px solid var(--nd-border-2)",
                      }}
                    >
                      <step.icon
                        size={16}
                        className={done ? "text-white" : ""}
                        style={!done ? { color: "var(--nd-text-4)" } : undefined}
                      />
                    </div>
                    {/* Label */}
                    <p
                      className="text-[11px] font-bold mt-2 text-center leading-tight"
                      style={{
                        color: isCurrent
                          ? "var(--nd-primary-500)"
                          : done
                          ? "var(--nd-text)"
                          : "var(--nd-text-4)",
                      }}
                    >
                      {step.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </ACard>

          {/* Order Details Card */}
          <ACard className="p-5 sm:p-6">
            <h3
              className="text-[15px] font-extrabold mb-4"
              style={{ color: "var(--nd-text)" }}
            >
              تفاصيل الطلب
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "كود المنتج", value: order.code },
                { label: "المنتج", value: order.name },
                { label: "اللون", value: order.color },
                { label: "المقاس", value: order.size },
                { label: "المدينة", value: order.location },
                { label: "رقم الهاتف", value: order.phone, ltr: true },
                { label: "تاريخ الإنشاء", value: fmtDateTime(order.createdAt) },
                { label: "آخر تحديث", value: fmtDateTime(order.updatedAt) },
                { label: "طريقة الدفع", value: "عند الاستلام 💵" },
                { label: "إشعار واتساب", value: order.whatsappConsent ? "✅ مفعّل" : "❌ غير مفعّل" },
                {
                  label: "كود الخصم",
                  value: order.couponCode
                    ? `${order.couponCode} — ${COUPON_STATUS_META[checkCoupon(order.couponCode, couponMap)?.status ?? "missing"].label}`
                    : "—",
                  ltr: true,
                },
              ].map((f) => (
                <div key={f.label}>
                  <p className="text-[11px] font-bold mb-1" style={{ color: "var(--nd-text-4)" }}>
                    {f.label}
                  </p>
                  <p
                    className="text-[14px] font-semibold"
                    style={{ color: "var(--nd-text)", direction: f.ltr ? "ltr" : undefined, textAlign: f.ltr ? "left" : undefined }}
                  >
                    {f.value || "—"}
                  </p>
                </div>
              ))}
            </div>
          </ACard>

          {/* Notes Section */}
          <ACard className="p-5 sm:p-6 print:hidden">
            <h3
              className="text-[15px] font-extrabold mb-4 flex items-center gap-2"
              style={{ color: "var(--nd-text)" }}
            >
              <MessageSquare size={16} />
              الملاحظات
            </h3>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                placeholder="أضف ملاحظة..."
                className="flex-1 h-11 px-3.5 rounded-xl text-[14px] outline-none"
                style={{
                  background: "var(--nd-surface)",
                  border: "1px solid var(--nd-border-2)",
                  color: "var(--nd-text)",
                }}
              />
              <AButton
                variant="solid"
                size="sm"
                icon={savingNote ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                onClick={handleAddNote}
                disabled={!noteText.trim() || savingNote}
              >
                إضافة
              </AButton>
            </div>

            {notes.length === 0 ? (
              <p className="text-[13px]" style={{ color: "var(--nd-text-4)" }}>
                لا توجد ملاحظات بعد
              </p>
            ) : (
              <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
                {[...notes].reverse().map((note) => (
                  <div
                    key={note.id}
                    className="p-3 rounded-xl"
                    style={{ background: "var(--nd-bg)", border: "1px solid var(--nd-border)" }}
                  >
                    <p className="text-[13px]" style={{ color: "var(--nd-text)" }}>
                      {note.text}
                    </p>
                    <p className="text-[10px] mt-1" style={{ color: "var(--nd-text-4)" }}>
                      {fmtDateTime(note.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ACard>
        </div>

        {/* Sidebar column */}
        <div className="flex flex-col gap-6 print:hidden">
          {/* Status Control */}
          <ACard className="p-5 sm:p-6">
            <h3
              className="text-[15px] font-extrabold mb-4"
              style={{ color: "var(--nd-text)" }}
            >
              تغيير الحالة
            </h3>

            <div className="flex flex-col gap-2">
              {STATUS_ORDER.map((s) => {
                const idx = STATUS_ORDER.indexOf(s);
                const isCurrent = idx === currentIdx;
                const isPast = idx < currentIdx;
                const m = STATUSES[s];
                return (
                  <button
                    key={s}
                    disabled={updating || isPast}
                    onClick={() => handleStatusChange(s)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-95"
                    style={{
                      background: isCurrent ? m.bg : "var(--nd-surface)",
                      border: `1px solid ${isCurrent ? m.color : "var(--nd-border-2)"}`,
                      color: isCurrent ? m.color : "var(--nd-text-2)",
                    }}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: m.color }}
                    />
                    <span className="flex-1 text-right">{m.label}</span>
                    {isCurrent && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: m.bg, color: m.color }}>
                        الحالية
                      </span>
                    )}
                    {updating && isCurrent && <Loader2 size={14} className="animate-spin" />}
                  </button>
                );
              })}
            </div>

            {statusError && (
              <p className="text-[12px] mt-3 text-red-600 flex items-center gap-1">
                <AlertTriangle size={12} />
                {statusError}
              </p>
            )}
          </ACard>

          {/* Order Summary */}
          <ACard className="p-5 sm:p-6">
            <h3
              className="text-[15px] font-extrabold mb-4"
              style={{ color: "var(--nd-text)" }}
            >
              معلومات سريعة
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[12px]" style={{ color: "var(--nd-text-4)" }}>الحالة</span>
                <StatusBadge status={order.status} size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-[12px]" style={{ color: "var(--nd-text-4)" }}>العميل</span>
                <span className="text-[13px] font-semibold" style={{ color: "var(--nd-text)" }}>{order.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12px]" style={{ color: "var(--nd-text-4)" }}>الهاتف</span>
                <span className="text-[13px] font-semibold" dir="ltr" style={{ color: "var(--nd-text)" }}>{order.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12px]" style={{ color: "var(--nd-text-4)" }}>المدينة</span>
                <span className="text-[13px] font-semibold" style={{ color: "var(--nd-text)" }}>{order.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[12px]" style={{ color: "var(--nd-text-4)" }}>السعر</span>
                <span className="text-[13px] font-semibold" style={{ color: "var(--nd-text)" }}>—</span>
              </div>
            </div>
          </ACard>
        </div>
      </div>
    </div>
  );
}
