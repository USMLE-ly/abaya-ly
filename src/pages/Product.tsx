import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, ChevronLeft, Minus, Plus, Truck, RotateCcw, Shield, Headphones, Check, Sparkles, Tag, ShoppingBag } from "lucide-react";
import { BookingModal } from "@/components/BookingModal";
import { findProduct, products, Product as ProductType } from "@/data/products";
import { Button, Badge, Card } from "@/components/velar";

const SITE_URL = "https://nadine.luxor.ly";

const trustItems = [
  { icon: Truck, title: "شحن مجاني", description: "لجميع مدن ليبيا — التوصيل خلال 3-5 أيام عمل", stat: "7" },
  { icon: RotateCcw, title: "إرجاع سهل", description: "خلال 7 أيام من تاريخ الاستلام بدون أي تعقيد", stat: "7" },
  { icon: Shield, title: "ضمان الجودة", description: "أقمشة عالمية مضمونة من أفضل المصانع العالمية", stat: "100%" },
  { icon: Headphones, title: "دعم متواصل", description: "فريق خدمة العملاء متاح عبر الواتساب على مدار الساعة", stat: "24/7" },
];

// ── Color family mapping for tag-based matching ──────────────────
const COLOR_FAMILIES: Record<string, string[]> = {
  "white": ["أبيض", "كريمي", "عاجي", "نابلي", "بيج"],
  "black": ["أسود", "فحمي", "كحلي غامق"],
  "gold": ["ذهبي", "برونزي", "كاكاو", "بني"],
  "red": ["نبيذي", "عنابي", "يابوقي", "أحمر"],
  "blue": ["أزرق سماوي", "كحلي", "سماوي", "أزرق"],
  "pink": ["وردي", "سالمون"],
  "green": ["أخضر", "زيتي"],
  "silver": ["فضي", "رمادي"],
};

const SILHOUETTE_TAGS = ["ميدي", "ماكسي", "قصيرة", "طويلة", "محدّدة الخصر", "واسعة", "محتشمة"];
const STYLE_TAGS = ["سهرة", "كاجوال", "رسمي", "نهاري", "مسائي", "مناسبات"];

function getColorFamily(colorName: string): string | null {
  for (const [family, names] of Object.entries(COLOR_FAMILIES)) {
    if (names.some(n => colorName.includes(n) || n.includes(colorName))) return family;
  }
  return null;
}

// ── Tag-based related products scoring ────────────────────────────
function getRelatedProducts(current: ProductType, max = 4): ProductType[] {
  const currentColorFamily = getColorFamily(current.colors[0]?.name ?? "");
  const currentTags = new Set(current.tags);

  const scored = products
    .filter(p => p.id !== current.id)
    .map(p => {
      let score = 0;
      // +3 for same collection
      if (p.collection === current.collection) score += 3;
      // +2 for same color family
      const pColorFamily = getColorFamily(p.colors[0]?.name ?? "");
      if (currentColorFamily && pColorFamily === currentColorFamily) score += 2;
      // +1 for each shared silhouette tag
      for (const tag of SILHOUETTE_TAGS) {
        if (currentTags.has(tag) && p.tags.some(t => t.includes(tag) || tag.includes(t))) score += 1;
      }
      // +1 for each shared style tag
      for (const tag of STYLE_TAGS) {
        if (currentTags.has(tag) && p.tags.some(t => t.includes(tag) || tag.includes(t))) score += 1;
      }
      // +0.5 for each additional shared tag
      for (const tag of p.tags) {
        if (currentTags.has(tag) && !SILHOUETTE_TAGS.includes(tag) && !STYLE_TAGS.includes(tag)) score += 0.5;
      }
      return { product: p, score };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, max);

  // Fallback to category-based if no tag matches
  if (scored.length === 0) {
    return products
      .filter(p => p.id !== current.id && p.category === current.category)
      .slice(0, max);
  }
  return scored.map(s => s.product);
}

// ── JSON-LD component ─────────────────────────────────────────────
function JsonLdScript({ product }: { product: ProductType }) {
  useEffect(() => {
    const productUrl = `${SITE_URL}/product/${product.id}`;
    const imageUrl = product.images[0]?.startsWith("http")
      ? product.images[0]
      : `${SITE_URL}${product.images[0]}`;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.seoName,
      description: product.subtitle,
      image: imageUrl,
      url: productUrl,
      brand: { "@type": "Brand", name: "Nadine" },
      category: product.category,
      color: product.colors[0]?.name,
      material: product.fabric,
      offers: {
        "@type": "Offer",
        price: product.price,
        priceCurrency: "LYD",
        availability: "https://schema.org/InStock",
        url: productUrl,
        seller: { "@type": "Brand", name: "Nadine" },
      },
      aggregateRating: product.reviewCount > 0 ? {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
      } : undefined,
    };
    // Set OG meta tags
    document.title = product.seoName + " — نادين";
    let ogDesc = document.querySelector('meta[name="description"]');
    if (!ogDesc) { ogDesc = document.createElement("meta"); ogDesc.setAttribute("name", "description"); document.head.appendChild(ogDesc); }
    ogDesc.setAttribute("content", product.subtitle);
    const ogTags = [
      { property: "og:title", content: product.seoName },
      { property: "og:description", content: product.subtitle },
      { property: "og:image", content: imageUrl },
      { property: "og:url", content: productUrl },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: product.seoName },
      { name: "twitter:description", content: product.subtitle },
      { name: "twitter:image", content: imageUrl },
    ];
    for (const tag of ogTags) {
      let el = document.querySelector(`meta[property="${tag.property}"]`) || document.querySelector(`meta[name="${tag.property}"]`);
      if (!el) {
        el = document.createElement("meta");
        if (tag.property) el.setAttribute("property", tag.property);
        else el.setAttribute("name", tag.name!);
        document.head.appendChild(el);
      }
      el.setAttribute("content", tag.content);
    }

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [product]);

  return null;
}

export function Product() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = findProduct(id || "");
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [checkingSize, setCheckingSize] = useState<number | null>(null);
  const [sizeMessage, setSizeMessage] = useState('');
  const [sizeAvailable, setSizeAvailable] = useState(true);
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card elevation="raised" padding="xl" className="text-center">
          <h1 className="text-3xl font-bold text-fg mb-4">المنتج غير موجود</h1>
          <Link to="/collections"><Button variant="primary">العودة للمجموعات</Button></Link>
        </Card>
      </div>
    );
  }

  const savings = product.originalPrice ? product.originalPrice - product.price : 0;
  const primaryColor = product.colors[0] ?? { name: "غير محدد", hex: "transparent" };
  const descriptor = product.name.split(" • ").slice(2).join(" • ") ?? product.name;
  const related = getRelatedProducts(product);

  const handleSizeSelect = (index: number) => {
    if (index === selectedSize || checkingSize !== null) return;
    setCheckingSize(index);
    setSizeMessage('');
    setTimeout(() => {
      setCheckingSize(null);
      setSelectedSize(index);
      setSizeAvailable(true);
      setSizeMessage('المقاس متاح — جاهز للشحن');
      setTimeout(() => setSizeMessage(''), 3000);
    }, 800);
  };

  return (
    <div>
      <JsonLdScript product={product} />

      {/* 1. MAIN PRODUCT */}
      <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 pt-24 pb-12">
        <nav className="flex items-center gap-2 text-xs text-fg-tertiary mb-8">
          <Link to="/" className="hover:text-ring transition-colors">الرئيسية</Link>
          <ChevronLeft size={12} />
          <Link to="/collections" className="hover:text-ring transition-colors">المجموعات</Link>
          <ChevronLeft size={12} />
          <span className="text-fg font-medium">{product.collection} • {product.model}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          {/* LEFT: IMAGE GALLERY */}
          <div className="relative">
            {product.images.length === 1 ? (
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden glass-card border-0 p-0">
                <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                {product.badge && (
                  <Badge tone="brand" className="absolute top-4 right-4">{product.badge}</Badge>
                )}
              </div>
            ) : (
              <div className="flex gap-3">
                <div className="flex-1 relative aspect-[3/4] rounded-2xl overflow-hidden glass-card border-0 p-0">
                  <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
                  {product.badge && (
                    <Badge tone="brand" className="absolute top-4 right-4">{product.badge}</Badge>
                  )}
                </div>
                <div className="flex flex-col gap-2 w-16 md:w-20 flex-shrink-0">
                  {product.images.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`aspect-square rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                        i === activeImage ? "border-primary" : "border-line-subtle hover:border-line-default"
                      }`}
                    >
                      <img src={src} alt={`${product.name} ${i + 1}`} className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: DETAILS */}
          <div className="flex flex-col">
            {/* ── Premium Typographic Hierarchy ── */}
            <div className="mb-4">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] font-semibold text-accent-brand mb-2">
                <Sparkles size={12} className="text-accent-brand/60" />
                <span>{product.collection}</span>
                <span className="text-fg-tertiary/40">•</span>
                <span className="text-fg-tertiary">{product.edition}</span>
              </div>
              <p className="text-sm uppercase tracking-[0.18em] text-fg-secondary font-medium mb-1">{product.model}</p>
              <span className="text-[10px] uppercase tracking-[0.25em] font-mono mb-1 block bg-gradient-to-r text-strawberry-600">{product.code}</span>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-fg leading-tight mb-2">{descriptor}</h1>
              <p className="text-sm text-fg-secondary italic mb-1">{product.subtitle}</p>
              <div className="mt-3 w-16 h-[1px] bg-gradient-to-r from-accent-brand/40 to-transparent" />
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < Math.round(product.rating) ? "fill-accent-brand text-accent-brand" : "text-line-default"} />
                ))}
              </div>
              <span className="text-xs text-fg-tertiary">({product.reviewCount} تقييم)</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-strawberry-600">{product.price} د.ل</span>
              {product.originalPrice && (
                <>
                  <span className="text-lg text-fg-tertiary line-through">{product.originalPrice} د.ل</span>
                  <Badge tone="danger" size="sm">وفر {savings} د.ل</Badge>
                </>
              )}
            </div>

            {/* Colors */}
            <div className="mb-6">
              <p className="text-xs font-medium text-fg-secondary mb-3">اللون: <span className="text-fg">{primaryColor.name}</span></p>
              <div className="flex items-center gap-2">
                {product.colors.map((color, i) => (
                  <Link
                    key={i}
                    to={color.linkTo ? `/product/${color.linkTo}` : "#"}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${i === 0 ? "border-primary ring-2 ring-primary/20" : "border-line-subtle hover:border-line-default"}`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-6">
              <p className="text-xs font-medium text-fg-secondary mb-3">المقاس</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size, i) => (
                  <Button
                    key={size}
                    variant={i === selectedSize ? "primary" : "tertiary"}
                    size="sm"
                    onClick={() => handleSizeSelect(i)}
                    loading={checkingSize === i}
                  >
                    {size}
                  </Button>
                ))}
              </div>
              {sizeMessage && (
                <p className="text-xs text-status-success mt-2">{sizeMessage}</p>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-fg-secondary leading-relaxed mb-6">{product.description}</p>

            {/* Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-medium text-fg-secondary mb-3 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-accent-brand/60" />
                  مميزات التصميم
                </p>
                <ul className="space-y-2">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="text-xs text-fg-secondary flex items-start gap-2.5 leading-relaxed">
                      <Check size={12} className="text-accent-brand mt-0.5 flex-shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Details */}
            <div className="mb-6">
              <p className="text-xs font-medium text-fg-secondary mb-2">التفاصيل</p>
              <ul className="space-y-1">
                {product.details.map((detail, i) => (
                  <li key={i} className="text-xs text-fg-tertiary flex items-start gap-2">
                    <span className="text-accent-brand mt-0.5">•</span>
                    {detail}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center glass-card rounded-xl overflow-hidden">
                <Button variant="ghost" iconOnly size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus size={14} />
                </Button>
                <span className="px-4 text-sm font-semibold text-fg min-w-[2rem] text-center">{quantity}</span>
                <Button variant="ghost" iconOnly size="sm" onClick={() => setQuantity(quantity + 1)}>
                  <Plus size={14} />
                </Button>
              </div>
              <Button variant="primary" className="flex-1" size="lg" onClick={() => setShowBooking(true)}>
                <ShoppingBag size={18} />
                احجزي هذا الفستان — {product.price} د.ل
              </Button>
            </div>

            {/* Payment Methods */}
            <div className="flex items-center gap-1.5 mb-3 justify-center mr-32">
              <img src="/images/payments/visa.svg" alt="Visa" className="h-[22px] w-auto object-contain" />
              <img src="/images/payments/mastercard.svg" alt="Mastercard" className="h-[22px] w-auto object-contain" />
              <img src="/images/payments/amex.svg" alt="Amex" className="h-[22px] w-auto object-contain" />
              <img src="/images/payments/google-pay.svg" alt="Google Pay" className="h-[22px] w-auto object-contain" />
              <img src="/images/payments/stripe.svg" alt="Stripe" className="h-[22px] w-auto object-contain" />
              <img src="/images/payments/paypal.svg" alt="PayPal" className="h-[22px] w-auto object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: "rgba(17,15,13,0.70)", backdropFilter: "blur(8px)" }}
          onClick={() => setShowSizeGuide(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(24px)", border: "1px solid rgba(196,40,85,0.12)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-fg">دليل المقاسات</h3>
                <button onClick={() => setShowSizeGuide(false)} className="text-fg-tertiary hover:text-fg"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-sm">
                  <thead>
                    <tr className="border-b border-line-subtle">
                      <th className="py-2 pl-4 text-fg font-semibold">المقاس</th>
                      <th className="py-2 pl-4 text-fg font-semibold">الصدر (سم)</th>
                      <th className="py-2 pl-4 text-fg font-semibold">الخصر (سم)</th>
                      <th className="py-2 text-fg font-semibold">الأرداف (سم)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-line-subtle"><td className="py-2 pl-4">S</td><td className="py-2 pl-4">86-91</td><td className="py-2 pl-4">66-71</td><td className="py-2">91-97</td></tr>
                    <tr className="border-b border-line-subtle"><td className="py-2 pl-4">M</td><td className="py-2 pl-4">91-97</td><td className="py-2 pl-4">71-76</td><td className="py-2">97-102</td></tr>
                    <tr className="border-b border-line-subtle"><td className="py-2 pl-4">L</td><td className="py-2 pl-4">97-102</td><td className="py-2 pl-4">76-81</td><td className="py-2">102-107</td></tr>
                    <tr><td className="py-2 pl-4">XL</td><td className="py-2 pl-4">102-107</td><td className="py-2 pl-4">81-86</td><td className="py-2">107-112</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-fg-tertiary mt-4 leading-relaxed">مقاسات تقريبية — يرجى التواصل عبر واتساب للحصول على مقاسات دقيقة حسب طلبك.</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Booking Modal */}
      <BookingModal
        open={showBooking}
        onClose={() => setShowBooking(false)}
        productCode={product.code}
        productName={product.name.split(" • ").slice(2).join(" • ") ?? product.name}
        colors={product.colors}
        sizes={product.sizes}
      />

      {/* 2. TRUST ITEMS */}
      <section className="py-6">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-line-subtle divide-x divide-line-subtle">
            {trustItems.map((item, i) => (
              <div key={i} className="group relative overflow-hidden px-3 py-4 transition-all duration-500 hover:bg-sunken">
                <div className="flex items-center gap-2.5">
                  <div className="relative z-10 w-7 h-7 rounded-xl bg-gradient-to-br from-accent-brand/15 to-accent-brand/5 border border-accent-brand/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-all duration-500">
                    <item.icon className="text-accent-brand" size={12} strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      {item.stat && (
                        <span className="text-xs font-bold text-accent-brand/30 font-display">{item.stat}</span>
                      )}
                      <h3 className="text-[11px] font-bold text-fg truncate">{item.title}</h3>
                    </div>
                    <p className="text-[9px] text-fg-tertiary leading-tight truncate">{item.description}</p>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent-brand/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. TAG-BASED RELATED PRODUCTS */}
      {related.length > 0 && (
        <section className="py-12">
          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="text-center mb-10">
              <h2 className="font-display text-2xl font-bold text-fg mb-2">منتجات <span className="text-accent-brand">مختارة لكِ</span></h2>
              <p className="text-xs text-fg-tertiary">بناءً على المجموعة، الألوان، وستايل التصميم</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <Link key={p.id} to={`/product/${p.id}`}>
                  <div className="group relative overflow-hidden rounded-2xl transition-all duration-500 cursor-pointer"
                    style={{
                      background: "rgba(255,255,255,0.7)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(196,40,85,0.12)",
                    }}
                  >
                    <div className="aspect-[3/4] overflow-hidden relative">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <div className="p-3 text-right">
                      <p className="text-[10px] uppercase tracking-[0.15em] text-accent-brand/70 font-semibold mb-0.5">{p.collection}</p>
                      <p className="text-xs font-semibold text-fg truncate">{p.name.split(" • ").slice(2).join(" • ") ?? p.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-accent-brand">{p.price} د.ل</span>
                        {p.originalPrice && <span className="text-xs text-fg-tertiary line-through">{p.originalPrice} د.ل</span>}
                      </div>
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
