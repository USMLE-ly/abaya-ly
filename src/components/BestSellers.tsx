import { Link } from "react-router-dom";
import { Star, TrendingUp } from "lucide-react";
import { products } from "@/data/products";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Reveal } from "@/components/PageTransition";
import { trackCta } from "@/lib/analytics";

const shortName = (name: string) => name.split(" • ").slice(2).join(" • ") || name;

/** Ranked by real review volume × rating — no invented "trending" flags. */
const bestSellers = [...products]
  .sort((a, b) => b.reviewCount * b.rating - a.reviewCount * a.rating)
  .slice(0, 4);

export function BestSellers() {
  return (
    <Reveal>
      <section className="py-14 md:py-20" aria-labelledby="bestsellers-heading">
        <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] font-semibold text-accent-brand mb-2">
                <TrendingUp size={12} aria-hidden="true" /> الأكثر طلباً
              </p>
              <h2 id="bestsellers-heading" className="font-display text-3xl md:text-4xl font-bold text-fg">
                القطع <span className="text-accent-brand">الأكثر مبيعاً</span>
              </h2>
              <p className="text-sm text-fg-tertiary mt-2">مرتّبة حسب تقييمات عميلاتنا الفعلية</p>
            </div>
            <Link
              to="/collections"
              onClick={() => trackCta("view_all_bestsellers", "home_bestsellers")}
              className="text-xs font-semibold text-accent-brand hover:underline whitespace-nowrap"
            >
              عرض الكل
            </Link>
          </div>

          <ul className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 list-none p-0 m-0">
            {bestSellers.map((p, i) => (
              <li key={p.id}>
                <Link
                  to={`/product/${p.id}`}
                  onClick={() => trackCta("bestseller_card", "home_bestsellers")}
                  className="group block rounded-2xl overflow-hidden border border-line-subtle bg-raised transition-shadow hover:shadow-e2"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-sunken">
                    <OptimizedImage
                      src={p.images[0]}
                      alt={shortName(p.name)}
                      loading={i < 2 ? "eager" : "lazy"}
                      className="w-full h-full transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <span className="absolute top-3 right-3 rounded-full bg-raised/90 px-2.5 py-1 text-[10px] font-bold text-accent-brand">
                      #{i + 1}
                    </span>
                  </div>
                  <div className="p-3.5">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-fg-tertiary font-semibold mb-1">{p.collection}</p>
                    <h3 className="text-xs font-semibold text-fg line-clamp-2 leading-snug min-h-[2.2em]">{shortName(p.name)}</h3>
                    <div className="flex items-center gap-1 mt-2">
                      <Star size={11} className="fill-accent-brand text-accent-brand" aria-hidden="true" />
                      <span className="text-[11px] font-semibold text-fg-secondary">{p.rating}</span>
                      <span className="text-[10px] text-fg-tertiary">({p.reviewCount})</span>
                    </div>
                    <div className="flex items-baseline gap-2 mt-1.5">
                      <span className="text-sm font-bold text-accent-brand">{p.price} د.ل</span>
                      {p.originalPrice && (
                        <span className="text-[11px] text-fg-tertiary line-through">{p.originalPrice} د.ل</span>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Reveal>
  );
}
