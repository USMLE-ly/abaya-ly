import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2 } from "lucide-react";
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
    <div className="pt-20 pb-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-text mb-8">سلة التسوق</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-light text-lg mb-4">سلتكِ فارغة</p>
            <Link to="/collections" className="inline-block px-8 py-3 bg-brand text-white font-semibold rounded-full hover:bg-brand-dark transition-colors">
              تسوقي الآن
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className="flex gap-4 p-4 bg-white rounded-2xl border border-border"
                >
                  <img src={item.image} alt={item.name} className="w-24 h-32 object-cover rounded-xl" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-text">{item.name}</h3>
                    <p className="text-sm text-text-light">{item.fabric}</p>
                    <p className="text-sm text-text-light">اللون: {item.color} | المقاس: {item.size}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => updateQty(item.id, -1)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-bg-2 transition-colors">
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center font-medium">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-bg-2 transition-colors">
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-brand">{item.price * item.quantity} د.ل</span>
                        <button onClick={() => remove(item.id)} className="text-text-light hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="bg-bg-2 rounded-2xl p-6 h-fit">
              <h3 className="font-semibold text-text mb-4">ملخص الطلب</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-light">المجموع الفرعي</span>
                  <span className="font-medium">{subtotal} د.ل</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-light">الشحن</span>
                  <span className="text-green-600 font-medium">مجاني</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between text-lg font-bold">
                  <span>الإجمالي</span>
                  <span className="text-brand">{subtotal} د.ل</span>
                </div>
              </div>
              <button className="w-full mt-6 py-3 bg-brand text-white font-semibold rounded-full hover:bg-brand-dark transition-colors">
                إتمام الطلب
              </button>
              <Link to="/collections" className="block text-center mt-3 text-sm text-brand hover:underline">
                متابعة التسوق
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
