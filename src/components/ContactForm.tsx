import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="py-16 md:py-24 bg-bg-2">
      <div className="max-w-[600px] mx-auto px-4 sm:px-6">
        {/* Heading — centered */}
        <h2 className="font-display text-2xl md:text-3xl font-bold text-text text-center mb-3">
          تواصلي <span className="text-brand">معنا</span>
        </h2>
        <p className="text-sm text-text-light text-center mb-10">
          يسعدنا سماعكِ — أرسلي لنا رسالة وسنرد عليكِ في أقرب وقت
        </p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12 bg-white rounded-2xl border border-green-200"
          >
            <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-text mb-2">شكراً لتواصلكِ!</h3>
            <p className="text-sm text-text-light">سنرد عليكِ خلال ٢٤ ساعة</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-2xl p-6 md:p-8 border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-text mb-1.5">
                  الاسم
                </label>
                <input
                  type="text"
                  required
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
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5">
                رقم الهاتف
              </label>
              <input
                type="tel"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text mb-1.5">
                الرسالة
              </label>
              <textarea
                rows={4}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-bg-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-brand text-white font-semibold rounded-xl hover:bg-brand-dark transition-colors text-sm"
            >
              <Send size={16} />
              <span>إرسال</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
