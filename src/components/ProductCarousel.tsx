import { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { products } from "@/data/products";

function InteractiveCard({ product }: { product: typeof products[number] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const rotateX = ((y - height / 2) / (height / 2)) * -8;
    const rotateY = ((x - width / 2) / (width / 2)) * 8;
    setStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
      transition: "transform 0.1s ease-out",
    });
  };

  const handleMouseLeave = () => {
    setStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
      transition: "transform 0.4s ease-in-out",
    });
  };

  const stars = Math.round(product.rating);
  const reviewCount = product.reviewCount || 0;

  return (
    <Link to={`/product/${product.id}`}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={style}
        className="relative w-[240px] md:w-[280px] flex-shrink-0 aspect-[9/12] rounded-3xl overflow-hidden cursor-pointer shadow-lg shadow-black/20"
      >
        <img src={product.images[0]} alt={product.name} className="absolute inset-0 h-full w-full object-cover" style={{ transform: "translateZ(-20px) scale(1.1)" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {product.badge && (
          <div className="absolute top-3 right-3 z-20 px-2.5 py-1 bg-brand text-white text-[10px] font-bold rounded-full">{product.badge}</div>
        )}

        <div className="absolute inset-0 p-4 flex flex-col justify-end">
          <div className="flex items-center gap-0.5 mb-2">
            {Array.from({ length: 5 }).map((_, s) => (
              <svg key={s} className={`w-3 h-3 ${s < stars ? "text-yellow-400" : "text-white/30"}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-[9px] text-white/60 mr-1">({reviewCount})</span>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-4 mb-3">
            <h3 className="text-lg font-bold text-white leading-tight mb-0.5 line-clamp-2">{product.name}</h3>
            <p className="text-[10px] text-white/70">{product.fabric}</p>
          </div>

          <div className="inline-flex self-start">
            <div className="rounded-full bg-black/40 backdrop-blur-sm px-4 py-1.5 flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-white">{product.price} د.ل</span>
              {product.originalPrice && <span className="text-[10px] text-white/50 line-through">{product.originalPrice} د.ل</span>}
            </div>
          </div>

          <div className="flex justify-center gap-1.5 pb-1 mt-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full ${i === 0 ? "w-4 bg-white" : "w-1.5 bg-white/30"}`} />
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

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
    return () => { el.removeEventListener("scroll", checkScroll); window.removeEventListener("resize", checkScroll); };
  }, [checkScroll]);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -el.clientWidth * 0.7 : el.clientWidth * 0.7, behavior: "smooth" });
  };

  return (
    <section className="py-10 md:py-14">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white">مجموعة <span className="text-brand">العبايات</span></h2>
            <p className="text-xs text-white/40 mt-1">اكتشفي أحدث تشكيلاتنا من العبايات الفاخرة</p>
          </div>
          <Link to="/collections" className="text-xs font-semibold text-brand hover:underline hidden sm:block">عرض الكل ←</Link>
        </div>
        <div className="relative group">
          <div ref={scrollRef} className="flex gap-5 overflow-x-auto scroll-smooth pb-4" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {products.map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.35 }} className="flex-shrink-0">
                <InteractiveCard product={product} />
              </motion.div>
            ))}
          </div>
          {!atStart && <button onClick={() => scroll("left")} className="absolute left-0 top-1/3 -translate-y-1/2 w-9 h-9 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"><ChevronLeft size={18} className="text-white" /></button>}
          {!atEnd && <button onClick={() => scroll("right")} className="absolute right-0 top-1/3 -translate-y-1/2 w-9 h-9 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"><ChevronRight size={18} className="text-white" /></button>}
        </div>
        <div className="text-center mt-6 sm:hidden">
          <Link to="/collections" className="inline-block px-6 py-2 glass text-white text-xs font-semibold rounded-full hover:bg-white/5 transition-colors">عرض الكل</Link>
        </div>
      </div>
    </section>
  );
}
