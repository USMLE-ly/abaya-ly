import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Package, ChevronLeft } from "lucide-react";

export function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");

  const whatsappUrl = orderNumber.trim()
    ? `https://wa.me/218944003708?text=${encodeURIComponent(
        `السلام عليكم، أريد الاستفسار عن طلبي رقم ${orderNumber.trim()}`
      )}`
    : "https://wa.me/218944003708";

  return (
    <div className="min-h-screen">
      <section className="pt-24 pb-10 md:pt-28 md:pb-14">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-fg mb-3">تتبع <span className="text-accent-brand">طلبكِ</span></h1>
          <p className="text-sm text-fg-tertiary">أدخلي رقم الطلب للاستفسار عنه عبر واتساب</p>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-[500px] mx-auto px-4 sm:px-6">
          {/* Order number input */}
          <div className="glass-card p-6 md:p-8 mb-6">
            <div className="space-y-5">
              <div>
                <label className="text-[11px] font-semibold text-fg-tertiary block mb-1">
                  رقم الطلب <span className="text-status-danger">*</span>
                </label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="NAD-XXXX"
                  className="w-full px-4 py-2.5 text-sm text-fg bg-white/60 rounded-xl border border-line-subtle outline-none focus:border-accent-brand transition-colors placeholder:text-fg-tertiary text-center"
                  dir="ltr"
                />
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #25D366, #128C7E)" }}
              >
                <MessageCircle size={18} />
                استفسري عبر واتساب
              </a>

              <p className="text-[10px] text-fg-tertiary text-center leading-relaxed">
                سيتم الرد على استفسارك مباشرة عبر واتساب
              </p>
            </div>
          </div>

          {/* How it works */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 md:p-8"
          >
            <h3 className="text-sm font-bold text-fg mb-4 text-center">مراحل الطلب</h3>
            <div className="space-y-4">
              {[
                { label: "انتظار التأكيد", desc: "يتم مراجعة الطلب من قبل فريق نادين", done: false },
                { label: "جاري التجهيز", desc: "يتم تجهيز الطلب للتوصيل", done: false },
                { label: "جاري الشحن", desc: "تم شحن الطلب إلى عنوانك", done: false },
                { label: "تم التوصيل", desc: "تم تسليم الطلب بنجاح", done: false },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full glass flex items-center justify-center flex-shrink-0 text-fg-disabled">
                    <Package size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-fg-disabled">{step.label}</p>
                    <p className="text-[10px] text-fg-tertiary">{step.desc}</p>
                  </div>
                  <ChevronLeft size={14} className="text-fg-quaternary flex-shrink-0" />
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-line-subtle text-center">
              <p className="text-[11px] text-fg-tertiary">
                للاستعلام عن حالة طلبك، تواصلي معنا عبر واتساب برقم الطلب
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
