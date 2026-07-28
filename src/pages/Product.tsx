import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Star, ChevronLeft, Minus, Plus, Truck, RotateCcw, Shield, Headphones, Check, Sparkles } from "lucide-react";
import { findProduct, products, Product as ProductType } from "@/data/products";
import { Button, Badge, Card } from "@/components/velar";

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
        <Card elevation="raised" padding="xl" className="text-center">
          <h1 className="text-3xl font-bold text-fg mb-4">المنتج غير موجود</h1>
          <Link to="/collections"><Button variant="primary">العودة للمجموعات</Button></Link>
        </Card>
      </div>
    );
  }

  const savings = product.originalPrice ? product.originalPrice - product.price : 0;
  const primaryColor = product.colors[0] ?? { name: "غير محدد", hex: "transparent" };
  const descriptor = product.name;
  
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
              <span className="text-3xl font-bold text-fg">{product.price} د.ل</span>
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
              <Button variant="primary" className="flex-1" size="lg">
                أضيفي إلى السلة — {product.price * quantity} د.ل
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

      
      
    </div>
  );
}
