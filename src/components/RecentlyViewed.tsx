import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { products } from "@/data/products";
import { useRecentlyViewed } from "@/lib/recentlyViewed";
import { OptimizedImage } from "@/components/OptimizedImage";

export function RecentlyViewed() {
  const { ids } = useRecentlyViewed();
  const items = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean).slice(0, 4);

  if (items.length === 0) return null;

  return (
    <section className="py-8 md:py-12">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-2 mb-5">
          <Clock size={16} className="text-accent-brand/60" />
          <h2 className="font-display text-base md:text-lg font-bold text-fg">
            شاهدتِ <span className="text-accent-brand">مؤخراً</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5" style={{ direction: "rtl" }}>
          {items.map((product, i) => (
            <motion.div
              key={product!.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            >
              <Link to={`/product/${product!.id}`} className="group block">
                <div
                  className="relative overflow-hidden rounded-xl transition-all duration-300"
                  style={{
                    background: "rgba(255,255,255,0.7)",
                    border: "1px solid rgba(196,40,85,0.1)",
                  }}
                >
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <OptimizedImage
                      src={product!.images[0]}
                      alt={product!.name}
                      className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-2.5">
                    <p className="text-[10px] font-bold text-accent-brand truncate">{product!.model}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[11px] font-bold text-fg">{product!.price} د.ل</span>
                      <span className="text-[9px] text-fg-quaternary">{product!.rating} ★</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
