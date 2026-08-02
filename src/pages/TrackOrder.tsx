import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { usePageMeta } from "@/lib/usePageMeta";
import { motion } from "framer-motion";
import {
  Package,
  PackageCheck,
  Truck,
  MapPin,
  Search,
  Loader2,
  Clock,
  MessageCircle,
  Wallet,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import { Barcode } from "@/components/ui/barcode";
import type { CertificateData } from "@/components/certificate/OrderCertificate";
import { LuxuryTimeline, type TimelineStage } from "@/components/ui/luxury-timeline";
import { LuxuryStatusBadge } from "@/components/ui/luxury-status-badge";
import { AuthenticatedProductCard } from "@/components/ui/authenticated-product-card";
import { pieceBarcode } from "@/lib/barcode";
import { products } from "@/data/products";

/** The certificate surface (html-to-image) is heavy — load it only when opened. */
const OrderCertificateModal = lazy(() =>
  import("@/components/certificate/OrderCertificate").then((m) => ({
    default: m.OrderCertificateModal,
  }))
);

const STATUS_STEPS: TimelineStage[] = [
  { key: "pending", icon: Clock, label: "تأكيد الطلب", caption: "سيتم الاتصال بكِ لتأكيد الطلب خلال 24 ساعة" },
  { key: "processing", icon: Package, label: "جاري التجهيز", caption: "يتم تجهيز وتغليف قطعتكِ بعناية فائقة" },
  { key: "waiting_shipping", icon: PackageCheck, label: "في انتظار الشحن", caption: "الطلب في انتظار وصول الشحنة إلى مركز الشحن" },
  { key: "shipped", icon: Truck, label: "جاري الشحن", caption: "سيتم التوصيل إلى عنوانكِ خلال 1-3 أيام عمل" },
  { key: "delivered", icon: MapPin, label: "تم التوصيل", caption: "تم تسليم طلبكِ بنجاح ✓" },
];

const STATUS_ORDER = ["pending", "processing", "waiting_shipping", "shipped", "delivered"];

const ETA_MAP: Record<string, string> = {
  pending: "سيتم الاتصال بكِ لتأكيد الطلب خلال 24 ساعة",
  processing: "سيتم الشحن خلال 2-3 أيام عمل من تاريخ التأكيد",
  waiting_shipping: "الطلب في انتظار وصول الشحنة إلى مركز الشحن",
  shipped: "سيتم التوصيل إلى عنوانكِ خلال 1-3 أيام عمل",
  delivered: "تم تسليم الطلب ✓",
};

export function TrackOrder() {
  usePageMeta("تتبع الطلب", "أدخلي رقم الطلب ورقم الهاتف لتتبعي حالة طلبك من نادين لحظة بلحظة.");
  return <PageTransition><TrackOrderContent /></PageTransition>;
}

function TrackOrderContent() {
  const [params] = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(params.get("orderNumber") || "");
  const [phone, setPhone] = useState(params.get("phone") || "");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [certOpen, setCertOpen] = useState(false);

  // Auto-search when arriving with ?orderNumber=&phone= (from booking success).
  useEffect(() => {
    const qOrder = params.get("orderNumber");
    const qPhone = params.get("phone");
    if (qOrder && qPhone) {
      const timer = setTimeout(() => {
        handleSubmitRef.current?.();
      }, 300);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmitRef = useRef<() => void>(() => {});

  const submit = async () => {
    if (!orderNumber.trim() || !phone.trim()) {
      setError("يرجى إدخال رقم الطلب ورقم الهاتف");
      return;
    }

    const digits = phone.replace(/\s/g, "");
    if (!/^\d{10}$/.test(digits) || !/^(091|092|093|094)/.test(digits)) {
      setError("رقم الهاتف يجب أن يتكون من 10 أرقام ويبدأ بـ 091 أو 092 أو 093 أو 094");
      return;
    }

    setError("");
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(
        `/api/track-order?orderNumber=${encodeURIComponent(orderNumber.trim())}&phone=${encodeURIComponent(phone.trim())}`
      );
      const data = await res.json();

      if (!data.found || !data.order) {
        setOrder(null);
      } else {
        setOrder(data.order);
      }
    } catch {
      setError("حدث خطأ، يرجى المحاولة مرة أخرى");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };
  handleSubmitRef.current = submit;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submit();
  };

  const getStatusIndex = (status: string) => {
    const idx = STATUS_ORDER.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  const pieces = order
    ? (Array.isArray(order.items) && order.items.length
        ? order.items
        : [{ id: "", name: order.name, color: order.color, size: order.size }]
      ).map((it: any, i: number) => {
        const p =
          products.find((x) => x.id === it.id) ??
          products.find((x) => x.name === it.name);
        return {
          name: p?.seoName || p?.model || it.name || order.name,
          code: p?.code || order.code,
          collection: p?.collection,
          edition: p?.edition,
          color: it.color,
          size: it.size,
          quantity: it.quantity,
          image: p?.images?.[0],
        };
      })
    : [];

  const orderDateLabel = order
    ? new Date(order.createdAt).toLocaleDateString("ar-LY", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-canvas">
      <section className="pt-24 pb-8 md:pt-28 md:pb-10">
        <div className="max-w-[860px] mx-auto px-4 sm:px-6 text-center">
          <p className="text-[10px] font-bold tracking-[0.34em] text-brand/70">NADINE LUXURY</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-fg mt-2 mb-3">
            تتبع <span className="text-accent-brand">طلبكِ</span>
          </h1>
          <p className="text-sm text-fg-tertiary">أدخلي رقم الطلب ورقم الهاتف لمتابعة حالة طلبكِ</p>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-[860px] mx-auto px-4 sm:px-6">
          {/* Search form */}
          <form
            onSubmit={handleSubmit}
            className="mb-8 rounded-3xl border bg-white p-6 md:p-8"
            style={{ borderColor: "rgba(201,162,94,0.4)", boxShadow: "0 20px 50px -30px rgba(34,32,28,0.25)" }}
          >
            <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div>
                <label className="text-[11px] font-semibold text-fg-tertiary block mb-1">
                  رقم الطلب <span className="text-status-danger">*</span>
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="NAD-XXXX"
                  required
                  className="w-full px-4 py-3 text-sm text-fg bg-white/60 rounded-xl border border-line-subtle outline-none focus:border-accent-brand transition-colors placeholder:text-fg-tertiary text-center"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-fg-tertiary block mb-1">
                  رقم الهاتف المستخدم في الحجز <span className="text-status-danger">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912345678"
                  required
                  className="w-full px-4 py-3 text-sm text-fg bg-white/60 rounded-xl border border-line-subtle outline-none focus:border-accent-brand transition-colors placeholder:text-fg-tertiary text-center"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-bold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #e63d6a, #c42855)", boxShadow: "0 12px 26px -14px rgba(196,40,85,0.6)" }}
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> جاري البحث...</>
                ) : (
                  <><Search size={16} /> تتبع الطلب</>
                )}
              </button>
            </div>
            {error && <p className="mt-3 text-xs text-status-danger text-center">{error}</p>}
          </form>

          {/* Loading */}
          {loading && (
            <div className="text-center py-14">
              <Loader2 size={32} className="mx-auto animate-spin" style={{ color: "#c42855" }} />
            </div>
          )}

          {/* Not found */}
          {!loading && searched && !order && (
            <div className="rounded-3xl border bg-white p-10 text-center" style={{ borderColor: "rgba(201,162,94,0.4)" }}>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "rgba(201,162,94,0.12)" }}>
                <Package size={30} className="text-brand/60" />
              </div>
              <p className="mt-4 text-sm font-bold text-fg">لم يتم العثور على طلب بهذه البيانات</p>
              <p className="text-[11px] text-fg-tertiary mt-1.5">تأكدي من رقم الطلب ورقم الهاتف المستخدم في الحجز</p>
            </div>
          )}

          {/* Order found — luxury dashboard */}
          {!loading && order && (
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Order found — confirmation ticket */}
              <div
                className="relative z-10 w-full overflow-hidden rounded-2xl bg-card shadow-lg"
                style={{
                  border: "1px solid rgba(201,162,94,0.35)",
                  boxShadow: "0 18px 50px -22px rgba(34,32,28,0.32)",
                }}
              >
                {/* Ticket cut-out effect */}
                <div className="absolute -left-4 top-[38%] h-8 w-8 rounded-full bg-background" aria-hidden="true" />
                <div className="absolute -right-4 top-[38%] h-8 w-8 rounded-full bg-background" aria-hidden="true" />

                {/* Success mark + heading */}
                <div className="flex flex-col items-center px-6 pt-8 text-center sm:px-8">
                  <div className="rounded-full bg-primary/10 p-3">
                    <CheckCircle2 className="h-10 w-10" style={{ color: "#c42855" }} strokeWidth={2} aria-hidden="true" />
                  </div>
                  <p className="mt-4 text-[10px] font-bold tracking-[0.32em]" style={{ color: "#b48a45" }}>
                    NADINE LUXURY · HOUSE CERTIFIED
                  </p>
                  <h2 className="mt-2 text-2xl font-bold" style={{ color: "#22201c" }}>
                    تم استلام طلبك بنجاح
                  </h2>
                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    قطعتكِ قيد التوثيق
                  </p>
                </div>

                <div className="space-y-6 px-8 pb-8">
                  <div className="mt-6 w-full border-t-2 border-dashed border-border/60" aria-hidden="true" />

                  {/* Ticket registry */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">رقم الطلب</p>
                      <p
                        className="mt-0.5 font-mono text-sm font-semibold tabular-nums tracking-wider"
                        dir="ltr"
                        style={{ textAlign: "right", color: "#22201c" }}
                      >
                        {order.orderId}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">حالة الطلب</p>
                      <div className="mt-1 flex justify-end">
                        <LuxuryStatusBadge status={order.status} label={order.statusLabel || order.status} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">الاسم الكريم</p>
                      <p className="mt-0.5 text-sm font-bold" style={{ color: "#22201c" }}>
                        {order.customerName || "—"}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">تاريخ الطلب</p>
                      <p className="mt-0.5 text-sm font-bold" style={{ color: "#22201c" }}>
                        {orderDateLabel}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">القطع الموثّقة</p>
                      <p className="mt-0.5 text-sm font-bold" style={{ color: "#c42855" }}>
                        {pieces.length > 1 ? `${pieces.length} قطع موثّقة` : "قطعة موثّقة"}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground">طريقة الدفع</p>
                      <p className="mt-0.5 text-sm font-bold" style={{ color: "#22201c" }}>
                        الدفع عند الاستلام
                      </p>
                    </div>
                  </div>

                  <div className="w-full border-t-2 border-dashed border-border/60" aria-hidden="true" />

                  {pieces[0] && (
                    <Barcode
                      value={pieceBarcode({
                        orderId: order.orderId,
                        sku: pieces[0].code,
                        pieceIndex: 1,
                        date: order.createdAt,
                      })}
                      label="رمز التوثيق"
                      className="mx-auto"
                    />
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div
                className="rounded-[28px] bg-white p-6 sm:p-8"
                style={{ border: "1px solid rgba(201,162,94,0.35)", boxShadow: "0 18px 44px -30px rgba(34,32,28,0.25)" }}
              >
                <h3 className="mb-6 text-center text-[11px] font-bold tracking-[0.28em]" style={{ color: "#b48a45" }}>
                  مسار الطلب
                </h3>
                <LuxuryTimeline stages={STATUS_STEPS} currentIndex={getStatusIndex(order.status)} />
              </div>

              {/* Product passports */}
              {pieces.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-center text-[11px] font-bold tracking-[0.28em]" style={{ color: "#b48a45" }}>
                    القطع الموثّقة
                  </h3>
                  {pieces.map((piece: any, i: number) => (
                    <AuthenticatedProductCard
                      key={`${piece.code}-${i}`}
                      piece={piece}
                      pieceNumber={i + 1}
                      barcodeValue={pieceBarcode({
                        orderId: order.orderId,
                        sku: piece.code,
                        pieceIndex: i + 1,
                        date: order.createdAt,
                      })}
                      onCertificate={() => setCertOpen(true)}
                    />
                  ))}
                </div>
              )}

              {/* Payment + ETA */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div
                  className="rounded-3xl bg-white p-6"
                  style={{ border: "1px solid rgba(201,162,94,0.35)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "rgba(196,40,85,0.08)" }}>
                      <Wallet size={17} style={{ color: "#c42855" }} />
                    </div>
                    <p className="text-sm font-bold" style={{ color: "#22201c" }}>طريقة الدفع</p>
                  </div>
                  <p className="mt-3 text-[13px] font-semibold" style={{ color: "#5c5348" }}>
                    الدفع عند الاستلام 💵
                  </p>
                </div>

                <div
                  className="rounded-3xl bg-white p-6"
                  style={{ border: "1px solid rgba(201,162,94,0.35)" }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "rgba(196,40,85,0.08)" }}>
                      <Clock size={17} style={{ color: "#c42855" }} />
                    </div>
                    <p className="text-sm font-bold" style={{ color: "#22201c" }}>وقت التوصيل المتوقع</p>
                  </div>
                  <p className="mt-3 text-[13px] leading-relaxed" style={{ color: "#5c5348" }}>
                    {ETA_MAP[order.status] || "سيتم تحديث وقت التوصيل عند تأكيد الطلب"}
                  </p>
                  {order.status !== "delivered" && (
                    <p className="mt-1.5 text-[11px]" style={{ color: "#8c8276" }}>
                      * التوقيت تقديري وقد يختلف حسب المدينة والظروف
                    </p>
                  )}
                </div>
              </div>

              {/* Certificate + WhatsApp */}
              <div
                className="flex flex-col items-center gap-4 rounded-3xl bg-white p-6 sm:flex-row sm:justify-between"
                style={{ border: "1px solid rgba(201,162,94,0.35)" }}
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: "rgba(201,162,94,0.14)" }}>
                    <CalendarDays size={17} style={{ color: "#b48a45" }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#22201c" }}>وثائق طلبكِ</p>
                    <p className="text-[11px]" style={{ color: "#8c8276" }}>شهادة الأصالة الرسمية متاحة للتحميل</p>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <a
                    href={`https://wa.me/218944003708?text=${encodeURIComponent(
                      `السلام عليكم، أريد الاستفسار عن طلبي رقم ${order.orderId}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center gap-2 rounded-xl px-5 text-xs font-bold text-white transition-all hover:scale-[1.02]"
                    style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
                  >
                    <MessageCircle size={15} />
                    استفسري عبر واتساب
                  </a>
                  <button
                    onClick={() => setCertOpen(true)}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border px-5 text-xs font-bold transition-all hover:bg-black/[0.02] active:scale-[0.98]"
                    style={{ borderColor: "#c9a25e", color: "#9c7138" }}
                  >
                    عرض شهادة الأصالة
                  </button>
                </div>
              </div>

              <Suspense fallback={null}>
                <OrderCertificateModal
                  open={certOpen}
                  onClose={() => setCertOpen(false)}
                  data={certificateFromOrder(order)}
                />
              </Suspense>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

/** Build the certificate payload from a tracked order record. */
function certificateFromOrder(order: any): CertificateData {
  const raw = Array.isArray(order.items) && order.items.length
    ? order.items
    : [{ id: "", name: order.name, color: order.color, size: order.size }];

  return {
    orderId: order.orderId,
    customerName: order.customerName || "",
    date: new Date(order.createdAt).toLocaleDateString("ar-LY", {
      year: "numeric", month: "long", day: "numeric",
    }),
    items: raw.map((it: any) => {
      const p = products.find((x) => x.id === it.id) ?? products.find((x) => x.name === it.name);
      return {
        name: p?.seoName || p?.model || it.name || order.name,
        code: p?.code || order.code,
        collection: p?.collection,
        edition: p?.edition,
        color: it.color,
        size: it.size,
      };
    }),
  };
}
