import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Check, Loader2 } from "lucide-react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("يرجى إدخال بريد إلكتروني صحيح");
      return;
    }
    setError("");
    setLoading(true);
    // Simulate (store in localStorage for now — API-ready)
    try {
      const existing = JSON.parse(localStorage.getItem("nadine-subscribers") || "[]");
      if (!existing.includes(email.trim())) {
        existing.push(email.trim());
        localStorage.setItem("nadine-subscribers", JSON.stringify(existing));
      }
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); setEmail(""); }, 4000);
    } catch {
      setError("حدث خطأ، يرجى المحاولة لاحقاً");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="py-16 md:py-20">
        <div className="max-w-[600px] mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl p-10 md:p-12"
            style={{
              background: "linear-gradient(135deg, rgba(196,40,85,0.06), rgba(255,228,235,0.1))",
              border: "1px solid rgba(196,40,85,0.12)",
            }}
          >
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(196,40,85,0.1)" }}>
              <Check size={28} className="text-accent-brand" />
            </div>
            <h3 className="text-xl font-bold text-fg mb-2 font-display">تم الاشتراك! 🎉</h3>
            <p className="text-sm text-fg-tertiary">شكراً لانضمامكِ — سنرسل لكِ أحدث التشكيلات والعروض الحصرية</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-[600px] mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl p-8 md:p-10 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(196,40,85,0.06), rgba(255,228,235,0.1))",
            border: "1px solid rgba(196,40,85,0.12)",
          }}
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(196,40,85,0.1)" }}>
            <Mail size={22} className="text-accent-brand" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-fg mb-2 font-display">
            انضمي إلى <span className="text-accent-brand">نادين</span>
          </h3>
          <p className="text-sm text-fg-tertiary mb-6 max-w-sm mx-auto">
            اشتركي في النشرة البريدية لتصلك أحدث التشكيلات والعروض الحصرية
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="flex-1 relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="بريدك الإلكتروني..."
                className="w-full h-12 px-4 pr-10 text-sm rounded-xl outline-none transition-all glass-input"
                style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(196,40,85,0.12)" }}
                dir="ltr"
              />
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-fg-quaternary, #8c8276)" }} />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-12 px-6 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 whitespace-nowrap"
              style={{ background: "linear-gradient(135deg, #e63d6a, #c42855)" }}
            >
              {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : "اشتراك"}
            </button>
          </form>
          {error && <p className="text-xs text-status-danger mt-3">{error}</p>}
          <p className="text-[10px] text-fg-tertiary mt-4">يمكنكِ إلغاء الاشتراك في أي وقت • لن يتم مشاركة بريدكِ مع أي طرف ثالث</p>
        </motion.div>
      </div>
    </section>
  );
}
