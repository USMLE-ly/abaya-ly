import { useRef, useState, useCallback, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";
import { WishlistButton } from "@/components/WishlistButton";
import { Link } from "react-router-dom";
import type { Product } from "@/data/products";
import { useCatalogProducts } from "@/lib/useCatalog";

function InteractiveCard({ product, index = 0 }: { product: Product; index?: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const rotateX = ((y - height / 2) / (height / 2)) * -3;
    const rotateY = ((x - width / 2) / (width / 2)) * 3;
    cardRef.current.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
    cardRef.current.style.transition = "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)";
  };

  const handleMouseEnter = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transition = "transform 0.1s ease-out";
  };

  const stars = Math.round(product.rating);
  const reviewCount = product.reviewCount || 0;

  return (
    <Link to={`/product/${product.id}`}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        className="group/card relative min-w-[100vw] sm:min-w-0 sm:w-[290px] flex-shrink-0 aspect-[3/4] rounded-3xl overflow-hidden cursor-pointer"
        style={{ willChange: "transform" }}
      >
        {/* Image with zoom */}
        <div className="absolute inset-0 overflow-hidden">
          <OptimizedImage
            src={product.images[0]}
            alt={product.name}
            className="absolute inset-0 h-full w-full transition-all duration-700 group-hover/card:scale-110"
          />
        </div>
        {product.images[1] && (
          <OptimizedImage
            src={product.images[1]}
            alt=""
            className="absolute inset-0 h-full w-full opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
          />
        )}

        {/* Gradient overlay — deeper at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent group-hover/card:from-black/80 transition-all duration-300" />

        {product.badge && (
          <div className="absolute top-3 right-3 z-20 px-3 py-1 bg-white/90 backdrop-blur-md text-fg text-[10px] font-bold rounded-full shadow-lg border border-white/50">
            {product.badge}
          </div>
        )}
        {/* Wishlist button */}
        <div className="absolute top-3 left-3 z-20">
          <WishlistButton productId={product.id} size={14} className="shadow-md" />
        </div>

        <div className="absolute inset-0 p-3 sm:p-4 flex flex-col justify-end">
          {/* Stars — more subtle */}
          <div className="flex items-center gap-0.5 mb-2 self-start rounded-full px-3 py-1.5 w-fit glass-subtle">
            {Array.from({ length: 5 }).map((_, s) => (
              <svg key={s} className={`w-3 h-3 ${s < stars ? "text-amber-400" : "text-white/30"}`} fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="text-[9px] text-white/70 ms-1">({reviewCount})</span>
          </div>

          {/* Title overlay — glass premium */}
          <div className="inline-block rounded-2xl border border-white/20 p-3 sm:p-4 mb-3 w-fit max-w-full glass-subtle backdrop-blur-xl">
            <p className="text-[9px] uppercase tracking-[0.2em] text-strawberry-400 font-semibold mb-0.5">
              {product.collection} <span className="text-white/40">•</span> {product.model}
            </p>
            <h3 className="text-sm md:text-base font-bold text-white leading-tight mb-0.5 text-pretty" style={{ whiteSpace: "normal", overflow: "visible" }}>
              {product.name.split(" • ").slice(2).join(" • ") ?? product.name}
            </h3>
          </div>

          {/* Price pill */}
          <div className="inline-flex self-start">
            <div className="rounded-full border border-white/20 px-4 py-1.5 flex items-baseline gap-1.5 glass-subtle backdrop-blur-xl">
              <span className="text-sm font-bold text-strawberry-400 tabular-nums">{product.price} د.ل</span>
              {product.originalPrice && <span className="text-[10px] text-white/50 line-through">{product.originalPrice} د.ل</span>}
            </div>
          </div>
        </div>

        {/* Shine effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-tr from-white/0 via-white/08 to-white/0" />
      </div>
    </Link>
  );
}

export function ProductCarousel() {
  const catalog = useCatalogProducts();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
    if (isRtl) {
      // RTL: scrollLeft: 0 = rightmost (start), negative = scrolled left
      setAtStart(el.scrollLeft >= 0);
      setAtEnd(el.scrollLeft <= -(el.scrollWidth - el.clientWidth));
    } else {
      setAtStart(el.scrollLeft <= 5);
      setAtEnd(Math.abs(el.scrollWidth - el.scrollLeft - el.clientWidth) < 5);
    }
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
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-lg md:text-xl font-bold text-fg">مجموعة <span className="text-accent-brand">الفساتين</span></h2>
            <p className="text-xs text-fg/40 mt-1">اكتشفي أحدث تشكيلاتنا من الفساتين الفاخرة</p>
          </div>
          <Link to="/collections" className="text-xs font-semibold text-accent-brand hover:underline hidden sm:block">عرض الكل ←</Link>
        </div>

        {/* Horizontal scrollable carousel — no snap, no smooth class */}
        <div className="relative group -mx-4 sm:-mx-6 lg:-mx-10">
          <div
            ref={scrollRef}
            className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide"
            onScroll={checkScroll}
          >
            {catalog.map((product, i) => (
              <div key={product.id} className="flex-shrink-0" style={{ animation: `fadeUp 0.5s ease-out ${i * 0.06}s both` }}>
                <InteractiveCard product={product} index={i} />
              </div>
            ))}
          </div>
          {!atEnd && <button onClick={() => scroll("left")} className="absolute left-0 top-1/3 -translate-y-1/2 w-9 h-9 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"><ChevronLeft size={18} className="text-fg" /></button>}
          {!atStart && <button onClick={() => scroll("right")} className="absolute right-0 top-1/3 -translate-y-1/2 w-9 h-9 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"><ChevronRight size={18} className="text-fg" /></button>}
        </div>

        <div className="text-center mt-6 sm:hidden">
          <Link to="/collections" className="inline-block px-6 py-2 glass text-fg text-xs font-semibold rounded-full hover:bg-sunken transition-colors">عرض الكل</Link>
        </div>
      </div>
    </section>
  );
}
