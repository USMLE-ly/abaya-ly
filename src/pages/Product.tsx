import { useState, useRef } from "react";
import { SlideTabs } from "@/components/ui/slide-tabs";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight, Minus, Plus, Truck, Shield, RotateCcw, Headphones, ChevronDown } from "lucide-react";
import { findProduct, products } from "@/data/products";

const trustItems = [
  { icon: Truck, title: "شحن مجاني", text: "لجميع مدن ليبيا" },
  { icon: RotateCcw, title: "إرجاع سهل", text: "خلال ٧ أيام" },
  { icon: Shield, title: "ضمان الجودة", text: "أقمشة عالمية مضمونة" },
  { icon: Headphones, title: "دعم متواصل", text: "واتساب على مدار الساعة" },
];

const testimonialData = [
  { stars: 5, title: "جودة ممتازة", text: "عباية رائعه جداً، القماش فاخر والتطريز جميل. أنصح بها بشدة!", author: "سارة م." },
  { stars: 5, title: "شحن سريع", text: "وصلني الطلب بسرعة والتغليف كان ممتاز. سعر مناسب جداً للجودة.", author: "فاطمة ع." },
  { stars: 5, title: "خدمة ممتازة", text: "فريق الدعم كان متعاون جداً وساعدوني في اختيار المقاس المناسب.", author: "مريم خ." },
];

function AccordionTab({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-black/5">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-4 text-right">
        <span className="font-semibold text-foreground">{title}</span>
        <ChevronDown size={18} className={`text-foreground/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <div className="pb-4 text-sm text-foreground/50 leading-relaxed">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const tabNames = ["التفاصيل", "الشحن والتوصيل", "التقييمات"];

function ContentTabs({ product, testimonials }: { product: ReturnType<typeof findProduct> & {}; testimonials: typeof testimonialData }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <SlideTabs tabs={tabNames} selectedIndex={activeTab} onSelect={setActiveTab} />
      <div className="mt-6 glass-card p-6">
        {activeTab === 0 && (
          <ul className="space-y-2">
            {product.details.map((d: string, i: number) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                {d}
              </li>
            ))}
          </ul>
        )}
        {activeTab === 1 && (
          <p className="text-sm text-foreground/50 leading-relaxed">الشحن مجاني لجميع مدن ليبيا. يتم التوصيل خلال ٣-٥ أيام عمل.</p>
        )}
        {activeTab === 2 && (
          <div className="space-y-4">
            {testimonials.map((t, i) => (
              <div key={i} className="border-b border-black/5 pb-4 last:border-0">
                <div className="flex gap-0.5 mb-1">
                  {Array.from({ length: t.stars }).map((_, s) => (
                    <Star key={s} size={12} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm font-semibold text-foreground">{t.title}</p>
                <p className="text-xs text-foreground/40 mt-1">{t.text}</p>
                <p className="text-[10px] text-primary mt-1">— {t.author}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function Product() {
  const { id } = useParams();
  const product = findProduct(id || "");
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);

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
  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  const scrollToImage = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.offsetWidth;
    const newScroll = direction === "right"
      ? scrollRef.current.scrollLeft + cardWidth
      : scrollRef.current.scrollLeft - cardWidth;
    scrollRef.current.scrollTo({ left: newScroll, behavior: "smooth" });
  };

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
          {/* LEFT: IMAGE GALLERY — each image is a full main image */}
          <div className="relative">
            {product.images.length === 1 ? (
              /* Single image — full display */
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden glass-card border-0 p-0">
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                {product.badge && (
                  <span className="absolute top-4 right-4 px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-full">{product.badge}</span>
                )}
              </div>
            ) : (
              /* Multiple images — horizontal scroll gallery, each image full size */
              <>
                <div
                  ref={scrollRef}
                  className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {product.images.map((src, i) => (
                    <div
                      key={i}
                      className="flex-shrink-0 w-full snap-center relative aspect-[3/4] rounded-2xl overflow-hidden glass-card border-0 p-0 cursor-pointer"
                      onClick={() => setActiveImage(i)}
                    >
                      <img src={src} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      {i === 0 && product.badge && (
                        <span className="absolute top-4 right-4 px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-full">{product.badge}</span>
                      )}
                      {/* Image counter */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm text-white text-xs">
                        {i + 1} / {product.images.length}
                      </div>
                    </div>
                  ))}
                </div>
                {/* Navigation arrows */}
                {product.images.length > 1 && (
                  <>
                    <button onClick={() => scrollToImage("left")} className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors z-10">
                      <ChevronRight size={20} />
                    </button>
                    <button onClick={() => scrollToImage("right")} className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors z-10">
                      <ChevronLeft size={20} />
                    </button>
                  </>
                )}
                {/* Dot indicators */}
                <div className="flex justify-center gap-2 mt-4">
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setActiveImage(i);
                        scrollRef.current?.scrollTo({ left: i * scrollRef.current.offsetWidth, behavior: "smooth" });
                      }}
                      className={`w-2 h-2 rounded-full transition-all ${i === activeImage ? "bg-primary w-6" : "bg-foreground/20"}`}
                    />
                  ))}
                </div>
              </>
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
                {product.sizes.map((size, i) => (
                  <button key={i} onClick={() => setSelectedSize(i)} className={`w-10 h-10 rounded-lg border text-xs font-semibold transition-all ${i === selectedSize ? "border-primary bg-primary text-white" : "border-black/10 text-foreground/60 hover:border-primary"}`}>{size}</button>
                ))}
              </div>
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

            {/* Trust items */}
            <div className="grid grid-cols-2 gap-3">
              {trustItems.map((item, i) => (
                <div key={i} className="flex items-center gap-2 glass-card p-3 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                    <item.icon size={14} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-foreground/80">{item.title}</p>
                    <p className="text-[9px] text-foreground/40">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 2. RELATED PRODUCTS ═══════════ */}
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

      {/* ═══════════ 3. CONTENT TABS ═══════════ */}
      <section className="py-12">
        <div className="max-w-[800px] mx-auto px-4 sm:px-6">
          <ContentTabs product={product} testimonials={testimonialData} />
        </div>
      </section>

      {/* ═══════════ 4. CUSTOM COLUMNS ═══════════ */}
      <section className="py-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">لماذا تختارين الملكة؟</h3>
              <div className="space-y-4">
                {trustItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0"><item.icon size={14} className="text-primary" /></div>
                    <div>
                      <p className="text-xs font-semibold text-foreground/80">{item.title}</p>
                      <p className="text-[10px] text-foreground/40">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-full aspect-square rounded-2xl glass-card border-0 overflow-hidden p-0">
                <img src="/outfits/gold-embroidered-abaya-3.jpg" alt="عباية التطريز الذهبي" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="w-full aspect-square rounded-2xl glass-card border-0 overflow-hidden p-0">
                <img src="/outfits/geometric-gold-abaya-3.jpg" alt="عباية النمط الهندسي" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 5. ALL IMAGES GALLERY ═══════════ */}
      {product.images.length > 1 && (
        <section className="py-16">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <h2 className="font-display text-2xl font-bold text-foreground text-center mb-10">صور <span className="text-primary">المجموعة</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {product.images.map((src, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl overflow-hidden glass-card border-0 p-0">
                  <img src={src} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════ 6. TESTIMONIALS ═══════════ */}
      <section className="py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <h2 className="font-display text-2xl font-bold text-foreground text-center mb-10">ماذا تقول <span className="text-primary">عملاؤنا</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonialData.map((t, i) => (
              <div key={i} className="glass-card p-6 text-center">
                <div className="flex justify-center gap-0.5 mb-3">{Array.from({ length: t.stars }).map((_, s) => (<Star key={s} size={16} className="fill-yellow-400 text-yellow-400" />))}</div>
                <p className="text-sm font-semibold text-foreground mb-2">{t.title}</p>
                <p className="text-xs text-foreground/40 leading-relaxed mb-3">{t.text}</p>
                <p className="text-xs font-medium text-primary">— {t.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 7. WAVE DIVIDER ═══════════ */}
      <div className="bg-primary">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 30C120 10 240 50 360 30C480 10 600 50 720 30C840 10 960 50 1080 30C1200 10 1320 50 1440 30V60H0V30Z" fill="var(--color-background)" />
        </svg>
      </div>
    </div>
  );
}
