import { useState } from "react";
import { motion } from "framer-motion";
import { Package, CheckCircle, Truck, MapPin } from "lucide-react";
import { Button, Input } from "@/components/velar";

export function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [tracked, setTracked] = useState(false);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setTracked(true); };

  return (
    <div className="min-h-screen">
      <section className="pt-24 pb-10 md:pt-28 md:pb-14">
        <div className="max-w-5xl px-4 sm:px-6 text-right">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-fg mb-3">تتبع <span className="text-accent-brand">طلبكِ</span></h1>
          <p className="text-sm text-fg-tertiary">أدخلي رقم الطلب والبريد الإلكتروني لمتابعة شحنتكِ</p>
        </div>
      </section>
      <section className="pb-16">
        <div className="max-w-xl px-4 sm:px-6">
          {!tracked ? (
            <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8">
              <div className="space-y-5">
                <Input
                  label="رقم الطلب"
                  required
                  type="text"
                  value={orderNumber}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrderNumber(e.target.value)}
                  placeholder="#12345"
                />
                <Input
                  label="البريد الإلكتروني"
                  required
                  type="email"
                  placeholder=""
                />
                <Button type="submit" variant="primary" block>
                  تتبع الطلب
                </Button>
              </div>
            </form>
          ) : (
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 md:p-8">
              <div className="text-center mb-8">
                <Package size={40} className="mx-auto text-accent-brand mb-3" />
                <h2 className="text-lg font-semibold text-fg">طلب رقم {orderNumber}</h2>
                <p className="text-xs text-fg-tertiary">آخر تحديث: اليوم</p>
              </div>
              <div className="space-y-5">
                {[
                  { icon: CheckCircle, label: "تم تأكيد الطلب", time: "اليوم 10:00 ص", done: true },
                  { icon: Package, label: "جاري التجهيز", time: "اليوم 2:00 م", done: true },
                  { icon: Truck, label: "تم الشحن", time: "قريباً", done: false },
                  { icon: MapPin, label: "التوصيل", time: "قريباً", done: false },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? "bg-status-success/10 border border-status-success/20 text-status-success" : "glass text-fg-disabled"}`}><step.icon size={16} /></div>
                    <div className="flex-1">
                      <p className={`text-xs font-medium ${step.done ? "text-fg" : "text-fg-disabled"}`}>{step.label}</p>
                      <p className="text-[10px] text-fg-disabled">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button onClick={() => setTracked(false)} variant="tertiary" block className="mt-8">
                تتبع طلب آخر
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
