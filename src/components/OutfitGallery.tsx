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
    <section className="py-20 md:py-28 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto px-0">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-right mb-12"
        >
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-fg mb-3">
            الوصلات <span className="text-accent-brand">الجديدة</span>
          </h2>
          <p className="text-sm text-fg/50 max-w-lg ml-auto">
            أحدث الإضافات إلى مجموعتنا — تصاميم حصرية بالخامات الفاخرة
          </p>
        </motion.div>

        {/* Outfits Grid — larger cards that fill space */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {newOutfits.map((outfit, index) => (
            <motion.div
              key={outfit.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className="group relative overflow-hidden rounded-2xl"
              onMouseEnter={() => setHoveredId(outfit.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Image — fills the card completely */}
              <div className="relative aspect-[4/5] w-full overflow-hidden">
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
                    onClick={() => navigate(`/product/${outfit.id}`)}
                    className="px-4 py-2 rounded-full bg-raised/20 backdrop-blur-md border border-white/30 text-fg-inverse text-xs font-medium hover:bg-raised/30 transition-colors flex items-center gap-2"
                  >
                    <Eye size={14} />
                    عرض
                  </button>
                  <button className="px-4 py-2 rounded-full bg-accent-brand/80 backdrop-blur-md text-fg-inverse text-xs font-medium hover:bg-accent-brand transition-colors flex items-center gap-2">
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

              {/* Info — full width, no truncation */}
              <div className="p-4 md:p-5 text-right">
                <h3 className="text-base md:text-lg font-bold text-fg mb-1 leading-snug">
                  {outfit.name}
                </h3>
                <p className="text-xs md:text-sm text-fg/40 mb-2 leading-relaxed">
                  {outfit.fabric}
                </p>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm md:text-base font-bold text-accent-brand">
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
