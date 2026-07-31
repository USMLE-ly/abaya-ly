import { useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { motion } from "framer-motion";
import { Package, CheckCircle, Truck, MapPin, Search, Loader2, Clock, MessageCircle } from "lucide-react";

const STATUS_STEPS = [
  { key: "pending",   icon: Clock,       label: "انتظار التأكيد" },
  { key: "processing",icon: Package,      label: "جاري التجهيز" },
  { key: "waiting_shipping", icon: Package, label: "في انتظار الشحن" },
  { key: "shipped",   icon: Truck,        label: "جاري الشحن" },
  { key: "delivered", icon: MapPin,       label: "تم التوصيل" },
];

const STATUS_ORDER = ["pending", "processing", "waiting_shipping", "shipped", "delivered"];

// Delivery estimates based on status
const ETA_MAP: Record<string, string> = {
  pending:    "سيتم الاتصال بكِ لتأكيد الطلب خلال 24 ساعة",
  processing: "سيتم الشحن خلال 2-3 أيام عمل من تاريخ التأكيد",
  waiting_shipping: "الطلب في انتظار وصول الشحنة إلى مركز الشحن",
  shipped:    "سيتم التوصيل إلى عنوانكِ خلال 1-3 أيام عمل",
  delivered:  "تم تسليم الطلب ✓",
};


export function TrackOrder() {
  return <PageTransition><TrackOrderContent /></PageTransition>;
}

function TrackOrderContent() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

  const getStatusIndex = (status: string) => {
    const idx = STATUS_ORDER.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="min-h-screen">
      <section className="pt-24 pb-10 md:pt-28 md:pb-14">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-fg mb-3">تتبع <span className="text-accent-brand">طلبكِ</span></h1>
          <p className="text-sm text-fg-tertiary">أدخلي رقم الطلب ورقم الهاتف لمتابعة حالة طلبكِ</p>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-[500px] mx-auto px-4 sm:px-6">
          {/* Search form */}
          <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 mb-6">
            <div className="space-y-4">
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
                  className="w-full px-4 py-2.5 text-sm text-fg bg-white/60 rounded-xl border border-line-subtle outline-none focus:border-accent-brand transition-colors placeholder:text-fg-tertiary text-center"
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
                  className="w-full px-4 py-2.5 text-sm text-fg bg-white/60 rounded-xl border border-line-subtle outline-none focus:border-accent-brand transition-colors placeholder:text-fg-tertiary text-center"
                />
              </div>

              {error && <p className="text-xs text-status-danger text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #e63d6a, #c42855)" }}
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin" /> جاري البحث...</>
                ) : (
                  <><Search size={16} /> تتبع الطلب</>
                )}
              </button>
            </div>
          </form>

          {/* Loading */}
          {loading && (
            <div className="text-center py-10">
              <Loader2 size={32} className="mx-auto animate-spin" style={{ color: "#c42855" }} />
            </div>
          )}

          {/* Not found */}
          {!loading && searched && !order && (
            <div className="glass-card p-8 text-center">
              <Package size={40} className="mx-auto text-fg-disabled mb-3" />
              <p className="text-sm text-fg-tertiary">لم يتم العثور على طلب بهذه البيانات</p>
              <p className="text-[10px] text-fg-tertiary mt-2">تأكدي من رقم الطلب ورقم الهاتف المستخدم في الحجز</p>
            </div>
          )}

          {/* Order found — show timeline */}
          {!loading && order && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 md:p-8"
            >
              {/* Order header */}
              <div className="text-center mb-6">
                <Package size={36} className="mx-auto mb-2" style={{ color: "#c42855" }} />
                <h2 className="text-lg font-semibold text-fg">{order.orderId}</h2>
                <span
                  className="inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2"
                  style={{
                    background: order.status === "pending" ? "rgba(234,179,8,0.15)" :
                                order.status === "processing" ? "rgba(59,130,246,0.15)" :
                                order.status === "shipped" ? "rgba(168,85,247,0.15)" :
                                "rgba(34,197,94,0.15)",
                    color: order.status === "pending" ? "#a16207" :
                           order.status === "processing" ? "#2563eb" :
                           order.status === "shipped" ? "#7c3aed" :
                           "#16a34a",
                  }}
                >
                  {order.statusLabel}
                </span>
              </div>

              {/* Order details */}
              <div className="bg-white/40 rounded-xl p-4 mb-6 text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-fg-tertiary">الفستان</span>
                  <span className="text-fg font-medium">{order.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fg-tertiary">الكود</span>
                  <span className="text-fg font-medium">{order.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fg-tertiary">اللون / المقاس</span>
                  <span className="text-fg font-medium">{order.color} • {order.size}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fg-tertiary">الموقع</span>
                  <span className="text-fg font-medium">{order.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-fg-tertiary">تاريخ الطلب</span>
                  <span className="text-fg font-medium">
                    {new Date(order.createdAt).toLocaleDateString("ar-LY", {
                      year: "numeric", month: "long", day: "numeric"
                    })}
                  </span>
                </div>
              </div>

              {/* Status timeline */}
              <div className="space-y-4">
                {STATUS_STEPS.map((step, i) => {
                  const statusIdx = getStatusIndex(order.status);
                  const done = statusIdx >= i;
                  const isCurrent = statusIdx === i;

                  return (
                    <div key={step.key} className="flex items-center gap-3 relative">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                          done
                            ? "border-2"
                            : "glass"
                        }`}
                        style={{
                          background: done
                            ? i === 0 ? "rgba(234,179,8,0.12)" :
                              i === 1 ? "rgba(59,130,246,0.12)" :
                              i === 2 ? "rgba(168,85,247,0.12)" :
                              "rgba(34,197,94,0.12)"
                            : undefined,
                          borderColor: done
                            ? i === 0 ? "rgba(234,179,8,0.3)" :
                              i === 1 ? "rgba(59,130,246,0.3)" :
                              i === 2 ? "rgba(168,85,247,0.3)" :
                              "rgba(34,197,94,0.3)"
                            : "transparent",
                          ...(isCurrent ? {
                            boxShadow: `0 0 0 4px ${
                              i === 0 ? "rgba(234,179,8,0.15)" :
                              i === 1 ? "rgba(59,130,246,0.15)" :
                              i === 2 ? "rgba(168,85,247,0.15)" :
                              "rgba(34,197,94,0.15)"
                            }`,
                          } : {}),
                        }}
                      >
                        <step.icon
                          size={17}
                          className={done ? (
                            i === 0 ? "text-amber-600" :
                            i === 1 ? "text-blue-600" :
                            i === 2 ? "text-purple-600" :
                            "text-green-600"
                          ) : "text-fg-disabled"}
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className={`text-sm font-semibold ${
                            done ? "text-fg" : "text-fg-disabled"
                          } ${isCurrent ? "" : ""}`}
                          style={isCurrent ? {
                            color: i === 0 ? "#a16207" :
                                   i === 1 ? "#2563eb" :
                                   i === 2 ? "#7c3aed" :
                                   "#16a34a"
                          } : {}}
                        >
                          {step.label}
                          {isCurrent && " (الحالية)"}
                        </p>
                      </div>

                      {/* Connector line */}
                      {i < STATUS_STEPS.length - 1 && (
                        <div
                          className="absolute w-0.5 h-6"
                          style={{
                            left: "19px",
                            top: "40px",
                            background: done && i < statusIdx
                              ? "rgba(34,197,94,0.3)"
                              : "rgba(0,0,0,0.06)",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Payment method */}
              <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(196,40,85,0.04)", border: "1px solid rgba(196,40,85,0.08)" }}>
                <div className="flex items-center justify-between">
                  <p className="text-[12px] font-bold text-fg">طريقة الدفع</p>
                  <span className="text-[12px] font-semibold text-fg-secondary">
                    {order.paymentMethod === "transfer" ? "حوالة بنكية 🏦" :
                     order.paymentMethod === "card" ? "بطاقة 💳" : "عند الاستلام 💵"}
                  </span>
                </div>
              </div>

              {/* Estimated delivery date */}
              <div className="mt-6 p-4 rounded-xl" style={{ background: "rgba(196,40,85,0.06)", border: "1px solid rgba(196,40,85,0.1)" }}>
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={14} className="text-accent-brand" />
                  <p className="text-[12px] font-bold text-fg">وقت التوصيل المتوقع</p>
                </div>
                <p className="text-[13px] text-fg-secondary leading-relaxed mr-6">
                  {ETA_MAP[order.status] || "سيتم تحديث وقت التوصيل عند تأكيد الطلب"}
                </p>
                {order.status !== "delivered" && (
                  <p className="text-[11px] text-fg-tertiary mr-6 mt-1">
                    * التوقيت تقديري وقد يختلف حسب المدينة والظروف
                  </p>
                )}
              </div>

              {/* Contact WhatsApp */}
              <div className="mt-6 pt-4 border-t border-line-subtle text-center">
                <p className="text-[11px] text-fg-tertiary mb-3">للاستفسار عن طلبك، تواصلي معنا عبر واتساب</p>
                <a
                  href={`https://wa.me/218944003708?text=${encodeURIComponent(
                    `السلام عليكم، أريد الاستفسار عن طلبي رقم ${order.orderId}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:scale-105"
                  style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
                >
                  <MessageCircle size={16} />
                  استفسري عبر واتساب
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
