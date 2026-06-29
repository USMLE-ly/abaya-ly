import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { Product } from "@/data/products";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: (index % 3) * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group rounded-2xl bg-ink-3 border border-gold/10 overflow-hidden hover:border-gold/40 transition-all duration-500 hover:shadow-[0_10px_40px_-12px_rgba(201,168,76,0.25)]"
    >
      <Link to="/product/$id" params={{ id: product.id }} className="block">
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {product.badge && (
            <span className="absolute top-4 right-4 rounded-full bg-gold text-ink text-[11px] font-bold px-3 py-1.5">
              {product.badge}
            </span>
          )}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-ink via-ink/85 to-transparent p-5 pt-12">
            <span className="inline-block rounded-full border border-gold text-gold text-xs px-4 py-2 font-medium">
              عرض سريع
            </span>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] rounded-full border border-gold/30 text-gold-light px-2.5 py-1">
              {product.fabric}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-warm-muted line-through">
                {product.originalPrice} د.ل
              </span>
            )}
          </div>

          <h3 className="text-cream text-lg font-semibold leading-tight">
            {product.name}
          </h3>

          <div className="flex items-center justify-between pt-1">
            <span className="text-gold text-xl font-bold">{product.price} د.ل</span>
            <div className="flex items-center gap-1.5">
              {product.colors.slice(0, 4).map((c) => (
                <span
                  key={c.hex}
                  className="h-3.5 w-3.5 rounded-full border border-gold/30"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 text-gold text-sm pt-2 border-t border-gold/10 mt-3">
            <span>عرض التفاصيل</span>
            <ArrowLeft size={16} />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
