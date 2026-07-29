import { useState } from "react";
import { motion } from "framer-motion";
import { Package, CheckCircle, Truck, MapPin, Search, Loader2 } from "lucide-react";

interface Order {
  orderId: string;
  code: string;
  name: string;
  color: string;
  size: string;
  location: string;
  phone: string;
  status: string;
  statusLabel: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_STEPS = [
  { key: "received", icon: CheckCircle, label: "تم تأكيد الطلب" },
  { key: "processing", icon: Package, label: "قيد التجهيز" },
  { key: "shipped", icon: Truck, label: "تم الشحن" },
  { key: "delivered", icon: MapPin, label: "تم التوصيل" },
];

const STATUS_ORDER = ["received", "processing", "shipped", "delivered"];

export function TrackOrder() {
  const [phone, setPhone] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

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

    setError("");
    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/track-order?phone=${encodeURIComponent(phone.trim())}`);
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      setError("حدث خطأ، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status: string) => STATUS_ORDER.indexOf(status);

  return (
    <div className="min-h-screen">
      <section className="pt-24 pb-10 md:pt-28 md:pb-14">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-fg mb-3">تتبع <span className="text-accent-brand">طلبكِ</span></h1>
          <p className="text-sm text-fg-tertiary">أدخلي رقم الهاتف المستخدم في الحجز لمتابعة طلباتكِ</p>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-[500px] mx-auto px-4 sm:px-6">
          {/* Search form */}
          <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 mb-6">
            <div className="space-y-5">
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
                  className="w-full px-4 py-2.5 text-sm text-fg bg-white/60 rounded-xl border border-line-subtle outline-none focus:border-accent-brand transition-colors placeholder:text-fg-tertiary text-center"
                />
                <p className="text-[10px] text-fg-tertiary mt-1 text-center">مثال: 0912345678</p>
              </div>

              {error && <p className="text-xs text-status-danger text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #e63d6a, #c42855)" }}
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    جاري البحث...
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    تتبع طلباتي
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Results */}
          {loading && (
            <div className="text-center py-10">
              <Loader2 size={32} className="mx-auto animate-spin" style={{ color: "#c42855" }} />
            </div>
          )}

          {!loading && searched && orders.length === 0 && (
            <div className="glass-card p-8 text-center">
              <Package size={40} className="mx-auto text-fg-disabled mb-3" />
              <p className="text-sm text-fg-tertiary">لا توجد طلبات مرتبطة بهذا الرقم</p>
            </div>
          )}

          {!loading && orders.length > 0 && (
            <div className="space-y-6">
              {orders.map((order) => {
                const statusIdx = getStatusIndex(order.status);
                return (
                  <motion.div
                    key={order.orderId}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 md:p-8"
                  >
                    {/* Order header */}
                    <div className="text-center mb-6">
                      <Package size={36} className="mx-auto mb-2" style={{ color: "#c42855" }} />
                      <h2 className="text-lg font-semibold text-fg">{order.orderId}</h2>
                      <p className="text-xs text-fg-tertiary">
                        {new Date(order.createdAt).toLocaleDateString("ar-LY", {
                          weekday: "long", year: "numeric", month: "long", day: "numeric",
                        })}
                      </p>
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
                        <span className="text-fg-tertiary">رقم الهاتف</span>
                        <span className="text-fg font-medium" dir="ltr">{order.phone}</span>
                      </div>
                    </div>

                    {/* Status timeline */}
                    <div className="space-y-4">
                      {STATUS_STEPS.map((step, i) => {
                        const done = statusIdx >= i;
                        return (
                          <div key={step.key} className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                                done
                                  ? "border-2 border-status-success/30"
                                  : "glass text-fg-disabled"
                              }`}
                              style={done ? { background: "rgba(34,197,94,0.1)" } : undefined}
                            >
                              <step.icon
                                size={16}
                                className={done ? "text-status-success" : "text-fg-disabled"}
                              />
                            </div>
                            <div className="flex-1">
                              <p
                                className={`text-xs font-medium ${
                                  done ? "text-fg" : "text-fg-disabled"
                                }`}
                              >
                                {step.label}
                              </p>
                            </div>
                            {i < STATUS_STEPS.length - 1 && (
                              <div
                                className="w-0.5 h-6 absolute mr-[18px] mt-10"
                                style={{
                                  background: done
                                    ? "rgba(34,197,94,0.3)"
                                    : "rgba(0,0,0,0.06)",
                                }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
