import { useState } from "react";
import { motion } from "framer-motion";
import { Package, CheckCircle, Truck, MapPin } from "lucide-react";

export function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [tracked, setTracked] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTracked(true);
  };

  return (
    <div className="bg-bg-2 min-h-screen">
      {/* ─── PAGE HEADER ─── */}
      <section className="pt-24 pb-10 md:pt-28 md:pb-14">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-text mb-3">
            تتبع <span className="text-brand">طلبكِ</span>
          </h1>
          <p className="text-sm text-text-light">
            أدخلي رقم الطلب والبريد الإلكتروني لمتابعة شحنتكِ
          </p>
        </div>
      </section>

      {/* ─── FORM / RESULT ─── */}
      <section className="pb-16">
        <div className="max-w-[500px] mx-auto px-4 sm:px-6">
          {!tracked ? (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl border border-border p-6 md:p-8"
            >
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1.5">
                    رقم الطلب
                  </label>
                  <input
                    type="text"
                    required
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="#12345"
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-text mb-1.5">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-brand text-white font-semibold rounded-xl hover:bg-brand-dark transition-colors text-sm"
                >
                  تتبع الطلب
                </button>
              </div>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-border p-6 md:p-8"
            >
              <div className="text-center mb-8">
                <Package size={40} className="mx-auto text-brand mb-3" />
                <h2 className="text-lg font-semibold text-text">
                  طلب رقم {orderNumber}
                </h2>
                <p className="text-xs text-text-light">آخر تحديث: اليوم</p>
              </div>

              <div className="space-y-5">
                {[
                  { icon: CheckCircle, label: "تم تأكيد الطلب", time: "اليوم ١٠:٠٠ ص", done: true },
                  { icon: Package, label: "جاري التجهيز", time: "اليوم ٢:٠٠ م", done: true },
                  { icon: Truck, label: "تم الشحن", time: "قريباً", done: false },
                  { icon: MapPin, label: "التوصيل", time: "قريباً", done: false },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                        step.done
                          ? "bg-green-100 text-green-600"
                          : "bg-bg-2 text-text-light"
                      }`}
                    >
                      <step.icon size={16} />
                    </div>
                    <div className="flex-1">
                      <p
                        className={`text-xs font-medium ${
                          step.done ? "text-text" : "text-text-light"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-[10px] text-text-light">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setTracked(false)}
                className="w-full mt-8 py-3 border border-border text-text font-medium rounded-xl hover:bg-bg-2 transition-colors text-xs"
              >
                تتبع طلب آخر
              </button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
