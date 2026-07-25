import { useState } from "react";
import { useParams, Link } from "react-router-dom";
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
  const product = findProduct(id || "");
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
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
              <p className="text-xs font-semibold text-foreground/60 mb-2">اللون: <span className="font-normal text-foreground/80">{product.colors[selectedColor].name}</span></p>
              <div className="flex gap-2">
                {product.colors.map((color, i) => (
                  <button key={i} onClick={() => setSelectedColor(i)} className={`w-8 h-8 rounded-full border-2 transition-all ${i === selectedColor ? "border-primary scale-110" : "border-black/10 hover:border-black/15"}`} style={{ backgroundColor: color.hex }} title={color.name} />
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
            <div className="flex items-center gap-4 mb-5">
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
            <div className="mt-4 pt-4 border-t border-black/5">
              <p className="text-[10px] text-foreground/30 mb-2.5 tracking-wide">طرق الدفع المتاحة</p>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Visa */}
                <div className="px-2.5 py-1.5 rounded-lg bg-white border border-black/5 flex items-center justify-center">
                  <svg viewBox="0 0 48 32" className="h-5 w-auto" fill="none">
                    <rect width="48" height="32" rx="4" fill="#1A1F71"/>
                    <path d="M19.5 21H17.2L18.6 11H20.9L19.5 21Z" fill="#FFFFFF"/>
                    <path d="M30.2 11.3C29.8 11.2 29.1 11 28.3 11C26.3 11 24.9 12 24.8 13.5C24.8 14.6 25.8 15.2 26.6 15.5C27.4 15.8 27.7 16 27.7 16.3C27.7 16.8 27.1 16.9 26.6 16.9C25.8 16.9 25.4 16.8 24.6 17.1L24.3 17.2L24 18.7C24.6 18.5 25.6 18.3 26.7 18.3C28.8 18.3 30.2 17.3 30.2 15.6C30.2 14.7 29.6 14 28.4 13.4C27.7 13 27.3 12.7 27.3 12.4C27.3 12.1 27.7 11.8 28.3 11.8C29 11.8 29.6 12 30 12.2L30.3 12.4L30.6 11C30.2 10.8 29.4 10.6 28.4 10.6C26.2 10.6 24.7 11.7 24.7 13.4C24.7 14.4 25.3 15.2 26.4 15.7C27.1 16 27.4 16.2 27.4 16.5C27.4 16.9 26.9 17.1 26.3 17.1C25.5 17.1 24.9 17 24.3 16.8L24 16.7L23.7 15.3C24.2 15.5 25.1 15.7 26 15.7" fill="#FFFFFF"/>
                    <path d="M34.6 11H33C32.2 11 31.7 11.3 31.4 12.1L27.6 21H30.1L30.6 19.5H34L34.3 21H36.4L34.6 11ZM31.3 17.5L32.7 13.6L33.5 17.5H31.3Z" fill="#FFFFFF"/>
                    <path d="M16.2 11L13.5 17.7L13.2 16.3C12.6 14.5 10.9 12.5 9 11.6L11 21H13.5L17 11H16.2Z" fill="#FFFFFF"/>
                    <path d="M12.5 11H7.6L7.5 11.1C9.6 11.6 11.2 13.2 11.8 15.2L10.2 11.6C10.1 11.3 9.8 11 9.5 11H7L6.9 11.1C9.1 11.6 10.8 13.2 11.4 15.2L9.8 11.6C9.7 11.3 9.4 11 9.1 11H7" fill="#F7B600"/>
                  </svg>
                </div>
                {/* Mastercard */}
                <div className="px-2.5 py-1.5 rounded-lg bg-white border border-black/5 flex items-center justify-center">
                  <svg viewBox="0 0 48 32" className="h-5 w-auto" fill="none">
                    <rect width="48" height="32" rx="4" fill="#252525"/>
                    <circle cx="19" cy="16" r="8" fill="#EB001B"/>
                    <circle cx="29" cy="16" r="8" fill="#F79E1B"/>
                    <path d="M24 10.2C25.8 11.6 27 13.7 27 16C27 18.3 25.8 20.4 24 21.8C22.2 20.4 21 18.3 21 16C21 13.7 22.2 11.6 24 10.2Z" fill="#FF5F00"/>
                  </svg>
                </div>
                {/* Apple Pay */}
                <div className="px-2.5 py-1.5 rounded-lg bg-white border border-black/5 flex items-center justify-center">
                  <svg viewBox="0 0 48 32" className="h-5 w-auto" fill="none">
                    <rect width="48" height="32" rx="4" fill="#000000"/>
                    <path d="M17.2 10.5C17.8 9.7 18.2 8.6 18.1 7.5C17.1 7.6 15.9 8.2 15.3 9C14.7 9.8 14.2 10.9 14.3 11.9C15.4 12 16.5 11.3 17.2 10.5ZM18.1 12.2C16.6 12.1 15.3 13 14.6 13C13.8 13 12.7 12.2 11.5 12.2C9.9 12.2 8.5 13.1 7.7 14.5C6 17.3 7.3 21.5 8.9 23.8C9.7 24.9 10.6 26.1 11.8 26C12.9 26 13.3 25.3 14.7 25.3C16.1 25.3 16.4 26 17.6 26C18.8 26 19.6 24.9 20.4 23.8C21 23 21.3 22.1 21.3 22.1C21.3 22.1 19.9 21.5 19.9 19.8C19.9 18.4 21 17.8 21.1 17.7C20 16.1 18.3 15.9 17.7 15.8C16.5 15.6 15.4 16.4 14.8 16.4C14.1 16.4 13.2 15.8 12.1 15.8C10.5 15.8 9.1 16.7 8.3 18.1C6.7 20.9 7.9 25.1 9.5 27.4C10.3 28.5 11.2 29.7 12.4 29.6C13.5 29.6 13.9 28.9 15.3 28.9C16.7 28.9 17 29.6 18.2 29.6C19.4 29.6 20.2 28.5 21 27.4C21.6 26.6 21.8 25.8 21.8 25.8C21.8 25.8 20.2 25.2 20.2 23.3" fill="#FFFFFF"/>
                    <text x="26" y="20" fill="#FFFFFF" fontSize="7" fontWeight="bold" fontFamily="Arial">Pay</text>
                  </svg>
                </div>
                {/* Google Pay */}
                <div className="px-2.5 py-1.5 rounded-lg bg-white border border-black/5 flex items-center justify-center">
                  <svg viewBox="0 0 48 32" className="h-5 w-auto" fill="none">
                    <rect width="48" height="32" rx="4" fill="#FFFFFF" stroke="#E0E0E0"/>
                    <path d="M24 8C20.7 8 17.8 9.3 15.8 11.5L19.2 14.5C20.3 13.5 22 12.8 24 12.8C26.5 12.8 28.7 13.8 30.2 15.3L33.5 12C31.3 10 27.9 8 24 8Z" fill="#EA4335"/>
                    <path d="M15.8 11.5C14.7 12.9 14 14.6 14 16.5C14 18.4 14.7 20.1 15.8 21.5L19.2 18.5C18.7 17.9 18.4 17.2 18.4 16.5C18.4 15.8 18.7 15.1 19.2 14.5L15.8 11.5Z" fill="#FBBC05"/>
                    <path d="M24 25C27.9 25 31.3 23 33.5 20L30.2 17.5C28.7 18.8 26.5 19.8 24 19.8C22 19.8 20.3 19.1 19.2 18.1L15.8 21.1C17.8 23.3 20.7 25 24 25Z" fill="#34A853"/>
                    <path d="M38 16.5H24V19.5H32C31.6 21.5 30 23 28 23.8L31.5 26.8C34.8 24.5 38 20.8 38 16.5Z" fill="#4285F4"/>
                  </svg>
                </div>
                {/* Cash on Delivery */}
                <div className="px-2.5 py-1.5 rounded-lg bg-white border border-black/5 flex items-center justify-center gap-1">
                  <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="#16a34a" strokeWidth="1.5">
                    <rect x="2" y="4" width="16" height="12" rx="2"/>
                    <circle cx="10" cy="10" r="3"/>
                    <path d="M6 4V2M14 4V2"/>
                  </svg>
                  <span className="text-[9px] font-semibold text-foreground/50">نقدي</span>
                </div>
              </div>
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
