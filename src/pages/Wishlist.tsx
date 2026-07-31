import { PageTransition } from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { products } from "@/data/products";
import { OptimizedImage } from "@/components/OptimizedImage";
import { WishlistButton } from "@/components/WishlistButton";
import { useWishlist } from "@/lib/wishlist";
import { Heart, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/velar";
import { Star } from "lucide-react";
import { usePageMeta } from "@/lib/usePageMeta";

export function Wishlist() {
  usePageMeta("المفضلة", "فساتينكِ المفضلة محفوظة هنا — عودي إليها في أي وقت لإتمام طلبك.");
  return <PageTransition><WishlistContent /></PageTransition>;
}

function WishlistContent() {
  const { ids } = useWishlist();
  const items = products.filter((p) => ids.includes(p.id));

  return (
    <div className="min-h-screen">
      <section className="pt-28 pb-10 md:pb-14">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-fg">
                المفضلة <span className="text-accent-brand">❤️</span>
              </h1>
              <p className="text-xs text-fg-tertiary mt-1">
                {ids.length === 0 ? "لم تُضيفي أي فستان إلى المفضلة بعد" : `لديك ${ids.length} فستان في المفضلة`}
              </p>
            </div>
            <Link to="/collections" className="text-xs text-accent-brand hover:underline font-medium">
              ← تصفح المجموعات
            </Link>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "rgba(196,40,85,0.08)" }}>
                <Heart size={32} className="text-accent-brand/30" />
              </div>
              <h2 className="text-lg font-bold text-fg mb-2">المفضلة فارغة</h2>
              <p className="text-sm text-fg-tertiary mb-6 max-w-sm mx-auto">
                أضيفي فستانك المفضل بالنقر على أيقونة القلب ♡ التي تظهر على صور المنتجات
              </p>
              <Link to="/collections">
                <Button variant="primary">اكتشفي المجموعات</Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6" style={{ direction: "rtl" }}>
              {items.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.35 }}
                >
                  <Link to={`/product/${product.id}`} className="group block">
                    <div
                      className="relative overflow-hidden rounded-2xl transition-all duration-500"
                      style={{
                        background: "rgba(255,255,255,0.7)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        border: "1px solid rgba(196,40,85,0.12)",
                      }}
                    >
                      {/* Wishlist button overlay */}
                      <div className="absolute top-3 left-3 z-10">
                        <WishlistButton productId={product.id} size={15} />
                      </div>

                      <div className="relative aspect-[3/4] w-full overflow-hidden">
                        <OptimizedImage
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                        />
                        {product.badge && (
                          <div
                            className="absolute top-3 right-3 px-3 py-1 rounded-full text-fg-inverse text-[10px] font-bold"
                            style={{ backgroundColor: "#c42855" }}
                          >
                            {product.badge}
                          </div>
                        )}
                      </div>

                      <div className="p-3 sm:p-4 md:p-5 text-right">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-accent-brand font-semibold mb-1">
                          {product.collection} <span className="text-fg/40">•</span> {product.model}
                        </p>
                        <h3 className="text-sm sm:text-base md:text-lg font-bold text-fg mb-1 leading-snug font-display">
                          {product.name.split(" • ").slice(2).join(" • ") ?? product.name}
                        </h3>
                        <div className="flex items-center gap-0.5 mb-2 justify-end">
                          {Array.from({ length: 5 }).map((_, s) => (
                            <Star key={s} size={10} className={s < Math.round(product.rating) ? "fill-warning text-warning" : "text-fg-quaternary"} />
                          ))}
                          <span className="text-[9px] text-fg-quaternary ms-1">({product.reviewCount})</span>
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
          )}
        </div>
      </section>
    </div>
  );
}
