import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { products } from "@/data/products";
import { Star, ShoppingBag } from "lucide-react";

export function FeaturedProducts() {
  const featured = products.slice(0, 3);

  return (
    <section className="py-20 bg-bg-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-text mb-4">
            الأكثر <span className="text-brand">مبيعاً</span>
          </h2>
          <p className="text-text-light">قطع مختارة بعناية من مجموعتنا</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <Link to={`/product/${product.id}`} className="group block">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.badge && (
                    <span className="absolute top-4 right-4 px-3 py-1 bg-brand text-white text-xs font-semibold rounded-full">
                      {product.badge}
                    </span>
                  )}
                  <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <div className="flex items-center justify-center gap-2 text-white text-sm font-medium">
                      <ShoppingBag size={16} />
                      <span>عرض التفاصيل</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={14} className={s < Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                  ))}
                  <span className="text-xs text-text-light mr-1">({product.reviewCount})</span>
                </div>
                <h3 className="font-semibold text-text group-hover:text-brand transition-colors">{product.name}</h3>
                <p className="text-sm text-text-light">{product.fabric}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-bold text-brand">{product.price} د.ل</span>
                  {product.originalPrice && (
                    <span className="text-sm text-text-light line-through">{product.originalPrice} د.ل</span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/collections"
            className="inline-block px-8 py-3 border-2 border-brand text-brand font-semibold rounded-full hover:bg-brand hover:text-white transition-colors"
          >
            عرض المزيد
          </Link>
        </div>
      </div>
    </section>
  );
}
