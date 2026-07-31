import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";

interface Props {
  price: number;
  originalPrice?: number;
  onBook: () => void;
}

export function StickyBookingBar({ price, originalPrice, onBook }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past 60% of the page
      const scrollRatio = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
      setVisible(scrollRatio > 0.25);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(196,40,85,0.12)",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            {/* Price */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="text-base font-bold text-accent-brand tabular-nums">{price} د.ل</span>
                {originalPrice && (
                  <span className="text-[11px] text-fg-tertiary line-through">{originalPrice} د.ل</span>
                )}
              </div>
              <p className="text-[9px] text-fg-tertiary">الدفع عند الاستلام 💵</p>
            </div>

            {/* Book button */}
            <button
              onClick={onBook}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 active:scale-95 shadow-lg"
              style={{ background: "linear-gradient(135deg, #e63d6a, #c42855)" }}
            >
              <ShoppingBag size={16} />
              احجزي هذا الفستان
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
