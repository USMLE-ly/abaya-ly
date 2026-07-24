import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, Heart, Share2, Minus, Plus, Truck } from "lucide-react";
import { findProduct, products } from "@/data/products";

export function Product() {
  const { id } = useParams();
  const product = findProduct(id || "");
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text mb-4">المنتج غير موجود</h1>
          <Link to="/collections" className="text-brand hover:underline">العودة للمجموعات</Link>
        </div>
      </div>
    );
  }

  const savings = product.originalPrice ? product.originalPrice - product.price : 0;
  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3);

  return (
    <div className="pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-light mb-8">
          <Link to="/" className="hover:text-brand">الرئيسية</Link>
          <ChevronLeft size={14} />
          <Link to="/collections" className="hover:text-brand">المجموعات</Link>
          <ChevronLeft size={14} />
          <span className="text-brand">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div>
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={product.images[activeImage]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>
              {product.badge && (
                <span className="absolute top-4 right-4 px-4 py-1.5 bg-brand text-white text-sm font-semibold rounded-full">
                  {product.badge}
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 transition-colors ${i === activeImage ? "border-brand" : "border-border hover:border-brand/50"}`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Info */}
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-text mb-4">{product.name}</h1>

            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} size={16} className={s < Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
                ))}
              </div>
              <span className="text-sm text-text-light">({product.reviewCount} تقييم)</span>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-brand">{product.price} د.ل</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-text-light line-through">{product.originalPrice} د.ل</span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-semibold rounded-full">
                    وفّري {savings} د.ل
                  </span>
                </>
              )}
            </div>

            <div className="h-px bg-border mb-6" />

            <p className="text-text-light leading-relaxed mb-6">{product.description}</p>

            {/* Colors */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-text mb-3">اللون: <span className="text-brand">{product.colors[selectedColor].name}</span></h3>
              <div className="flex gap-3">
                {product.colors.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(i)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${i === selectedColor ? "border-brand scale-110" : "border-border hover:border-brand/50"}`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-text mb-3">المقاس: <span className="text-brand">{product.sizes[selectedSize]}</span></h3>
              <div className="flex gap-3">
                {product.sizes.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedSize(i)}
                    className={`w-12 h-12 rounded-xl border-2 text-sm font-medium transition-all ${i === selectedSize ? "border-brand bg-brand text-white" : "border-border hover:border-brand/50"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-text mb-3">الكمية</h3>
              <div className="flex items-center gap-4">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-bg-2 transition-colors">
                  <Minus size={16} />
                </button>
                <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-bg-2 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button className="w-full py-4 bg-brand text-white font-semibold rounded-full hover:bg-brand-dark transition-colors text-lg mb-4">
              أضيفي إلى السلة
            </button>

            <div className="flex items-center gap-2 text-sm text-text-light mb-6">
              <Truck size={16} />
              <span>شحن مجاني داخل ليبيا</span>
            </div>

            <div className="flex gap-4 mb-8">
              <button className="flex items-center gap-2 text-sm text-text-light hover:text-brand transition-colors">
                <Heart size={16} />
                <span>حفظ</span>
              </button>
              <button className="flex items-center gap-2 text-sm text-text-light hover:text-brand transition-colors">
                <Share2 size={16} />
                <span>مشاركة</span>
              </button>
            </div>

            {/* Details */}
            <div className="border-t border-border pt-6">
              <h3 className="font-semibold text-text mb-3">تفاصيل المنتج</h3>
              <ul className="space-y-2">
                {product.details.map((d, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-text-light">
                    <span className="text-brand">✦</span>
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-display text-2xl font-bold text-text mb-8">قد يعجبكِ أيضاً</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} className="group block">
                  <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <h3 className="font-semibold text-text group-hover:text-brand transition-colors">{p.name}</h3>
                  <span className="text-brand font-bold">{p.price} د.ل</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
