import { PageTransition } from "@/components/PageTransition";
import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { products, collections } from "@/data/products";
import { Star, Eye, ShoppingBag, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/velar";
import { Badge } from "@/components/velar";
import { OptimizedImage } from "@/components/OptimizedImage";

export function Collections() {
  return <PageTransition><CollectionsContent /></PageTransition>;
}

function CollectionsContent() {
  const [active, setActive] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "rating">("default");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Filter by collection
  let filtered = active === "all" ? products : products.filter((p) => p.category === active);

  // Filter by search
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.collection.toLowerCase().includes(q) ||
      p.model.toLowerCase().includes(q) ||
      (p.fabric || "").toLowerCase().includes(q) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  }

  // Filter by price
  filtered = filtered.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);

  // Sort
  const list = [...filtered].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    return 0;
  });
  const totalCount = filtered.length;

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <section className="pt-24 pb-10 md:pt-28 md:pb-14">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-fg mb-3">المجموعات</h1>
          <p className="text-sm text-fg-tertiary max-w-lg mx-auto">اكتشفي مجموعتنا من الفساتين الفاخرة — كل قطعة قصة، كل تطريزة فن</p>
        </div>
      </section>

      {/* Search & Filter Bar */}
      <section className="-mt-4 pb-6">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-fg-quaternary, #8c8276)" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحثي عن فستان..."
                className="w-full h-10 pr-9 pl-3 rounded-xl text-sm outline-none transition-all glass-input"
                style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(196,40,85,0.12)" }}
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-fg-quaternary, #8c8276)" }}>
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 text-xs">
              <SlidersHorizontal size={14} className="text-fg-tertiary" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-10 px-3 rounded-xl text-sm outline-none glass-input appearance-none cursor-pointer"
                style={{ background: "rgba(255,255,255,0.6)", border: "1px solid rgba(196,40,85,0.12)" }}
              >
                <option value="default">ترتيب افتراضي</option>
                <option value="price-asc">السعر: الأقل أولاً</option>
                <option value="price-desc">السعر: الأعلى أولاً</option>
                <option value="rating">التقييم</option>
              </select>
            </div>
          </div>

          {/* Results count */}
          <p className="text-[11px] text-fg-tertiary">
            {totalCount === 0 ? "لا توجد نتائج" : `عرض ${totalCount} ${totalCount === 1 ? "فستان" : "فساتين"}`}
            {searchQuery && ` — "${searchQuery}"`}
          </p>
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
            {list.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(196,40,85,0.08)" }}>
                  <Search size={24} className="text-accent-brand/40" />
                </div>
                <p className="text-sm font-bold text-fg mb-1">لا توجد منتجات</p>
                <p className="text-xs text-fg-tertiary">جربي تغيير معايير البحث أو تصفح جميع المجموعات</p>
              </div>
            ) : (
              list.map((product, i) => (
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
            )))}
          </div>
        </div>
      </section>
    </div>
  );
}
