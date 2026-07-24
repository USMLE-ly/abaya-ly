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
    <div className="pt-20 pb-16 min-h-screen bg-bg-2">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-text mb-4">
            تتبع <span className="text-brand">طلبكِ</span>
          </h1>
          <p className="text-text-light">أدخلي رقم الطلب والبريد الإلكتروني لمتابعة شحنتكِ</p>
        </div>

        {!tracked ? (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-text mb-2">رقم الطلب</label>
                <input
                  type="text"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="#12345"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                />
              </div>
              <button type="submit" className="w-full py-3 bg-brand text-white font-semibold rounded-full hover:bg-brand-dark transition-colors">
                تتبع الطلب
              </button>
            </div>
          </form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-border p-8"
          >
            <div className="text-center mb-8">
              <Package size={48} className="mx-auto text-brand mb-4" />
              <h2 className="text-xl font-semibold text-text">طلب رقم {orderNumber}</h2>
              <p className="text-text-light text-sm">آخر تحديث: اليوم</p>
            </div>

            <div className="space-y-6">
              {[
                { icon: CheckCircle, label: "تم تأكيد الطلب", time: "اليوم ١٠:٠٠ ص", done: true },
                { icon: Package, label: "جاري التجهيز", time: "اليوم ٢:٠٠ م", done: true },
                { icon: Truck, label: "تم الشحن", time: "قريباً", done: false },
                { icon: MapPin, label: "التوصيل", time: "قريباً", done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? "bg-green-100 text-green-600" : "bg-bg-2 text-text-light"}`}>
                    <step.icon size={18} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${step.done ? "text-text" : "text-text-light"}`}>{step.label}</p>
                    <p className="text-xs text-text-light">{step.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setTracked(false)} className="w-full mt-8 py-3 border border-border text-text font-medium rounded-full hover:bg-bg-2 transition-colors">
              تتبع طلب آخر
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
