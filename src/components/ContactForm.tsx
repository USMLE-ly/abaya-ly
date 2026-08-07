import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Send, CheckCircle, Loader2 } from "lucide-react";
import { Button, Input, Textarea } from "@/components/velar";
import { trackLead } from "@/lib/analytics";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const phoneDigits = String(data.get("phone") || "").trim().replace(/\s/g, "");
    if (!/^(091|092|093|094)\d{7}$/.test(phoneDigits)) {
      setError("يرجى إدخال رقم هاتف صحيح (10 أرقام تبدأ بـ 091 أو 092 أو 093 أو 094)");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") || "").trim(),
          phone: phoneDigits,
          message: String(data.get("message") || "").trim(),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || "حدث خطأ، يرجى المحاولة لاحقاً");
        return;
      }
      trackLead("Contact Form");
      form.reset();
      setSubmitted(true);
    } catch {
      setError("تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="py-16 md:py-24">
      <div className="w-full max-w-[600px] mx-auto px-4 sm:px-6">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-fg text-center mb-3">
          تواصلي <span className="text-accent-brand">معنا</span>
        </h2>
        <p className="text-sm text-fg-tertiary text-center mb-10">
          سؤال عن مقاس، طلب، أو مناسبة؟ اكتبي لنا. نرد خلال ساعات النهار.
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
              <Input label="الاسم" required type="text" name="name" placeholder="اسمكِ الكريم" />
              <Input label="رقم الهاتف" required type="tel" name="phone" placeholder="09XXXXXXXX" dir="ltr" />
            </div>
            <Textarea label="الرسالة" required name="message" rows={4} className="resize-none" placeholder="كيف يمكننا مساعدتكِ؟" />
            {error && <p className="text-xs text-status-danger">{error}</p>}
            <Button type="submit" variant="primary" block leadingIcon={sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} disabled={sending}>
              {sending ? "جاري الإرسال..." : "إرسال"}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}
