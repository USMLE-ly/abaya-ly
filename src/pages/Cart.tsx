import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { Button, Card } from "@/components/velar";

interface CartItem { id: string; name: string; fabric: string; price: number; image: string; color: string; size: string; quantity: number; }

const initialItems: CartItem[] = [
  { id: "al-sahra-gold", name: "فستان السهرة الذهبية", fabric: "جورجيت إيطالي", price: 380, image: "/images/products/abaya-1.jpg", color: "ذهبي", size: "M", quantity: 1 },
];

export function Cart() {
  const [items, setItems] = useState(initialItems);
  const updateQty = (id: string, delta: number) => setItems((prev) => prev.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  const remove = (id: string) => setItems((prev) => prev.filter((item) => item.id !== id));
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
              <ShoppingBag size={48} className="mx-auto text-fg-tertiary mb-4" />
              <p className="text-fg-tertiary text-sm mb-4">سلتكِ فارغة</p>
              <Link to="/collections"><Button variant="primary">تسوقي الآن</Button></Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="hidden md:grid grid-cols-12 gap-4 pb-3 border-b border-line-subtle text-xs font-semibold text-fg-tertiary">
                  <div className="col-span-6">المنتج</div>
                  <div className="col-span-3 text-center">الكمية</div>
                  <div className="col-span-3 text-right">الإجمالي</div>
                </div>
                {items.map((item) => (
                  <motion.div key={item.id} layout className="grid grid-cols-12 gap-4 py-5 border-b border-line-subtle items-center">
                    <div className="col-span-12 md:col-span-6 flex gap-4">
                      <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded-xl flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-semibold text-fg">{item.name}</h3>
                        <p className="text-[10px] text-fg-tertiary mt-1">اللون: {item.color} | المقاس: {item.size}</p>
                        <button onClick={() => remove(item.id)} className="text-[10px] text-fg-tertiary hover:text-status-danger mt-2 flex items-center gap-1 transition-colors"><Trash2 size={10} />حذف</button>
                      </div>
                    </div>
                    <div className="col-span-6 md:col-span-3 flex items-center justify-start md:justify-center">
                      <div className="flex items-center glass rounded-lg overflow-hidden">
                        <Button variant="ghost" iconOnly size="sm" onClick={() => updateQty(item.id, -1)}>
                          <Minus size={12} />
                        </Button>
                        <span className="w-8 text-center text-xs font-semibold text-fg">{item.quantity}</span>
                        <Button variant="ghost" iconOnly size="sm" onClick={() => updateQty(item.id, 1)}>
                          <Plus size={12} />
                        </Button>
                      </div>
                    </div>
                    <div className="col-span-6 md:col-span-3 text-right">
                      <span className="text-sm font-bold text-accent-brand">{item.price * item.quantity} د.ل</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="lg:col-span-1">
                <Card elevation="raised" padding="lg" className="sticky top-24">
                  <h2 className="text-sm font-semibold text-fg mb-4">ملخص الطلب</h2>
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between"><span className="text-fg-tertiary">المجموع الفرعي</span><span className="font-medium text-fg-secondary">{subtotal} د.ل</span></div>
                    <div className="flex justify-between"><span className="text-fg-tertiary">الشحن</span><span className="text-status-success font-medium">مجاني</span></div>
                    <div className="h-px bg-line-subtle" />
                    <div className="flex justify-between text-base font-bold"><span className="text-fg">الإجمالي</span><span className="text-accent-brand">{subtotal} د.ل</span></div>
                  </div>
                  <Button variant="primary" block className="mt-6">إتمام الطلب</Button>
                  <Link to="/collections" className="block text-center mt-3 text-xs text-accent-brand hover:underline">متابعة التسوق</Link>
                </Card>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
