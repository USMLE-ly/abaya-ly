import { useState } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle } from "lucide-react";
import { Button, Input, Textarea } from "@/components/velar";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); };

  return (
    <section className="py-16 md:py-24">
      <div className="w-full max-w-[600px] mx-auto px-4 sm:px-6">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-fg text-center mb-3">
          تواصلي <span className="text-accent-brand">معنا</span>
        </h2>
        <p className="text-sm text-fg-tertiary text-center mb-10">
          يسعدنا سماعكِ — أرسلي لنا رسالة وسنرد عليكِ في أقرب وقت
        </p>
        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12 glass-card">
            <CheckCircle size={48} className="mx-auto text-status-success mb-4" />
            <h3 className="text-lg font-semibold text-fg mb-2">شكراً لتواصلكِ!</h3>
            <p className="text-sm text-fg-tertiary">سنرد عليكِ خلال ٢٤ ساعة</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 glass-card p-6 md:p-8" style={{ direction: "rtl" }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="الاسم" required type="text" placeholder="" />
              <Input label="البريد الإلكتروني" required type="email" placeholder="" />
            </div>
            <Input label="رقم الهاتف" type="tel" placeholder="" />
            <Textarea label="الرسالة" required rows={4} className="resize-none" />
            <Button type="submit" variant="primary" block leadingIcon={<Send size={16} />}>
              إرسال
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
