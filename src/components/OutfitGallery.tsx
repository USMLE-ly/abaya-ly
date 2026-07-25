"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Eye } from "lucide-react";
import { products } from "@/data/products";
import { useNavigate } from "react-router-dom";

const newOutfitIds = [
  "olive-ruffle", "cream-silk", "white-beach", "red-velvet",
  "white-lace", "night-velvet", "floral-sleeve", "black-lace", "mesh-geometric",
  "gold-embroidered",
  "geometric-gold"
];

export function OutfitGallery() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const navigate = useNavigate();

  const newOutfits = products.filter((p) => newOutfitIds.includes(p.id));

  return (
    <section className="py-16 md:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            الوصلات <span className="text-primary">الجديدة</span>
          </h2>
          <p className="text-sm text-foreground/50 max-w-lg mx-auto">
            أحدث الإضافات إلى مجموعتنا — تصاميم حصرية بالخامات الفاخرة
          </p>
        </motion.div>

        {/* Outfits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {newOutfits.map((outfit, index) => (
            <motion.div
              key={outfit.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group relative glass-card overflow-hidden rounded-2xl"
              onMouseEnter={() => setHoveredId(outfit.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden">
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
                    className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-medium hover:bg-white/30 transition-colors flex items-center gap-2"
                  >
                    <Eye size={14} />
                    عرض
                  </button>
                  <button className="px-4 py-2 rounded-full bg-primary/80 backdrop-blur-md text-white text-xs font-medium hover:bg-primary transition-colors flex items-center gap-2">
                    <ShoppingBag size={14} />
                    أضيفي
                  </button>
                </div>
                {/* Badge */}
                {outfit.badge && (
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-primary/90 backdrop-blur-sm text-white text-[10px] font-bold">
                    {outfit.badge}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 text-right">
                <h3 className="text-sm font-bold text-foreground mb-1">
                  {outfit.name}
                </h3>
                <p className="text-[11px] text-foreground/40 mb-2">
                  {outfit.fabric}
                </p>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm font-bold text-primary">
                    {outfit.price} د.ل
                  </span>
                  {outfit.originalPrice && (
                    <span className="text-xs text-foreground/30 line-through">
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
