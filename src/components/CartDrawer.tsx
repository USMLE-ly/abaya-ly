import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { OptimizedImage } from "@/components/OptimizedImage";
import {
  getCart, setCart, cartCount, cartSubtotal,
  type CartItem,
} from "@/lib/cart";
import { BookingModal, type BookingCartContext } from "@/components/BookingModal";
import { products } from "@/data/products";

export const CART_DRAWER_EVENT = "nadine-cart-drawer";

export function openCartDrawer() {
  window.dispatchEvent(new Event(CART_DRAWER_EVENT));
}

const shortName = (name: string) => name.split(" • ").slice(2).join(" • ") || name;

/** Shrine-style slide-out cart drawer (RTL: slides from the left). */
export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [bookingOpen, setBookingOpen] = useState(false);
  const navigate = useNavigate();

  const refresh = () => setItems(getCart());

  useEffect(() => {
    refresh();
    const unsub = () => {};
    const onCart = () => refresh();
    const onOpen = () => { setOpen(true); setBookingOpen(false); };
    window.addEventListener("nadine-cart", onCart);
    window.addEventListener(CART_DRAWER_EVENT, onOpen);
    return () => {
      unsub();
      window.removeEventListener("nadine-cart", onCart);
      window.removeEventListener(CART_DRAWER_EVENT, onOpen);
    };
  }, []);

  const updateQty = (id: string, delta: number) =>
    setCart(items.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)));

  const remove = (id: string) => setCart(items.filter((i) => i.id !== id));

  const count = cartCount(items);
  const subtotal = cartSubtotal(items);

  const cartCtx: BookingCartContext | null = items.length > 0
    ? {
        itemCount: count,
        total: subtotal,
        codes: items.map((i) => i.id).join(" + "),
        names: items.map((i) => `${shortName(i.name)} ×${i.quantity}`).join("، "),
        items: items.map((it) => {
          const p = products.find((pp) => pp.id === it.id);
          return {
            id: it.id,
            name: shortName(it.name),
            image: it.image,
            color: it.color,
            size: it.size,
            quantity: it.quantity,
            price: it.price,
            colors: p?.colors.map((c) => c.name) ?? [it.color],
            sizes: p?.sizes ?? [it.size],
          };
        }),
      }
    : null;

  return (
    <>
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70]"
            style={{ background: "rgba(17,15,13,0.55)", backdropFilter: "blur(4px)" }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            key="drawer"
            role="dialog"
            aria-label="سلة التسوق"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-y-0 left-0 z-[71] w-full max-w-[400px] flex flex-col bg-canvas shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-line-subtle">
              <div className="flex items-center gap-2">
                <ShoppingBag size={17} className="text-brand" />
                <h2 className="text-sm font-bold text-fg">سلة التسوق</h2>
                {count > 0 && (
                  <span className="text-[10px] font-bold text-brand bg-brand-subtle px-2 py-0.5 rounded-full">{count}</span>
                )}
              </div>
              <button onClick={() => setOpen(false)} aria-label="إغلاق" className="p-1.5 text-fg-tertiary hover:text-fg transition-colors">
                <X size={18} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6 text-center">
                <div className="w-14 h-14 rounded-2xl grid place-items-center" style={{ background: "rgba(196,40,85,0.08)" }}>
                  <ShoppingBag size={24} className="text-accent-brand" />
                </div>
                <p className="text-sm font-bold text-fg">سلتكِ فارغة</p>
                <p className="text-xs text-fg-tertiary">اكتشفي تشكيلة نادين واختاري فستانكِ المفضل</p>
                <Link to="/collections" onClick={() => setOpen(false)}>
                  <span className="inline-block mt-2 text-xs font-bold text-white px-5 py-2.5 rounded-xl" style={{ background: "linear-gradient(135deg, #e63d6a, #c42855)" }}>
                    تسوقي الآن
                  </span>
                </Link>
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="flex-1 overflow-y-auto px-4 py-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-3 border-b border-line-subtle last:border-0">
                      <Link to={`/product/${item.id}`} onClick={() => setOpen(false)} className="flex-shrink-0">
                        <OptimizedImage src={item.image} alt={item.name} className="w-[72px] h-[72px] rounded-lg" />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.id}`} onClick={() => setOpen(false)} className="block">
                          <p className="text-[15px] font-semibold text-fg truncate">{shortName(item.name)}</p>
                        </Link>
                        <p className="text-xs text-fg-tertiary mt-0.5">اللون: {item.color} | المقاس: {item.size}</p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-[#787878]/40 rounded-full">
                            <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 flex items-center justify-center rounded-full text-fg hover:bg-sunken transition-colors" aria-label="إنقاص">
                              <Minus size={10} />
                            </button>
                            <span className="w-9 text-center text-sm font-medium text-fg">{item.quantity}</span>
                            <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 flex items-center justify-center rounded-full text-fg hover:bg-sunken transition-colors" aria-label="زيادة">
                              <Plus size={10} />
                            </button>
                          </div>
                          <span className="text-base font-bold text-brand">{item.price * item.quantity} د.ل</span>
                        </div>
                      </div>
                      <button onClick={() => remove(item.id)} className="self-center text-fg-tertiary hover:text-status-danger transition-colors p-1" aria-label="حذف">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-line-subtle px-4 py-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-fg">الإجمالي</span>
                    <span className="text-lg font-bold text-brand">{subtotal} د.ل</span>
                  </div>
                  <button
                    onClick={() => {
                      setOpen(false);
                      setBookingOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all active:scale-[0.98] shadow-lg shadow-brand/25"
                    style={{ background: "linear-gradient(135deg, #e63d6a, #c42855)" }}
                  >
                    <ArrowLeft size={16} />
                    إتمام الطلب — دفع عند الاستلام
                  </button>
                  <button onClick={() => { setOpen(false); navigate("/cart"); }} className="w-full text-center mt-3 text-xs text-fg-tertiary hover:text-accent-brand hover:underline">
                    مراجعة السلة كاملة
                  </button>

                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
    <BookingModal
      open={bookingOpen}
      onClose={() => setBookingOpen(false)}
      productCode={cartCtx?.codes ?? ""}
      productName={cartCtx?.names ?? ""}
      colors={cartCtx?.items[0] ? [{ name: cartCtx.items[0].color || "غير محدد", hex: "transparent" }] : []}
      sizes={cartCtx?.items[0] ? [cartCtx.items[0].size || "M"] : []}
      cart={cartCtx}
      onSuccess={() => setCart([])}
    />
    </>
  );
}
