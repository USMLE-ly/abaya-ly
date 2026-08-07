import { PageTransition } from "@/components/PageTransition";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag, MessageCircle, X, Check, Truck, Banknote } from "lucide-react";
import { useMemo, useState } from "react";
import { Button, Card } from "@/components/velar";
import { products } from "@/data/products";
import { usePageMeta } from "@/lib/usePageMeta";

const WHATSAPP = "218944003708";
const shortName = (name: string) => name.split(" • ").slice(2).join(" • ") || name;

interface CartItem { id: string; name: string; fabric: string; price: number; image: string; color: string; size: string; quantity: number; }

const loadCart = (): CartItem[] => {
  try {
    const saved = localStorage.getItem("nadine-cart");
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

export function Cart() {
  usePageMeta("سلة تسوقكِ", "أكملي طلبكِ من نادين — شحن مجاني داخل بنغازي، الدفع عند الاستلام، وإرجاع خلال 7 أيام.");
  return <PageTransition><CartContent /></PageTransition>;
}

function CartContent() {
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const [showCheckout, setShowCheckout] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);

  const persist = (next: CartItem[]) => {
    localStorage.setItem("nadine-cart", JSON.stringify(next));
    window.dispatchEvent(new Event("nadine-cart"));
    return next;
  };

  const updateQty = (id: string, delta: number) => setItems((prev) =>
    persist(prev.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item))
  );

  const remove = (id: string) => setItems((prev) => persist(prev.filter((item) => item.id !== id)));

  const addItem = (product: typeof products[number]) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      const next = existing
        ? prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, {
            id: product.id,
            name: product.name,
            fabric: product.fabric,
            price: product.price,
            image: product.images[0],
            color: product.colors[0]?.name ?? "",
            size: product.sizes[0] ?? "M",
            quantity: 1,
          }];
      return persist(next);
    });
    setAddedId(product.id);
    window.setTimeout(() => setAddedId(null), 1400);
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalSavings = items.reduce((sum, item) => {
    const p = products.find((x) => x.id === item.id);
    return sum + (p?.originalPrice ? (p.originalPrice - p.price) * item.quantity : 0);
  }, 0);

  // Recommended: same collections first, then fill from the catalog
  const recommended = useMemo(() => {
    const cartIds = new Set(items.map((i) => i.id));
    const cartCollections = new Set(
      items.map((i) => products.find((p) => p.id === i.id)?.collection).filter(Boolean) as string[]
    );
    const pool = products.filter((p) => !cartIds.has(p.id));
    const sameCollection = pool.filter((p) => cartCollections.has(p.collection));
    const seen = new Set<string>();
    return [...sameCollection, ...pool]
      .filter((p) => (seen.has(p.id) ? false : (seen.add(p.id), true)))
      .slice(0, 4);
  }, [items]);

  const orderMessage = () => {
    const lines = items.map(
      (it, i) => `${i + 1}. ${shortName(it.name)} ×${it.quantity} — ${it.color} / ${it.size} — ${it.price * it.quantity} د.ل`
    );
    return `مرحباً نادين ♡\nأود تأكيد طلبي:\n\n${lines.join("\n")}\n\nالإجمالي: ${subtotal} د.ل\nالدفع عند الاستلام 💵`;
  };

  const whatsappUrl = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(orderMessage())}`;

  return (
    <div className="min-h-screen">
      <section className="pt-24 pb-6 md:pt-28 md:pb-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-fg">سلة التسوق</h1>
            <Link to="/collections" className="text-xs text-accent-brand hover:underline font-medium">متابعة التسوق</Link>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
          {items.length === 0 ? (
            <Card elevation="raised" padding="xl" className="text-center py-20">
              <div className="w-16 h-16 rounded-3xl mx-auto mb-5 grid place-items-center"
                style={{ background: "rgba(196,40,85,0.08)" }}>
                <ShoppingBag size={28} className="text-accent-brand" />
              </div>
              <p className="font-display text-lg font-bold text-fg mb-1">سلتكِ فارغة — لأول مرة فقط</p>
              <p className="text-fg-tertiary text-sm mb-6">اختاري فستانك من تشكيلة السهرة والمناسبات. الدفع عند الاستلام. الإرجاع خلال 7 أيام.</p>
              <Link to="/collections"><Button variant="primary" className="px-8">تسوقي الآن</Button></Link>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="mb-4 flex flex-wrap items-center gap-2 text-[10px] font-bold" style={{ color: "#c42855" }}>
                    <span className="rounded-full px-3 py-1.5" style={{ background: "rgba(196,40,85,0.07)" }}>شحن مجاني داخل بنغازي</span>
                    <span className="rounded-full px-3 py-1.5" style={{ background: "rgba(196,40,85,0.07)" }}>الدفع عند الاستلام</span>
                    <span className="rounded-full px-3 py-1.5" style={{ background: "rgba(196,40,85,0.07)" }}>إرجاع خلال 7 أيام</span>
                  </div>
                  <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-line-subtle text-xs font-semibold text-fg-tertiary">
                    <div className="col-span-6">المنتج</div>
                    <div className="col-span-3 text-center">الكمية</div>
                    <div className="col-span-3 text-end">الإجمالي</div>
                  </div>
                  {items.map((item) => (
                    <motion.div key={item.id} layout className="grid grid-cols-12 gap-4 py-5 border-b border-line-subtle items-center">
                      <div className="col-span-12 md:col-span-6 flex gap-4">
                        <Link to={`/product/${item.id}`} className="flex-shrink-0">
                          <OptimizedImage src={item.image} alt={item.name} className="w-[72px] h-[72px] rounded-lg flex-shrink-0" />
                        </Link>
                        <div className="min-w-0">
                          <Link to={`/product/${item.id}`} className="block">
                            <h3 className="text-[15px] font-semibold text-fg hover:text-accent-brand transition-colors truncate">
                              {shortName(item.name)}
                            </h3>
                          </Link>
                          <p className="text-xs text-fg-tertiary mt-1">اللون: {item.color} | المقاس: {item.size}</p>
                          {item.fabric && <p className="text-xs text-fg-tertiary mt-0.5">{item.fabric}</p>}
                          <button onClick={() => remove(item.id)} aria-label="حذف المنتج" className="mt-2 text-fg-tertiary hover:text-status-danger transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="col-span-6 md:col-span-3 flex items-center justify-start md:justify-center">
                        <div className="flex items-center border border-[#787878]/40 rounded-full">
                          <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center rounded-full text-fg hover:bg-sunken transition-colors" aria-label="إنقاص">
                            <Minus size={10} />
                          </button>
                          <span className="w-9 text-center text-sm font-medium text-fg">{item.quantity}</span>
                          <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center rounded-full text-fg hover:bg-sunken transition-colors" aria-label="زيادة">
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>
                      <div className="col-span-6 md:col-span-3 text-end">
                        <span className="text-base font-bold text-accent-brand">{item.price * item.quantity} د.ل</span>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="lg:col-span-1">
                  <Card elevation="raised" padding="lg" className="sticky top-24">
                    <h2 className="text-sm font-semibold text-fg mb-4">ملخص الطلب</h2>
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between">
                        <span className="text-fg-tertiary">عدد القطع</span>
                        <span className="font-medium text-fg-secondary">{itemCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-fg-tertiary">المجموع الفرعي</span>
                        <span className="font-medium text-fg-secondary">{subtotal} د.ل</span>
                      </div>
                      {totalSavings > 0 && (
                        <div className="flex justify-between">
                          <span className="text-fg-tertiary">وفّرتِ</span>
                          <span className="font-medium text-status-success">{totalSavings} د.ل</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-fg-tertiary flex items-center gap-1"><Truck size={12} /> التوصيل</span>
                        <span className="text-status-success font-medium">مجاني داخل بنغازي · 3-5 أيام</span>
                      </div>
                      <div className="h-px bg-line-subtle" />
                      <div className="flex justify-between text-base font-bold">
                        <span className="text-fg">الإجمالي</span>
                        <span className="text-accent-brand">{subtotal} د.ل</span>
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold rounded-xl py-2"
                        style={{ background: "rgba(196,40,85,0.07)", color: "#c42855" }}>
                        <Banknote size={13} /> الدفع عند الاستلام
                      </div>
                    </div>
                    <Button variant="primary" block className="mt-5" onClick={() => setShowCheckout(true)}>
                      إتمام الطلب
                    </Button>
                    <Link to="/collections" className="block text-center mt-3 text-xs text-accent-brand hover:underline">
                      متابعة التسوق
                    </Link>
                  </Card>
                </div>
              </div>

              {/* Recommended */}
              {recommended.length > 0 && (
                <div className="mt-16">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-display text-xl md:text-2xl font-bold text-fg">أكملي <span className="text-accent-brand">إطلالتكِ</span></h2>
                    <Link to="/collections" className="text-xs text-accent-brand hover:underline font-medium">عرض الكل</Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {recommended.map((p) => (
                      <div key={p.id} className="group relative rounded-2xl overflow-hidden bg-sunken">
                        <Link to={`/product/${p.id}`}>
                          <OptimizedImage
                            src={p.images[0]}
                            alt={p.name}
                            className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        </Link>
                        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                          <Link to={`/product/${p.id}`}>
                            <p className="text-white text-xs font-semibold truncate">{shortName(p.name)}</p>
                          </Link>
                          <div className="flex items-center justify-between mt-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-white text-xs font-bold">{p.price} د.ل</span>
                              {p.originalPrice && (
                                <span className="text-white/60 text-[10px] line-through">{p.originalPrice} د.ل</span>
                              )}
                            </div>
                            <button
                              onClick={() => addItem(p)}
                              className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-full text-white transition-all hover:scale-105 active:scale-95"
                              style={{ background: addedId === p.id ? "#16a34a" : "linear-gradient(135deg, #e63d6a, #c42855)" }}
                            >
                              {addedId === p.id ? <><Check size={11} /> أُضيفت</> : <><Plus size={11} /> أضيفي</>}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Checkout confirmation modal */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-4"
            style={{ background: "rgba(17,15,13,0.6)", backdropFilter: "blur(6px)" }}
            onClick={() => setShowCheckout(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md rounded-t-3xl md:rounded-3xl overflow-hidden"
              style={{ background: "#fff" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b" style={{ borderColor: "rgba(196,40,85,0.1)" }}>
                <h3 className="font-display text-lg font-bold text-fg">تأكيد الطلب</h3>
                <button onClick={() => setShowCheckout(false)} className="text-fg-tertiary hover:text-fg" aria-label="إغلاق">
                  <X size={18} />
                </button>
              </div>

              <div className="px-6 py-5 max-h-[46vh] overflow-y-auto space-y-3">
                {items.map((it, i) => (
                  <div key={it.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="font-semibold text-fg truncate">{shortName(it.name)}</p>
                      <p className="text-fg-tertiary text-[10px] mt-0.5">{it.color} / {it.size} × {it.quantity}</p>
                    </div>
                    <span className="font-bold text-fg-secondary whitespace-nowrap">{it.price * it.quantity} د.ل</span>
                  </div>
                ))}
                <div className="h-px bg-line-subtle" />
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-fg">الإجمالي</span>
                  <span className="text-accent-brand">{subtotal} د.ل</span>
                </div>
                <div className="text-[11px] text-fg-tertiary leading-relaxed rounded-xl px-3 py-2.5"
                  style={{ background: "rgba(196,40,85,0.06)" }}>
                  سيتم التواصل معكِ خلال 24 ساعة لتأكيد الطلب، والدفع عند الاستلام 💵
                </div>
              </div>

              <div className="px-6 pb-6 pt-1">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="primary" block size="lg" className="w-full">
                    <MessageCircle size={18} />
                    إرسال الطلب عبر واتساب
                  </Button>
                </a>
                <button onClick={() => setShowCheckout(false)} className="block w-full text-center mt-3 text-xs text-fg-tertiary hover:text-fg">
                  الإغلاق
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
