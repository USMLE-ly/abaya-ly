"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Eye } from "lucide-react";
import { products } from "@/data/products";
import { useNavigate } from "react-router-dom";
import { StaggerGrid, StaggerItem, Reveal } from "@/components/PageTransition";
import { OptimizedImage } from "@/components/OptimizedImage";

const newOutfitIds = [
  "lumiere-white-polka-midi",
  "noir-navy-polka-belted",
  "maison-gold-polka-belted",
  "rouge-burgundy-polka-vneck",
  "azure-sky-blue-polka-belted",
  "lumiere-white-polka-off-shoulder",
  "botanique-pink-polka-belted",
  "lumiere-cream-polka-maxi",
  "noir-black-polka-mandarin",
  "rouge-burgundy-off-shoulder",
  "noir-black-asymmetric-draped",
  "botanique-pink-embroidered",
];

export function OutfitGallery() {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const navigate = useNavigate();

  const newOutfits = products.filter((p) => newOutfitIds.includes(p.id));

  return (
    <section className="py-20 md:py-28">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Section Header — VELAR display typography */}
        <Reveal>
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-semibold tracking-[0.1em] text-accent-brand/60 uppercase mb-4 font-body">
              تشكيلة حصرية
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-fg mb-3 leading-tight">
              الوصلات <span className="text-accent-brand">الجديدة</span>
            </h2>
            <p className="text-sm text-fg-tertiary max-w-lg mx-auto leading-relaxed">
              أحدث الإضافات إلى مجموعتنا — تصاميم حصرية بالخامات الفاخرة
            </p>
            <div className="mt-6 mx-auto w-24 h-[2px] rounded-full" style={{ background: "linear-gradient(135deg, #ffe4eb, #ffe9da)" }} />
          </div>
        </Reveal>

        {/* Responsive Grid — 2 cols mobile, 3 cols tablet, 4 cols desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 rtl-grid">
          {newOutfits.map((outfit) => (
            <StaggerItem key={outfit.id}>
              <div
                className="group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-500"
                style={{
                  background: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(196,40,85,0.12)",
                  boxShadow: "0 1px 4px rgba(17,15,13,0.04)",
                }}
                onMouseEnter={(e) => {
                  setHoveredId(outfit.id);
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(17,15,13,0.08)";
                  e.currentTarget.style.borderColor = "rgba(196,40,85,0.2)";
                }}
                onMouseLeave={(e) => {
                  setHoveredId(null);
                  e.currentTarget.style.boxShadow = "0 1px 4px rgba(17,15,13,0.04)";
                  e.currentTarget.style.borderColor = "rgba(196,40,85,0.12)";
                }}
                onClick={() => navigate(`/product/${outfit.id}`)}
              >
                {/* Image */}
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <img
                    src={outfit.images[0]}
                    alt={outfit.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Glassmorphism overlay on hover */}
                  <div
                    className={`absolute inset-0 transition-all duration-500 flex flex-col items-center justify-center gap-3 ${
                      hoveredId === outfit.id ? "opacity-100" : "opacity-0"
                    }`}
                    style={{
                      background: "linear-gradient(135deg, rgba(255,228,235,0.3), rgba(255,233,218,0.3))",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                    }}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/product/${outfit.id}`); }}
                      className="px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-white/40 text-fg text-xs font-semibold hover:bg-white/90 transition-all duration-300 flex items-center gap-2 shadow-e1"
                    >
                      <Eye size={14} />
                      عرض
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="px-5 py-2.5 rounded-full backdrop-blur-md text-fg-inverse text-xs font-semibold transition-all duration-300 flex items-center gap-2 shadow-e2"
                      style={{ backgroundColor: "#c42855" }}
                    >
                      <ShoppingBag size={14} />
                      أضيفي
                    </button>
                  </div>
                  {/* Badge */}
                  {outfit.badge && (
                    <div
                      className="absolute top-3 right-3 px-3 py-1 rounded-full text-fg-inverse text-[10px] font-bold"
                      style={{ backgroundColor: "#c42855" }}
                    >
                      {outfit.badge}
                    </div>
                  )}
                </div>

                {/* Info — VELAR typography */}
                <div className="p-3 sm:p-4 md:p-5 text-right">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-accent-brand/70 font-semibold mb-1">
                    {outfit.collection} <span className="text-fg/40">•</span> {outfit.model}
                  </p>
                  <h3
                    className="text-sm sm:text-base md:text-lg font-bold text-fg mb-1 leading-snug font-display"
                    style={{ whiteSpace: "normal", overflow: "visible", wordBreak: "normal" }}
                  >
                    {outfit.name.split(" • ").slice(2).join(" • ") ?? outfit.name}
                  </h3>
                  <p className="text-[10px] sm:text-xs md:text-sm text-fg-tertiary mb-2 leading-relaxed">
                  </p>
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-xs sm:text-sm md:text-base font-bold text-accent-brand">
                      {outfit.price} د.ل
                    </span>
                    {outfit.originalPrice && (
                      <span className="text-[10px] md:text-xs text-fg-disabled line-through">
                        {outfit.originalPrice} د.ل
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </div>
      </div>
    </section>
  );
}
