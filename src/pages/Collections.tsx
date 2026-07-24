import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { products, collections } from "@/data/products";
import { Star, ShoppingBag } from "lucide-react";

export function Collections() {
  const [active, setActive] = useState("all");
  const list = active === "all" ? products : products.filter((p) => p.category === active);

  return (
    <div className="pt-20 pb-16">
      {/* Hero banner */}
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1594938298603-c8148c4b5b3e?w=1400&q=80"
          alt="المجموعات"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white">مجموعاتنا</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {collections.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-colors ${active === c.id ? "bg-brand text-white" : "bg-bg-2 text-text hover:bg-bg-3"}`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {list.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
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
      </div>
    </div>
  );
}
