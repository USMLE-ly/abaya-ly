import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { X, Loader2, ChevronDown } from "lucide-react";
import { products } from "@/data/products";
import type { CertificateData } from "@/components/certificate/OrderCertificate";
import { OrderSuccessCard } from "@/components/ui/order-success-card";
import { OrderDetails } from "@/components/ui/order-details";
import type { AuthenticatedPiece } from "@/components/ui/authenticated-product-card";
import { pieceBarcode, productPageUrl } from "@/lib/barcode";

/** The certificate surface (html-to-image) is heavy — load it only when opened. */
const OrderCertificateModal = lazy(() =>
  import("@/components/certificate/OrderCertificate").then((m) => ({
    default: m.OrderCertificateModal,
  }))
);
export interface BookingCartItem {
  id: string;
  name: string;
  image: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
  colors: string[];
  sizes: string[];
}

export interface BookingCartContext {
  itemCount: number;
  total: number;
  codes: string;
  names: string;
  items: BookingCartItem[];
}

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  productCode: string;
  productName: string;
  colors: { name: string; hex: string }[];
  sizes: string[];
  presetCoupon?: string;
  cart?: BookingCartContext | null;
  onSuccess?: () => void;
  preOrder?: boolean;
}

const LIBYAN_CITIES = [
  "طرابلس",
  "بنغازي",
  "مصراتة",
  "الزاوية",
  "الخمس",
  "زليتن",
  "صبراتة",
  "سرت",
  "سبها",
  "طبرق",
  "درنة",
  "البيضاء",
  "المرج",
  "إجدابيا",
  "الكفرة",
  "غريان",
  "ترهونة",
  "بني وليد",
  "مزدة",
  "نالوت",
  "غات",
  "غدامس",
  "يفرن",
  "زوارة",
  "الأصابعة",
  "جادو",
  "أوباري",
  "مرزق",
  "البريقة",
  "أوجلة",
  "جالو",
  "سلوق",
  "قمينس",
  "تازربو",
  "أخرى",
];

/** Resolve the dress image for the color currently selected in the order confirmation. */
function colorImageFor(item: BookingCartItem, colorName: string): string {
  const p = products.find((x) => x.id === item.id);
  if (!p) return item.image;
  const color = p.colors.find((c) => c.name === colorName);
  if (color?.linkTo) {
    const linked = products.find((x) => x.id === color.linkTo);
    if (linked?.images?.[0]) return linked.images[0];
  }
  return item.image;
}

export function BookingModal({ open, onClose, productCode, productName, colors, sizes, presetCoupon = "", cart = null, onSuccess, preOrder = false }: BookingModalProps) {
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name || "");
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");
  const [selectedCity, setSelectedCity] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [certOpen, setCertOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [submittedPhone, setSubmittedPhone] = useState("");
  const errorRef = useRef<HTMLParagraphElement | null>(null);
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; label: string; discount: number } | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [selections, setSelections] = useState<Record<number, { color: string; size: string }>>({});

  // Reset per-item picks to the cart's current values whenever the modal opens.
  useEffect(() => {
    if (open && cart?.items?.length) {
      const next: Record<number, { color: string; size: string }> = {};
      cart.items.forEach((it, i) => {
        next[i] = {
          color: it.colors.includes(it.color) ? it.color : (it.colors[0] ?? ""),
          size: it.sizes.includes(it.size) ? it.size : (it.sizes[0] ?? ""),
        };
      });
      setSelections(next);
    }
  }, [open, cart]);

  // Auto-apply a code revealed by the clickable discount block.
  useEffect(() => {
    if (open && presetCoupon) {
      setCouponCode(presetCoupon);
      setCouponApplied(null);
      setCouponError("");
    }
  }, [open, presetCoupon]);

  // Bring validation/network errors into view so they are never missed.
  useEffect(() => {
    if (error) errorRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [error]);


  if (!open) return null;

  const isOtherCity = selectedCity === "أخرى";
  const locationValue = isOtherCity ? customLocation.trim() : selectedCity;

  const validatePhone = (value: string): string | null => {
    const digits = value.replace(/\s/g, "");
    if (!/^\d{10}$/.test(digits)) {
      return "رقم الهاتف يجب أن يتكون من 10 أرقام";
    }
    if (!/^(091|092|093|094)/.test(digits)) {
      return "رقم الهاتف يجب أن يبدأ بـ 091 أو 092 أو 093 أو 094";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameClean = customerName.trim();
    if (nameClean.length < 2 || nameClean.length > 60) {
      setError("يرجى كتابة الاسم الكريم (من حرفين إلى 60 حرفاً)");
      return;
    }

    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    if (!selectedCity) {
      setError("يرجى اختيار المدينة أو المنطقة");
      return;
    }

    if (isOtherCity && !customLocation.trim()) {
      setError("يرجى كتابة اسم المدينة أو المنطقة");
      return;
    }

    setError("");
    setSubmitting(true);

    const orderedItems = cart
      ? cart.items.map((it, i) => {
          const sel = selections[i] ?? { color: it.color, size: it.size };
          return {
            id: it.id,
            name: it.name,
            color: sel.color,
            size: sel.size,
            quantity: it.quantity,
            price: it.price,
          };
        })
      : [];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          code: cart ? cart.codes : productCode,
          name: cart ? cart.names : productName,
          customerName: nameClean,
          color: cart ? `${cart.itemCount} قطع` : selectedColor,
          size: cart ? "" : selectedSize,
          items: cart ? orderedItems : undefined,
          location: locationValue,
          phone: phone.trim(),
          whatsappConsent,
          couponCode: couponApplied?.code || "",
          preOrder,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || "فشل الإرسال");
      if (!data) throw new Error("استجابة فارغة");

      if (data.orderId) setOrderId(data.orderId);
      setSubmittedPhone(phone.trim());
      setDone(true);

      // Snapshot for the personalized certificate (taken before the cart clears).
      try {
        const source = cart
          ? orderedItems.map((it) => ({ id: it.id, name: it.name, color: it.color, size: it.size }))
          : [{ id: "", name: productName, color: selectedColor, size: selectedSize }];
        setCertificate({
          orderId: data.orderId || "",
          customerName: nameClean,
          date: new Date().toLocaleDateString("ar-LY", { year: "numeric", month: "long", day: "numeric" }),
          items: source.map((it) => {
            const p = products.find((x) => x.id === it.id) ?? products.find((x) => x.name === it.name);
            return {
              id: it.id,
              name: p?.seoName || p?.model || it.name,
              code: p?.code || productCode,
              collection: p?.collection,
              edition: p?.edition,
              color: it.color,
              size: it.size,
            };
          }),
        });
      } catch {
        /* the certificate is optional — never block the confirmed order */
      }

      onSuccess?.();

    } catch (err: any) {
      if (err?.name === "AbortError") {
        setError("استغرق إرسال الطلب وقتاً طويلاً — يرجى المحاولة مرة أخرى");
      } else if (err?.message && err.message !== "فشل الإرسال") {
        setError(err.message === "Too many requests" ? "تم إرسال عدد كبير من الطلبات — يرجى المحاولة بعد قليل" : err.message);
      } else {
        setError("حدث خطأ، يرجى المحاولة مرة أخرى أو الاتصال بنا عبر واتساب");
      }
    } finally {
      clearTimeout(timeout);
      setSubmitting(false);
    }
  };

  // Snapshot of the authenticated pieces shown inside the success modal (taken at submit time).
  const successPieces: AuthenticatedPiece[] = (
    certificate?.items && certificate.items.length > 0
      ? certificate.items
      : cart
        ? cart.items.map((it) => ({
            id: it.id,
            name: it.name,
            code: products.find((p) => p.id === it.id)?.code || productCode,
            color: it.color,
            size: it.size,
          }))
        : [{ name: productName, code: productCode, color: selectedColor, size: selectedSize }]
  ).map((it: AuthenticatedPiece) => {
    const p = products.find((x) => x.code === it.code) ?? products.find((x) => x.name === it.name);
    return {
      id: it.id ?? "",
      name: p?.seoName || p?.model || it.name,
      code: p?.code || it.code,
      collection: it.collection ?? p?.collection,
      edition: it.edition ?? p?.edition,
      color: it.color,
      size: it.size,
      image: p?.images?.[0],
    };
  });

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(17,15,13,0.70)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] rounded-2xl overflow-hidden flex flex-col"
        style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(24px)", border: "1px solid rgba(196,40,85,0.12)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {!done ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-line-subtle shrink-0">
              <h3 className="text-base font-bold text-fg">حجز الفستان</h3>
              <button onClick={onClose} className="text-fg-tertiary hover:text-fg transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Scrollable body — keeps the submit button reachable on small screens */}
            <div className="min-h-0 overflow-y-auto overscroll-contain">
            {/* Form */}
            {cart && (
              <div className="mx-5 mt-4 rounded-xl px-4 py-3 flex items-center justify-between"
                style={{ background: "rgba(196,40,85,0.07)", border: "1px solid rgba(196,40,85,0.12)" }}>
                <span className="text-[11px] font-bold text-fg">
                  {cart.itemCount > 1 ? `سلتكِ تحتوي على ${cart.itemCount} قطع — سيتم تأكيد الطلب كاملاً` : "تأكيد طلب السلة"}
                </span>
                <span className="text-xs font-bold text-brand tabular-nums">{cart.total} د.ل</span>
              </div>
            )}

            {preOrder && (
              <div className="mx-5 mt-4 rounded-xl px-4 py-3 flex items-center gap-2 text-[11px] font-semibold"
                style={{ background: "rgba(245,165,36,0.1)", border: "1px solid rgba(245,165,36,0.35)", color: "#b45309" }}>
                ⏳ هذا الفستان نفد حالياً — حجزكِ المسبق سيُؤكَّد فور توفر القطعة
              </div>
            )}

            {/* Per-item color/size selection (cart booking) */}
            {cart && (
              <div className="mx-5 mt-4 space-y-3 max-h-[40vh] overflow-y-auto">
                {cart.items.map((it, i) => {
                  const sel = selections[i] ?? { color: it.color, size: it.size };
                  return (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-line-subtle bg-white/50 p-3">
                      <img src={colorImageFor(it, sel.color)} alt={it.name} className="w-12 h-14 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-fg truncate">{it.name}</p>
                        <p className="text-[10px] text-fg-tertiary mt-0.5">الكمية: {it.quantity} — {it.price * it.quantity} د.ل</p>
                        <div className="flex items-center gap-2 mt-2">
                          <select
                            value={sel.color}
                            onChange={(e) => setSelections((prev) => ({ ...prev, [i]: { ...prev[i], color: e.target.value } }))}
                            className="flex-1 min-w-0 px-2.5 py-1.5 text-[11px] font-medium text-fg rounded-lg outline-none bg-white/70 border border-line-subtle"
                            aria-label={`اللون لـ ${it.name}`}
                          >
                            {it.colors.length > 0
                              ? it.colors.map((c) => <option key={c} value={c}>{c}</option>)
                              : <option value={sel.color}>{sel.color}</option>}
                          </select>
                          <select
                            value={sel.size}
                            onChange={(e) => setSelections((prev) => ({ ...prev, [i]: { ...prev[i], size: e.target.value } }))}
                            className="flex-1 min-w-0 px-2.5 py-1.5 text-[11px] font-medium text-fg rounded-lg outline-none bg-white/70 border border-line-subtle"
                            aria-label={`المقاس لـ ${it.name}`}
                          >
                            {it.sizes.length > 0
                              ? it.sizes.map((sz) => <option key={sz} value={sz}>{sz}</option>)
                              : <option value={sel.size}>{sel.size}</option>}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="p-5 space-y-4 text-start">
              {/* Product code (read-only) — single-product mode only */}
              {!cart && (
                <div>
                  <label className="text-[11px] font-semibold text-fg-tertiary block mb-1">كود المنتج</label>
                  <div className="w-full px-4 py-2.5 text-sm text-fg bg-white/50 rounded-xl border border-line-subtle opacity-70">
                    {productCode}
                  </div>
                </div>
              )}

              {/* Product name (read-only) — single-product mode only */}
              {!cart && (
                <div>
                  <label className="text-[11px] font-semibold text-fg-tertiary block mb-1">الفستان</label>
                  <div className="w-full px-4 py-2.5 text-sm text-fg bg-white/50 rounded-xl border border-line-subtle opacity-70">
                    {productName}
                  </div>
                </div>
              )}

              {/* Color selector — single-product mode only */}
              {!cart && colors.length > 0 && (
                <div>
                  <label className="text-[11px] font-semibold text-fg-tertiary block mb-2">اللون</label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                          selectedColor === c.name
                            ? "text-white"
                            : "text-fg bg-white/60 border border-line-subtle hover:bg-sunken"
                        }`}
                        style={selectedColor === c.name ? { background: "#c42855" } : undefined}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size selector — single-product mode only */}
              {!cart && sizes.length > 0 && (
                <div>
                  <label className="text-[11px] font-semibold text-fg-tertiary block mb-2">المقاس</label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSelectedSize(s)}
                        className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                          selectedSize === s
                            ? "text-white"
                            : "text-fg bg-white/60 border border-line-subtle hover:bg-sunken"
                        }`}
                        style={selectedSize === s ? { background: "#c42855" } : undefined}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Location — dropdown with cities + other option */}
              <div>
                <label className="text-[11px] font-semibold text-fg-tertiary block mb-1">
                  المدينة / المنطقة <span className="text-status-danger">*</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 text-sm text-fg bg-white/60 rounded-xl border border-line-subtle outline-none focus:border-accent-brand transition-colors appearance-none cursor-pointer"
                    style={{ direction: "rtl" }}
                  >
                    <option value="" disabled>اختر المدينة أو المنطقة</option>
                    {LIBYAN_CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={16}
                    className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ left: "14px", color: "#999" }}
                  />
                </div>

                {/* Show text input when "أخرى" is selected */}
                {isOtherCity && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      placeholder="اكتب اسم المدينة أو المنطقة"
                      className="w-full px-4 py-2.5 text-sm text-fg bg-white/60 rounded-xl border border-line-subtle outline-none focus:border-accent-brand transition-colors placeholder:text-fg-tertiary"
                    />
                  </div>
                )}
              </div>

              {/* Customer name */}
              <div>
                <label className="text-[11px] font-semibold text-fg-tertiary block mb-1">
                  الاسم الكريم <span className="text-status-danger">*</span>
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثال: نور الهدى"
                  required
                  minLength={2}
                  maxLength={60}
                  className="w-full px-4 py-2.5 text-sm text-fg bg-white/60 rounded-xl border border-line-subtle outline-none focus:border-accent-brand transition-colors placeholder:text-fg-tertiary"
                />
                <p className="text-[10px] text-fg-tertiary mt-1">سيظهر اسمكِ على شهادة الطلب</p>
              </div>

              {/* Phone */}

              <div>
                <label className="text-[11px] font-semibold text-fg-tertiary block mb-1">
                  رقم الهاتف <span className="text-status-danger">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912345678"
                  required
                  className="w-full px-4 py-2.5 text-sm text-fg bg-white/60 rounded-xl border border-line-subtle outline-none focus:border-accent-brand transition-colors placeholder:text-fg-tertiary"
                />
                <p className="text-[10px] text-fg-tertiary mt-1">مثال: 0912345678 — 10 أرقام تبدأ بـ 091 أو 092 أو 093 أو 094</p>
              </div>

              {/* Error */}
              {/* Coupon */}
              <div>
                <label className="text-[11px] font-semibold text-fg-tertiary block mb-1">
                  كود الخصم (اختياري)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponApplied(null); setCouponError(""); }}
                    placeholder="أدخلي كود الخصم"
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl outline-none transition-colors text-center"
                    style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(196,40,85,0.12)" }}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!couponCode.trim() || couponChecking) return;
                      setCouponChecking(true);
                      setCouponError("");
                      try {
                        const res = await fetch(`/api/coupons?code=${encodeURIComponent(couponCode.trim())}`);
                        let data: any = null;
                        try { data = await res.json(); } catch { data = null; }
                        if (!res.ok) throw new Error(data?.error || "كود الخصم غير صالح");
                        if (!data?.coupon) throw new Error("كود الخصم غير صالح");
                        setCouponApplied({
                          code: data.coupon.code,
                          label: data.coupon.label || "",
                          discount: data.coupon.type === "percent" ? data.coupon.value : data.coupon.value,
                        });
                      } catch (err: any) {
                        setCouponError(err.message || "كود غير صالح");
                        setCouponApplied(null);
                      } finally {
                        setCouponChecking(false);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #e63d6a, #c42855)" }}
                    disabled={couponChecking}
                  >
                    {couponChecking ? "..." : "تطبيق"}
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-[11px] text-status-success mt-1.5 flex items-center gap-1">
                    ✅ تم تطبيق الكود{couponApplied.label ? ` — ${couponApplied.label}` : ""}
                  </p>
                )}
                {couponError && <p className="text-[11px] text-status-danger mt-1.5">{couponError}</p>}
              </div>

              {/* WhatsApp consent */}
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="whatsapp-consent"
                  checked={whatsappConsent}
                  onChange={(e) => setWhatsappConsent(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-line-subtle accent-strawberry-600 cursor-pointer"
                />
                <label htmlFor="whatsapp-consent" className="text-[11px] text-fg-tertiary leading-relaxed cursor-pointer">
                  أوافق على تلقي إشعارات الطلب عبر <span className="font-semibold text-accent-brand">واتساب</span>
                </label>
              </div>

              {error && (
                <p ref={errorRef} className="text-xs text-status-danger">{error}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg, #e63d6a, #c42855)" }}
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    جاري الحجز...
                  </span>
                ) : (
                  "حجز الطلب"
                )}
              </button>

              <p className="text-[10px] text-fg-tertiary text-center leading-relaxed">
                الدفع عند الاستلام • سيتم تأكيد الطلب عبر الاتصال الهاتفي
              </p>
            </form>
            </div>
          </>
        ) : (
          /* Success state — luxury order confirmation card */
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
            <OrderSuccessCard
              orderId={orderId}
              customerName={certificate?.customerName || customerName.trim() || "—"}
              date={new Date().toLocaleDateString("ar-LY", { year: "numeric", month: "long", day: "numeric" })}
              pieceCount={cart ? cart.itemCount : 1}
              barcodeValue={pieceBarcode({
                orderId,
                sku: certificate?.items[0]?.code || productCode,
                pieceIndex: 1,
                date: new Date().toISOString(),
              })}
              barcodeHref={certificate?.items?.[0]?.id ? productPageUrl(certificate.items[0].id) : undefined}
              trackHref={`/track-order?orderNumber=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(submittedPhone || "")}`}
              onTrack={onClose}
              onContinue={onClose}
              onCertificate={certificate ? () => setCertOpen(true) : undefined}
              certificateAvailable={Boolean(certificate)}
              whatsappHref={orderId
                ? `https://wa.me/218944003708?text=${encodeURIComponent(`السلام عليكم، أريد الاستفسار عن طلبي رقم ${orderId}`)}`
                : undefined}
              cutouts
              className="w-full max-w-md mx-auto"
            >
              {certificate && (
                <OrderDetails
                  compact
                  unified
                  showPieceBarcodes={false}
                  orderId={orderId}
                  status="pending"
                  createdAt={new Date().toISOString()}
                  pieces={successPieces}
                  onCertificate={() => setCertOpen(true)}
                />
              )}
            </OrderSuccessCard>
          </div>
        )}
      </div>

      <Suspense fallback={null}>
        <OrderCertificateModal open={certOpen} onClose={() => setCertOpen(false)} data={certificate} />
      </Suspense>
    </div>
  );
}
