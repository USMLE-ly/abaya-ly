import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { products, collections } from "@/data/products";
import { Star, Eye, ShoppingBag } from "lucide-react";
import { Button } from "@/components/velar";
import { Badge } from "@/components/velar";

export function Collections() {
  const [active, setActive] = useState("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const list = active === "all" ? products : products.filter((p) => p.category === active);

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <section className="pt-24 pb-10 md:pt-28 md:pb-14">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-fg mb-3">المجموعات</h1>
          <p className="text-sm text-fg-tertiary max-w-lg mx-auto">اكتشفي مجموعتنا من الفساتين الفاخرة — كل قطعة قصة، كل تطريزة فن</p>
        </div>
      </section>

      {/* Product Grid */}
      <section className="pb-12 md:pb-16">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Filter tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {collections.map((c) => (
              <Button
                key={c.id}
                onClick={() => setActive(c.id)}
                variant={active === c.id ? "primary" : "tertiary"}
                size="sm"
                className="rounded-full"
              >
                {c.name}
              </Button>
            ))}
          </div>

          {/* Grid — glassmorphism cards matching OutfitGallery */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" style={{ direction: "rtl" }}>
            {list.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
              >
                <Link
                  to={`/product/${product.id}`}
                  className="group block"
                  onMouseEnter={() => setHoveredId(product.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div
                    className="relative overflow-hidden rounded-2xl transition-all duration-500"
                    style={{
                      background: "rgba(255,255,255,0.7)",
                      backdropFilter: "blur(20px)",
                      WebkitBackdropFilter: "blur(20px)",
                      border: hoveredId === product.id ? "1px solid rgba(196,40,85,0.2)" : "1px solid rgba(196,40,85,0.12)",
                      boxShadow: hoveredId === product.id ? "0 8px 24px rgba(17,15,13,0.08)" : "0 1px 4px rgba(17,15,13,0.04)",
                    }}
                  >
                    {/* Image */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Glassmorphism overlay on hover */}
                      <div
                        className={`absolute inset-0 transition-all duration-500 flex flex-col items-center justify-center gap-3 ${
                          hoveredId === product.id ? "opacity-100" : "opacity-0"
                        }`}
                        style={{
                          background: "linear-gradient(135deg, rgba(255,228,235,0.3), rgba(255,233,218,0.3))",
                          backdropFilter: "blur(8px)",
                          WebkitBackdropFilter: "blur(8px)",
                        }}
                      >
                        <button
                          className="px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-white/40 text-fg text-xs font-semibold hover:bg-white/90 transition-all duration-300 flex items-center gap-2 shadow-e1"
                        >
                          <Eye size={14} />
                          عرض
                        </button>
                        <button
                          className="px-5 py-2.5 rounded-full backdrop-blur-md text-fg-inverse text-xs font-semibold transition-all duration-300 flex items-center gap-2 shadow-e2"
                          style={{ backgroundColor: "#c42855" }}
                        >
                          <ShoppingBag size={14} />
                          أضيفي
                        </button>
                      </div>
                      {/* Badge */}
                      {product.badge && (
                        <div
                          className="absolute top-3 right-3 px-3 py-1 rounded-full text-fg-inverse text-[10px] font-bold"
                          style={{ backgroundColor: "#c42855" }}
                        >
                          {product.badge}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-3 sm:p-4 md:p-5 text-right">
                      <p className="text-[9px] uppercase tracking-[0.2em] text-accent-brand font-semibold mb-1">
                        {product.collection} <span className="text-fg/40">•</span> {product.model}
                      </p>
                      <h3
                        className="text-sm sm:text-base md:text-lg font-bold text-fg mb-1 leading-snug font-display"
                        style={{ whiteSpace: "normal", overflow: "visible", wordBreak: "normal" }}
                      >
                        {product.name.split(" • ").slice(2).join(" • ") ?? product.name}
                      </h3>
                      <div className="flex items-center gap-0.5 mb-2 justify-end">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star key={s} size={10} className={s < Math.round(product.rating) ? "fill-warning text-warning" : "text-fg-quaternary"} />
                        ))}
                        <span className="text-[9px] text-fg-quaternary mr-1">({product.reviewCount})</span>
                      </div>
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-xs sm:text-sm md:text-base font-bold text-accent-brand">
                          {product.price} د.ل
                        </span>
                        {product.originalPrice && (
                          <span className="text-[10px] md:text-xs text-fg-disabled line-through">
                            {product.originalPrice} د.ل
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
