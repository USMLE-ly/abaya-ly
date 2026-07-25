import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); };

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-[600px] mx-auto px-4 sm:px-6">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-3">
          تواصلي <span className="text-primary">معنا</span>
        </h2>
        <p className="text-sm text-foreground/50 text-center mb-10">
          يسعدنا سماعكِ — أرسلي لنا رسالة وسنرد عليكِ في أقرب وقت
        </p>
        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 glass-card">
            <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">شكراً لتواصلكِ!</h3>
            <p className="text-sm text-foreground/50">سنرد عليكِ خلال ٢٤ ساعة</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 glass-card p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5">الاسم</label>
                <input type="text" required className="w-full px-4 py-2.5 rounded-xl glass-input text-sm transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground/60 mb-1.5">البريد الإلكتروني</label>
                <input type="email" required className="w-full px-4 py-2.5 rounded-xl glass-input text-sm transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/60 mb-1.5">رقم الهاتف</label>
              <input type="tel" className="w-full px-4 py-2.5 rounded-xl glass-input text-sm transition-all" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground/60 mb-1.5">الرسالة</label>
              <textarea rows={4} required className="w-full px-4 py-2.5 rounded-xl glass-input text-sm transition-all resize-none" />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors text-sm">
              <Send size={16} />
              <span>إرسال</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
