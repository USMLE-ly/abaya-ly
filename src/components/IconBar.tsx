import { motion } from "framer-motion";
import { Truck, RotateCcw, Shield, Headphones } from "lucide-react";

const icons = [
  { icon: Truck, title: "شحن مجاني", text: "لجميع مدن ليبيا" },
  { icon: RotateCcw, title: "إرجاع سهل", text: "خلال ٧ أيام" },
  { icon: Shield, title: "ضمان الجودة", text: "أقمشة عالمية مضمونة" },
  { icon: Headphones, title: "دعم متواصل", text: "واتساب على مدار الساعة" },
];

export function IconBar() {
  return (
    <section className="py-12 md:py-16">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-white text-center mb-10">
          لماذا <span className="text-brand">تختاريننا</span>؟
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {icons.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="glass-card p-6 flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center mb-3">
                <item.icon size={20} className="text-brand" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
              <p className="text-xs text-white/40 leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
