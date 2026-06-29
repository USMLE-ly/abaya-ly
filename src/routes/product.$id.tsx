import { useState } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, Share2, Check, Truck, ChevronLeft } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { findProduct, products } from "@/data/products";

const WhatsappIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.7.4 3.3 1.2 4.7L2 22l5.4-1.2c1.4.7 3 1.1 4.6 1.1 5.5 0 10-4.5 10-10S17.5 2 12 2z"/>
  </svg>
);

export const Route = createFileRoute("/product/$id")({
  loader: ({ params }) => {
    const product = findProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} | الملكة` },
          { name: "description", content: loaderData.product.description.slice(0, 160) },
          { property: "og:title", content: `${loaderData.product.name} | الملكة` },
          { property: "og:description", content: loaderData.product.description.slice(0, 160) },
          { property: "og:image", content: loaderData.product.images[0] },
        ]
      : [],
  }),
  component: ProductPage,
  notFoundComponent: () => (
    <div className="min-h-screen flex items-center justify-center bg-ink">
      <div className="text-center">
        <h1 className="text-3xl text-gold font-bold mb-3">العباية غير موجودة</h1>
        <p className="text-warm mb-6">لم نجد المنتج الذي تبحثين عنه.</p>
        <Link to="/" className="rounded-full bg-gold text-ink px-6 py-3 font-semibold">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [active, setActive] = useState(0);
  const [color, setColor] = useState(product.colors[0]);
  const related = products.filter((p) => p.id !== product.id).slice(0, 3);
  const savings = product.originalPrice ? product.originalPrice - product.price : 0;

  return (
    <div className="bg-ink min-h-screen">
      <Navbar />

      <div className="pt-28 pb-20">
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-warm-muted mb-8 justify-end">
            <Link to="/" className="hover:text-gold">الرئيسية</Link>
            <ChevronLeft size={14} />
            <a href="/#collections" className="hover:text-gold">المجموعات</a>
            <ChevronLeft size={14} />
            <span className="text-gold">{product.name}</span>
          </div>

          <div className="grid lg:grid-cols-5 gap-10 lg:gap-14">
            {/* Gallery (right side in RTL = visually first) */}
            <div className="lg:col-span-3 order-1">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-gold/15 bg-ink-2 group">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={active}
                    src={product.images[active]}
                    alt={product.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </AnimatePresence>
                {product.badge && (
                  <span className="absolute top-5 right-5 rounded-full bg-gold text-ink text-xs font-bold px-4 py-2">
                    {product.badge}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-3 mt-4">
                {product.images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`relative aspect-[3/4] overflow-hidden rounded-xl border-2 transition ${
                      i === active ? "border-gold" : "border-gold/15 hover:border-gold/40"
                    }`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Details */}
            <div className="lg:col-span-2 order-2 text-right">
              <div className="flex items-center gap-2 justify-end flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-emerald-400 text-sm">
                  <Check size={14} /> متوفر
                </span>
                <span className="inline-flex items-center gap-1.5 text-gold text-sm border-r border-gold/20 pr-2">
                  <Truck size={14} /> التوصيل خلال ٣-٥ أيام
                </span>
              </div>

              <h1 className="font-display text-3xl md:text-4xl font-bold text-cream leading-tight mt-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 mt-3 justify-end">
                <span className="text-warm text-sm">{product.reviewCount} تقييمة</span>
                <span className="text-warm-muted">|</span>
                <span className="text-cream text-sm">({product.rating})</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={15} className="fill-gold text-gold" />
                  ))}
                </div>
              </div>

              <div className="flex items-baseline gap-4 mt-6 justify-end flex-wrap">
                {savings > 0 && (
                  <span className="rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold px-3 py-1.5">
                    وفّري {savings} د.ل
                  </span>
                )}
                {product.originalPrice && (
                  <span className="text-warm-muted line-through text-lg">{product.originalPrice} د.ل</span>
                )}
                <span className="text-gold text-4xl font-bold">{product.price} د.ل</span>
              </div>

              <div className="h-px bg-gold/20 my-7" />

              <p className="text-warm leading-[1.95] text-[15px]">{product.description}</p>

              <div className="mt-8">
                <h4 className="text-gold text-sm font-semibold mb-3">اللون: <span className="text-cream">{color.name}</span></h4>
                <div className="flex gap-3 justify-end">
                  {product.colors.map((c) => (
                    <button
                      key={c.hex}
                      onClick={() => setColor(c)}
                      className={`h-10 w-10 rounded-full border-2 transition ${
                        color.hex === c.hex ? "border-gold scale-110" : "border-gold/20 hover:border-gold/60"
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-7 rounded-xl border border-gold/15 bg-ink-2 p-5 text-right">
                <h4 className="text-gold text-sm font-semibold mb-2">تفصيل حسب المقاس</h4>
                <p className="text-warm text-sm leading-[1.9]">
                  نوفّر تفصيل خاص يناسب مقاسك تماماً — تواصلي معنا عبر واتساب لأخذ المقاسات وتجهيز عبايتك خصيصاً لكِ.
                </p>
              </div>

              <div className="flex flex-col gap-3 mt-8">
                <a
                  href={`https://wa.me/2189100000000?text=${encodeURIComponent(
                    `السلام عليكم، أرغب في طلب ${product.name} باللون ${color.name}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--color-whatsapp)] text-white px-8 py-4 font-semibold hover:brightness-110 transition"
                >
                  <WhatsappIcon />
                  <span>اطلبيها عبر واتساب</span>
                </a>
                <a
                  href="tel:+2189100000000"
                  className="w-full inline-flex items-center justify-center rounded-full bg-gold text-ink px-8 py-4 font-semibold hover:brightness-110 transition"
                >
                  اتصلي بنا للطلب
                </a>
              </div>

              <div className="flex items-center gap-4 mt-6 justify-end text-warm-muted text-sm">
                <button className="inline-flex items-center gap-2 hover:text-gold transition">
                  <Share2 size={16} /> مشاركة
                </button>
                <button className="inline-flex items-center gap-2 hover:text-gold transition">
                  <Heart size={16} /> حفظ
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-gold/15">
                <h4 className="text-gold font-semibold mb-3">تفاصيل المنتج</h4>
                <ul className="space-y-2 text-warm text-sm leading-[1.9]">
                  {product.details.map((d) => (
                    <li key={d} className="flex items-start gap-2 justify-end">
                      <span>{d}</span>
                      <span className="text-gold mt-1.5">✦</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        <div className="mx-auto max-w-[1400px] px-6 lg:px-10 mt-24">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-cream text-right mb-10">
            قد يعجبكِ أيضاً
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {related.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
