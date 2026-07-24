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
    <section className="py-20 bg-bg-2">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text mb-4">
            تواصلي <span className="text-brand">معنا</span>
          </h2>
          <p className="text-text-light">يسعدنا سماعكِ — أرسلي لنا رسالة وسنرد عليكِ في أقرب وقت</p>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h3 className="text-xl font-semibold text-text mb-2">شكراً لتواصلكِ!</h3>
            <p className="text-text-light">سنرد عليكِ خلال ٢٤ ساعة</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text mb-2">الاسم</label>
                <input type="text" required className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">البريد الإلكتروني</label>
                <input type="email" required className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">رقم الهاتف</label>
              <input type="tel" className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-2">الرسالة</label>
              <textarea rows={4} required className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors resize-none" />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 px-8 py-3 bg-brand text-white font-semibold rounded-full hover:bg-brand-dark transition-colors">
              <Send size={18} />
              <span>إرسال</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
