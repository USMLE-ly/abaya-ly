import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useState } from "react";

interface CartItem {
  id: string;
  name: string;
  fabric: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
}

const initialItems: CartItem[] = [
  {
    id: "al-sahra-gold",
    name: "عباية السهرة الذهبية",
    fabric: "جورجيت إيطالي",
    price: 380,
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4b5b3e?w=200&q=80",
    color: "ذهبي",
    size: "M",
    quantity: 1,
  },
];

export function Cart() {
  const [items, setItems] = useState(initialItems);

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const remove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="bg-white min-h-screen">
      {/* ─── CART HEADER ─── */}
      <section className="pt-24 pb-6 md:pt-28 md:pb-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-text">
              سلة التسوق
            </h1>
            <Link
              to="/collections"
              className="text-xs text-brand hover:underline font-medium"
            >
              متابعة التسوق
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CART CONTENT ─── */}
      <section className="pb-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag size={48} className="mx-auto text-text-light mb-4" />
              <p className="text-text-light text-sm mb-4">سلتكِ فارغة</p>
              <Link
                to="/collections"
                className="inline-block px-8 py-3 bg-brand text-white font-semibold rounded-xl hover:bg-brand-dark transition-colors text-sm"
              >
                تسوقي الآن
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Items table */}
              <div className="lg:col-span-2">
                {/* Table header */}
                <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-border text-xs font-semibold text-text-light">
                  <div className="col-span-6">المنتج</div>
                  <div className="col-span-3 text-center">الكمية</div>
                  <div className="col-span-3 text-right">الإجمالي</div>
                </div>

                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    className="grid grid-cols-12 gap-4 py-5 border-b border-border items-center"
                  >
                    {/* Product info */}
                    <div className="col-span-12 md:col-span-6 flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                      <div>
                        <h3 className="text-sm font-semibold text-text">{item.name}</h3>
                        <p className="text-[10px] text-text-light">{item.fabric}</p>
                        <p className="text-[10px] text-text-light mt-1">
                          اللون: {item.color} | المقاس: {item.size}
                        </p>
                        <button
                          onClick={() => remove(item.id)}
                          className="text-[10px] text-text-light hover:text-red-500 mt-2 flex items-center gap-1 transition-colors"
                        >
                          <Trash2 size={10} />
                          حذف
                        </button>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="col-span-6 md:col-span-3 flex items-center justify-start md:justify-center">
                      <div className="flex items-center border border-border rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-bg-2 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-bg-2 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="col-span-6 md:col-span-3 text-right">
                      <span className="text-sm font-bold text-brand">
                        {item.price * item.quantity} د.ل
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="bg-bg-2 rounded-2xl p-6 sticky top-24">
                  <h2 className="text-sm font-semibold text-text mb-4">
                    ملخص الطلب
                  </h2>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-text-light">المجموع الفرعي</span>
                      <span className="font-medium">{subtotal} د.ل</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-light">الشحن</span>
                      <span className="text-green-600 font-medium">مجاني</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between text-base font-bold">
                      <span>الإجمالي</span>
                      <span className="text-brand">{subtotal} د.ل</span>
                    </div>
                  </div>
                  <button className="w-full mt-6 py-3 bg-brand text-white font-semibold rounded-xl hover:bg-brand-dark transition-colors text-sm">
                    إتمام الطلب
                  </button>
                  <Link
                    to="/collections"
                    className="block text-center mt-3 text-xs text-brand hover:underline"
                  >
                    متابعة التسوق
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
