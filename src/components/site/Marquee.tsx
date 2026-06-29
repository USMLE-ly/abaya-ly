import { motion } from "framer-motion";

const items = [
  "عبايات فاخرة",
  "تطريز يدوي",
  "أقمشة عالمية",
  "تفصيل حسب المقاس",
  "شحن لجميع مدن ليبيا",
  "مجموعة ٢٠٢٥",
  "الملكة",
];

export function Marquee() {
  const row = [...items, ...items];
  return (
    <div className="bg-gold overflow-hidden border-y border-gold-muted/40">
      <motion.div
        className="flex whitespace-nowrap py-3.5"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {row.map((t, i) => (
          <span key={i} className="text-ink font-semibold text-sm mx-8 flex items-center gap-8">
            <span>✦</span>
            <span>{t}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
