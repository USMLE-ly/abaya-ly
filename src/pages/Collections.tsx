import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { products, collections } from "@/data/products";
import { Star } from "lucide-react";

export function Collections() {
  const [active, setActive] = useState("all");
  const list = active === "all" ? products : products.filter((p) => p.category === active);

  return (
    <div className="bg-white">
      {/* ─── COLLECTION BANNER ─── */}
      <section className="pt-24 pb-10 md:pt-28 md:pb-14 bg-bg-2">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-text mb-3">
            المجموعات
          </h1>
          <p className="text-sm text-text-light max-w-lg mx-auto">
            اكتشفي مجموعتنا من العبايات الفاخرة — كل قطعة قصة، كل تطريزة فن
          </p>
        </div>
      </section>

      {/* ─── PRODUCT GRID ─── */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          {/* Filter tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {collections.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={`px-5 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
                  active === c.id
                    ? "bg-brand text-white"
                    : "bg-bg-2 text-text-light hover:bg-bg-3 hover:text-text"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {list.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
              >
                <Link to={`/product/${product.id}`} className="group block">
                  <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-3 bg-bg-2">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.badge && (
                      <span className="absolute top-3 right-3 px-3 py-1 bg-brand text-white text-[10px] font-semibold rounded-full">
                        {product.badge}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-0.5 mb-1.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star
                        key={s}
                        size={11}
                        className={
                          s < Math.round(product.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }
                      />
                    ))}
                    <span className="text-[10px] text-text-light mr-1">
                      ({product.reviewCount})
                    </span>
                  </div>
                  <p className="text-[10px] text-text-light mb-0.5">{product.fabric}</p>
                  <h3 className="text-xs font-semibold text-text group-hover:text-brand transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-brand">
                      {product.price} د.ل
                    </span>
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
        </div>
      </section>
    </div>
  );
}
