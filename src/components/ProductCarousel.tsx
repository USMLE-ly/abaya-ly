import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { products } from "@/data/products";

export function ProductCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 5);
    setAtEnd(Math.abs(el.scrollWidth - el.scrollLeft - el.clientWidth) < 5);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
  };

  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-text">
              مجموعة <span className="text-brand">العبايات</span>
            </h2>
            <p className="text-xs text-text-light mt-1">اكتشفي أحدث تشكيلاتنا من العبايات الفاخرة</p>
          </div>
          <Link
            to="/collections"
            className="text-xs font-semibold text-brand hover:underline hidden sm:block"
          >
            عرض الكل ←
          </Link>
        </div>

        {/* Carousel */}
        <div className="relative group">
          {/* Scroll Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                className="flex-shrink-0 w-[200px] md:w-[220px]"
              >
                <Link to={`/product/${product.id}`} className="group block">
                  {/* Image */}
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-bg-2 mb-3">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.badge && (
                      <span className="absolute top-2.5 right-2.5 px-2.5 py-1 bg-brand text-white text-[10px] font-semibold rounded-full">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Details */}
                  <p className="text-[10px] text-text-light mb-0.5">{product.fabric}</p>
                  <h3 className="text-xs font-semibold text-text group-hover:text-brand transition-colors line-clamp-1 mb-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-brand">{product.price} د.ل</span>
                    {product.originalPrice && (
                      <span className="text-[10px] text-text-light line-through">
                        {product.originalPrice} د.ل
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {!atStart && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/3 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-border shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-bg-2 z-10"
            >
              <ChevronLeft size={18} className="text-text" />
            </button>
          )}
          {!atEnd && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/3 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-border shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-bg-2 z-10"
            >
              <ChevronRight size={18} className="text-text" />
            </button>
          )}
        </div>

        {/* Mobile "View All" */}
        <div className="text-center mt-6 sm:hidden">
          <Link
            to="/collections"
            className="inline-block px-6 py-2 border border-brand text-brand text-xs font-semibold rounded-full hover:bg-brand hover:text-white transition-colors"
          >
            عرض الكل
          </Link>
        </div>
      </div>
    </section>
  );
}
