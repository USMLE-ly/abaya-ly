import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, ChevronLeft, Minus, Plus, Truck, RotateCcw, Shield, Headphones } from "lucide-react";
import { findProduct, products } from "@/data/products";

const trustItems = [
  { icon: Truck, title: "شحن مجاني", description: "لجميع مدن ليبيا — التوصيل خلال 3-5 أيام عمل", stat: "7" },
  { icon: RotateCcw, title: "إرجاع سهل", description: "خلال 7 أيام من تاريخ الاستلام بدون أي تعقيد", stat: "7" },
  { icon: Shield, title: "ضمان الجودة", description: "أقمشة عالمية مضمونة من أفضل المصانع العالمية", stat: "100%" },
  { icon: Headphones, title: "دعم متواصل", description: "فريق خدمة العملاء متاح عبر الواتساب على مدار الساعة", stat: "24/7" },
];

export function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = findProduct(id || "");
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [checkingSize, setCheckingSize] = useState<number | null>(null);
  const [sizeMessage, setSizeMessage] = useState('');
  const [sizeAvailable, setSizeAvailable] = useState(true);
  const [quantity, setQuantity] = useState(1);
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass-card p-10">
          <h1 className="text-3xl font-bold text-foreground mb-4">المنتج غير موجود</h1>
          <Link to="/collections" className="text-primary hover:underline">العودة للمجموعات</Link>
        </div>
      </div>
    );
  }

  const savings = product.originalPrice ? product.originalPrice - product.price : 0;
  const primaryColor = product.colors[0] ?? { name: "غير محدد", hex: "transparent" };

  const handleSizeSelect = (index: number) => {
    if (index === selectedSize || checkingSize !== null) return;
    setCheckingSize(index);
    setSizeMessage('');
    // Simulate availability check
    setTimeout(() => {
      setCheckingSize(null);
      setSelectedSize(index);
      setSizeAvailable(true);
      setSizeMessage('المقاس متاح — جاهز للشحن');
      setTimeout(() => setSizeMessage(''), 3000);
    }, 800);
  };
  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  return (
    <div>
      {/* ═══════════ 1. MAIN PRODUCT ═══════════ */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-24 pb-12">
        <nav className="flex items-center gap-2 text-xs text-foreground/40 mb-8">
          <Link to="/" className="hover:text-ring transition-colors">الرئيسية</Link>
          <ChevronLeft size={12} />
          <Link to="/collections" className="hover:text-ring transition-colors">المجموعات</Link>
          <ChevronLeft size={12} />
          <span className="text-foreground font-medium">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          {/* LEFT: IMAGE GALLERY */}
          <div className="relative">
            {product.images.length === 1 ? (
              /* Single image */
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden glass-card border-0 p-0">
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                {product.badge && (
                  <span className="absolute top-4 right-4 px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-full">{product.badge}</span>
                )}
              </div>
            ) : (
              /* Main image + thumbnails on right */
              <div className="flex gap-3">
                {/* Main image */}
                <div className="flex-1 relative aspect-[3/4] rounded-2xl overflow-hidden glass-card border-0 p-0">
                  <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
                  {product.badge && (
                    <span className="absolute top-4 right-4 px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-full">{product.badge}</span>
                  )}
                </div>
                {/* Thumbnails on right */}
                <div className="flex flex-col gap-2 w-16 md:w-20 flex-shrink-0">
                  {product.images.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        i === activeImage ? "border-primary" : "border-black/10 hover:border-black/20"
                      }`}
                    >
                      <img src={src} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: PRODUCT INFO */}
          <div className="flex flex-col">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">{product.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} size={14} className={s < Math.round(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-foreground/20"} />
                ))}
              </div>
              <span className="text-xs text-foreground/40">({product.reviewCount} تقييم)</span>
            </div>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-2xl font-bold text-primary">{product.price} د.ل</span>
              {product.originalPrice && (
                <>
                  <span className="text-sm text-foreground/30 line-through">{product.originalPrice} د.ل</span>
                  {savings > 0 && <span className="text-xs glass px-2 py-0.5 rounded-full font-semibold text-primary">وفّري {savings} د.ل</span>}
                </>
              )}
            </div>

            {/* More Details Toggle */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="mb-5">
                <details className="group">
                  <summary className="flex items-center gap-2 cursor-pointer select-none list-none mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary group-open:scale-125 transition-transform" />
                    <span className="text-xs font-semibold text-primary tracking-wide">المزيد من التفاصيل</span>
                    <svg className="w-3 h-3 text-primary/60 group-open:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="overflow-hidden transition-all duration-500 ease-out">
                    <div className="rounded-2xl p-5 relative overflow-hidden" style={{ background: "var(--color-background)", border: "1px solid rgba(0,0,0,0.04)" }}>
                      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                      <div className="relative z-10 space-y-3">
                        {product.highlights.map((h, i) => (
                          <div key={i} className="flex items-start gap-3 group/item">
                            <div className="w-6 h-6 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform">
                              <Star size={10} className="text-primary fill-primary" />
                            </div>
                            <span className="text-xs text-foreground/60 leading-relaxed group-hover/item:text-foreground/80 transition-colors">{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </details>
              </div>
            )}

            <p className="text-xs text-foreground/40 mb-4">القماش: {product.fabric}</p>

            {/* Colors */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-foreground/60 mb-2">اللون: <span className="font-normal text-foreground/80">{primaryColor.name}</span></p>
              <div className="flex gap-2">
                {product.colors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => color.linkTo ? navigate(`/product/${color.linkTo}`) : undefined}
                    className={`block w-8 h-8 rounded-full border-2 cursor-pointer hover:scale-110 transition-transform ${i === 0 ? "border-primary shadow-lg shadow-primary/20" : "border-black/10 hover:border-black/30"}`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                    aria-label={color.name}
                    type="button"
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-foreground/60 mb-2">المقاس: <span className="font-normal text-foreground/80">{product.sizes[selectedSize]}</span></p>
              <div className="flex gap-2">
                {product.sizes.map((size, i) => {
                  const isSelected = i === selectedSize;
                  const isChecking = checkingSize === i;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSizeSelect(i)}
                      disabled={isChecking}
                      className={`relative w-12 h-12 rounded-xl border-2 text-xs font-bold transition-all duration-300 overflow-hidden ${
                        isSelected
                          ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                          : isChecking
                            ? "border-primary/50 bg-primary/5 text-primary"
                            : "border-black/10 text-foreground/60 hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      {isChecking ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        </div>
                      ) : (
                        <span className={isSelected ? "relative z-10" : ""}>{size}</span>
                      )}
                      {isSelected && !isChecking && (
                        <div className="absolute inset-0 bg-primary animate-pulse opacity-20 rounded-xl" />
                      )}
                    </button>
                  );
                })}
              </div>
              {/* Size availability message */}
              {sizeMessage && (
                <div className={`mt-2.5 flex items-center gap-2 text-[11px] font-medium transition-all duration-300 ${sizeAvailable ? "text-green-600" : "text-red-400"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${sizeAvailable ? "bg-green-500" : "bg-red-400"} animate-pulse`} />
                  {sizeMessage}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="glass-card p-4 rounded-xl mb-5">
              <p className="text-xs text-foreground/50 leading-relaxed">{product.description}</p>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-4 mb-2">
              <div className="flex items-center glass-card rounded-xl overflow-hidden">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 hover:bg-black/5 transition-colors"><Minus size={14} /></button>
                <span className="px-4 text-sm font-semibold text-foreground min-w-[2rem] text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 hover:bg-black/5 transition-colors"><Plus size={14} /></button>
              </div>
              <button className="flex-1 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
                أضيفي إلى السلة — {product.price * quantity} د.ل
              </button>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-1.5 mb-3 justify-center mr-32">
              <img src="/images/payments/visa.svg" alt="Visa" className="h-[22px] w-auto object-contain" />
              <img src="/images/payments/mastercard.svg" alt="Mastercard" className="h-[22px] w-auto object-contain" />
              <img src="/images/payments/amex.svg" alt="Amex" className="h-[22px] w-auto object-contain" />
              <img src="/images/payments/paypal.svg" alt="PayPal" className="h-[22px] w-auto object-contain" />
              <img src="/images/payments/google-pay.svg" alt="Google Pay" className="h-[22px] w-auto object-contain" />
              <img src="/images/payments/stripe.svg" alt="Stripe" className="h-[22px] w-auto object-contain" />
              <img src="/images/payments/apple-pay.svg" alt="Apple Pay" className="h-[22px] w-auto object-contain" />
              <img src="/images/payments/klarna.svg" alt="Klarna" className="h-[22px] w-auto object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 2. TRUST ITEMS (Compact) ═══════════ */}
      <section className="py-6">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-black/[0.06] divide-x divide-black/[0.06]">
            {trustItems.map((item, i) => (
              <div key={i} className="group relative overflow-hidden px-3 py-4 transition-all duration-500 hover:bg-black/[0.03]">
                <div className="flex items-center gap-2.5">
                  <div className="relative z-10 w-7 h-7 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-500">
                    <item.icon className="text-primary" size={12} strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      {item.stat && (
                        <span className="text-xs font-bold text-primary/30 font-display">{item.stat}</span>
                      )}
                      <h3 className="text-[11px] font-bold text-foreground truncate">{item.title}</h3>
                    </div>
                    <p className="text-[9px] font-light text-foreground/35 leading-tight truncate">{item.description}</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 3. RELATED PRODUCTS ═══════════ */}
      {related.length > 0 && (
        <section className="py-12">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <h2 className="font-display text-2xl font-bold text-foreground text-center mb-10">منتجات <span className="text-primary">ذات صلة</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`} className="glass-card rounded-2xl overflow-hidden hover:scale-[1.02] transition-transform">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 text-right">
                    <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-primary">{p.price} د.ل</span>
                      {p.originalPrice && <span className="text-xs text-foreground/30 line-through">{p.originalPrice} د.ل</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
