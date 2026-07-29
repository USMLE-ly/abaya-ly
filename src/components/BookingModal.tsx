import { useState } from "react";
import { X, Check, Loader2, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  productCode: string;
  productName: string;
  colors: { name: string; hex: string }[];
  sizes: string[];
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

export function BookingModal({ open, onClose, productCode, productName, colors, sizes }: BookingModalProps) {
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
          code: productCode,
          name: productName,
          color: selectedColor,
          size: selectedSize,
          location: locationValue,
          phone: phone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error("فشل الإرسال");

      if (data.orderId) setOrderId(data.orderId);
      setSubmittedPhone(phone.trim());
      setDone(true);
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
            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-right">
              {/* Product code (read-only) */}
              <div>
                <label className="text-[11px] font-semibold text-fg-tertiary block mb-1">كود المنتج</label>
                <div className="w-full px-4 py-2.5 text-sm text-fg bg-white/50 rounded-xl border border-line-subtle opacity-70">
                  {productCode}
                </div>
              </div>

              {/* Product name (read-only) */}
              <div>
                <label className="text-[11px] font-semibold text-fg-tertiary block mb-1">الفستان</label>
                <div className="w-full px-4 py-2.5 text-sm text-fg bg-white/50 rounded-xl border border-line-subtle opacity-70">
                  {productName}
                </div>
              </div>

              {/* Color selector */}
              {colors.length > 0 && (
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

              {/* Size selector */}
              {sizes.length > 0 && (
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
              سيتم الاتصال بسادتكم خلال 24 ساعه لتأكيد الطلب
            </p>
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
