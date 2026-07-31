import { useEffect, useState } from "react";
import { X, Check, Loader2, ChevronDown, PackageSearch } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

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

export function BookingModal({ open, onClose, productCode, productName, colors, sizes, presetCoupon = "", cart = null, onSuccess, preOrder = false }: BookingModalProps) {
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name || "");
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");
  const [selectedCity, setSelectedCity] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [submittedPhone, setSubmittedPhone] = useState("");
  const [whatsappConsent, setWhatsappConsent] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; label: string; discount: number } | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [wantCustomFit, setWantCustomFit] = useState(false);
  const [measurements, setMeasurements] = useState({ height: "", chest: "", waist: "", hips: "" });
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

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: cart ? cart.codes : productCode,
          name: cart ? cart.names : productName,
          color: cart ? `${cart.itemCount} قطع` : selectedColor,
          size: cart ? "" : selectedSize,
          items: cart?.items.map((it, i) => {
            const sel = selections[i] ?? { color: it.color, size: it.size };
            return {
              id: it.id,
              name: it.name,
              color: sel.color,
              size: sel.size,
              quantity: it.quantity,
              price: it.price,
            };
          }),
          location: locationValue,
          phone: phone.trim(),
          whatsappConsent,
          couponCode: couponApplied?.code || "",
          preOrder,
          customMeasurements: wantCustomFit
            ? {
                height: measurements.height.trim(),
                chest: measurements.chest.trim(),
                waist: measurements.waist.trim(),
                hips: measurements.hips.trim(),
              }
            : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error("فشل الإرسال");

      if (data.orderId) setOrderId(data.orderId);
      setSubmittedPhone(phone.trim());
      setDone(true);
      onSuccess?.();
    } catch {
      setError("حدث خطأ، يرجى المحاولة مرة أخرى أو الاتصال بنا عبر واتساب");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(17,15,13,0.70)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(24px)", border: "1px solid rgba(196,40,85,0.12)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {!done ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-line-subtle">
              <h3 className="text-base font-bold text-fg">حجز الفستان</h3>
              <button onClick={onClose} className="text-fg-tertiary hover:text-fg transition-colors">
                <X size={18} />
              </button>
            </div>

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
                      <img src={it.image} alt={it.name} className="w-12 h-14 rounded-lg object-cover flex-shrink-0" />
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

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-start">
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

              {/* Custom tailoring (تفصيل حسب المقاس) */}
              <div className="rounded-xl border border-line-subtle bg-white/40 p-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wantCustomFit}
                    onChange={(e) => setWantCustomFit(e.target.checked)}
                    className="w-4 h-4 rounded accent-strawberry-600 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-fg">تفصيل حسب المقاس <span className="text-[10px] font-bold text-brand">(مجاناً)</span></span>
                </label>
                {wantCustomFit && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="grid grid-cols-2 gap-3 mt-3 overflow-hidden"
                  >
                    {([
                      ["height", "الطول (سم)"],
                      ["chest", "الصدر (سم)"],
                      ["waist", "الخصر (سم)"],
                      ["hips", "الأرداف (سم)"],
                    ] as const).map(([key, label]) => (
                      <div key={key}>
                        <label className="text-[10px] font-semibold text-fg-tertiary block mb-1">{label}</label>
                        <input
                          type="number"
                          value={measurements[key]}
                          onChange={(e) => setMeasurements((prev) => ({ ...prev, [key]: e.target.value }))}
                          placeholder="مثال: 90"
                          className="w-full px-3 py-2 text-sm text-fg bg-white/60 rounded-xl border border-line-subtle outline-none focus:border-accent-brand transition-colors placeholder:text-fg-tertiary"
                        />
                      </div>
                    ))}
                    <p className="col-span-2 text-[10px] text-fg-tertiary leading-relaxed">
                      سنفصّل الفستان على مقاسكِ بدقة — سنأخذ القياسات النهائية معكِ عند الاتصال بالتأكيد.
                    </p>
                  </motion.div>
                )}
              </div>

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
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || "كود غير صالح");
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
                <p className="text-xs text-status-danger">{error}</p>
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
          </>
        ) : (
          /* Success state — order number is now clickable */
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(196,40,85,0.1)" }}>
              <Check size={28} className="text-accent-brand" />
            </div>
            <h3 className="text-base font-bold text-fg mb-2">✅ تم استلام طلبك بنجاح!</h3>
            {orderId && (
              <a
                href={`https://wa.me/218944003708?text=السلام%20عليكم،%20أريد%20الاستفسار%20عن%20طلبي%20رقم%20${orderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm font-semibold mb-2 transition-all hover:scale-105"
                style={{ color: "#c42855" }}
              >
                رقم الطلب: {orderId} ← استفسري عبر واتساب
              </a>
            )}
            <p className="text-sm text-fg-tertiary leading-relaxed mt-2">
              سيتم الاتصال بسادتكم خلال 24 ساعة لتأكيد الطلب
            </p>

            {orderId && submittedPhone && (
              <Link
                to={`/track-order?orderNumber=${encodeURIComponent(orderId)}&phone=${encodeURIComponent(submittedPhone)}`}
                onClick={onClose}
                className="inline-flex items-center gap-1.5 mt-4 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all hover:scale-105"
                style={{ background: "linear-gradient(135deg, #e63d6a, #c42855)" }}
              >
                <PackageSearch size={14} />
                تتبعي طلبكِ الآن
              </Link>
            )}

            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{ background: "#c42855" }}
            >
              متابعة التسوق
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
