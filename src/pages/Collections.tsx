import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { products, collections } from "@/data/products";
import { Star } from "lucide-react";
import { Button } from "@/components/velar";
import { Badge } from "@/components/velar";

export function Collections() {
  const [active, setActive] = useState("all");
  const list = active === "all" ? products : products.filter((p) => p.category === active);

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <section className="pt-24 pb-10 md:pt-28 md:pb-14">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-fg mb-3">المجموعات</h1>
          <p className="text-sm text-fg-tertiary max-w-lg mx-auto">اكتشفي مجموعتنا من العبايات الفاخرة — كل قطعة قصة، كل تطريزة فن</p>
        </div>
      </section>

      {/* Product Grid */}
      <section className="pb-12 md:pb-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
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
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-3 glass-card border-0 p-0">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    {product.badge && (
                      <Badge tone="brand" size="sm" className="absolute top-3 right-3">{product.badge}</Badge>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-inverse/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-xs font-semibold text-fg line-clamp-1">{product.name}</h3>
                      <div className="flex items-center gap-0.5 mt-1">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star key={s} size={9} className={s < Math.round(product.rating) ? "fill-warning text-warning" : "text-fg-quaternary"} />
                        ))}
                        <span className="text-[8px] text-fg-quaternary mr-1">({product.reviewCount})</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-bold text-accent-brand">{product.price} د.ل</span>
                        {product.originalPrice && (
                          <span className="text-[10px] text-fg-quaternary line-through">{product.originalPrice} د.ل</span>
                        )}
                      </div>
                    </div>
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
