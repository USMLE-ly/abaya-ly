"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Eye } from "lucide-react";
import { products } from "@/data/products";
import { useNavigate } from "react-router-dom";

const newOutfitIds = [
  "olive-ruffle", "cream-silk", "white-beach", "red-velvet",
  "white-lace", "night-velvet", "floral-sleeve", "black-lace", "mesh-geometric",
  "gold-emb-1", "gold-emb-2", "gold-emb-3", "gold-emb-4", "gold-emb-5", "gold-emb-6",
  "geo-gold-1", "geo-gold-2", "geo-gold-3", "geo-gold-4", "geo-gold-5", "geo-gold-6", "geo-gold-7",
];

export function OutfitGallery() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const navigate = useNavigate();

  const newOutfits = products.filter((p) => newOutfitIds.includes(p.id));

  return (
    <section className="py-20 md:py-28">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-fg mb-3">
            الوصلات <span className="text-accent-brand">الجديدة</span>
          </h2>
          <p className="text-sm text-fg/50 max-w-lg mx-auto">
            أحدث الإضافات إلى مجموعتنا — تصاميم حصرية بالخامات الفاخرة
          </p>
        </motion.div>

        {/* Responsive Grid — 2 cols mobile, 3 cols tablet, 4 cols desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6" style={{ direction: "rtl" }}>
          {newOutfits.map((outfit, index) => (
            <motion.div
              key={outfit.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (index % 8) * 0.05 }}
              className="group relative glass-card overflow-hidden rounded-2xl cursor-pointer"
              onMouseEnter={() => setHoveredId(outfit.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => navigate(`/product/${outfit.id}`)}
            >
              {/* Image */}
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                <img
                  src={outfit.images[0]}
                  alt={outfit.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {/* Glassmorphism overlay on hover */}
                <div
                  className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center gap-3 ${
                    hoveredId === outfit.id ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); navigate(`/product/${outfit.id}`); }}
                    className="px-4 py-2 rounded-full bg-raised/20 backdrop-blur-md border border-white/30 text-fg-inverse text-xs font-medium hover:bg-raised/30 transition-colors flex items-center gap-2"
                  >
                    <Eye size={14} />
                    عرض
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="px-4 py-2 rounded-full bg-accent-brand/80 backdrop-blur-md text-fg-inverse text-xs font-medium hover:bg-accent-brand transition-colors flex items-center gap-2"
                  >
                    <ShoppingBag size={14} />
                    أضيفي
                  </button>
                </div>
                {/* Badge */}
                {outfit.badge && (
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-accent-brand/90 backdrop-blur-sm text-fg-inverse text-[10px] font-bold">
                    {outfit.badge}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-3 sm:p-4 md:p-5 text-right">
                <h3
                  className="text-sm sm:text-base md:text-lg font-bold text-fg mb-1 leading-snug"
                  style={{ whiteSpace: "normal", overflow: "visible", wordBreak: "normal" }}
                >
                  {outfit.name}
                </h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-fg/40 mb-2 leading-relaxed">
                  {outfit.fabric}
                </p>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-xs sm:text-sm md:text-base font-bold text-accent-brand">
                    {outfit.price} د.ل
                  </span>
                  {outfit.originalPrice && (
                    <span className="text-[10px] md:text-xs text-fg/30 line-through">
                      {outfit.originalPrice} د.ل
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
