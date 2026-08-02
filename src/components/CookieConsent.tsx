import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("nadine-cookie-consent");
      if (!consent) {
        // Show after a short delay so the page loads first
        const t = setTimeout(() => setVisible(true), 2500);
        return () => clearTimeout(t);
      }
    } catch { /* ignore */ }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem("nadine-cookie-consent", "accepted");
    } catch { /* ignore */ }
    setVisible(false);
  };

  const decline = () => {
    try {
      localStorage.setItem("nadine-cookie-consent", "declined");
    } catch { /* ignore */ }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 left-0 right-0 z-[55]"
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(196,40,85,0.12)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(196,40,85,0.1)" }}>
                <Cookie size={17} className="text-accent-brand" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-fg">نستخدم ملفات تعريف الارتباط</p>
                <p className="text-[10px] text-fg-tertiary leading-relaxed">
                  لتحسين تجربتك على موقعنا. نواصل تصفح الموقع يعني موافقتك على استخدامها.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={decline}
                className="px-4 py-2 rounded-xl text-[11px] font-semibold transition-colors"
                style={{ color: "var(--text-secondary, #3a352f)", background: "rgba(17,15,13,0.05)" }}
              >
                رفض
              </button>
              <button
                onClick={accept}
                className="px-6 py-2.5 rounded-xl text-[11px] font-bold text-white transition-all duration-300 hover:scale-105"
                style={{ background: "linear-gradient(135deg, #e63d6a, #c42855)" }}
              >
                موافق
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
