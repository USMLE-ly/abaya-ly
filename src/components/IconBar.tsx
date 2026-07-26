import { Truck, RotateCcw, Shield, Headphones, Star, Clock } from "lucide-react";
import { FeatureCard } from "@/components/ui/grid-feature-cards";
import { motion } from "framer-motion";

const features = [
  { icon: Truck, title: "شحن مجاني", description: "لجميع مدن ليبيا — التوصيل خلال 3-5 أيام عمل", stat: "7" },
  { icon: RotateCcw, title: "إرجاع سهل", description: "خلال 7 أيام من تاريخ الاستلام بدون أي تعقيد", stat: "7" },
  { icon: Shield, title: "ضمان الجودة", description: "أقمشة عالمية مضمونة من أفضل المصانع العالمية", stat: "100%" },
  { icon: Headphones, title: "دعم متواصل", description: "فريق خدمة العملاء متاح عبر الواتساب على مدار الساعة", stat: "24/7" },
  { icon: Star, title: "تقييمات ممتازة", description: "أكثر من 1000 امرأة ليبية تثق بجودة منتجاتنا", stat: "4.9" },
  { icon: Clock, title: "خدمة سريعة", description: "نعمل بسرعة لتوصيل طلبك في أسرع وقت ممكن", stat: "24س" },
];

export function IconBar() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto w-full max-w-6xl space-y-10 md:space-y-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-block text-xs font-semibold tracking-widest text-accent-brand/60 uppercase mb-4">مميزاتنا</span>
          <h2 className="font-display text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-fg text-balance leading-tight">
            لماذا <span className="text-accent-brand">تختاريننا</span>؟
          </h2>
          <p className="mt-4 md:mt-5 text-sm md:text-base tracking-wide text-fg/30 text-balance leading-relaxed max-w-xl mx-auto">
            نقدم لكِ ما لا تجدينه لدى الآخرين — جودة لا تُضاهى بلمسة ليبية أصيلة
          </p>
        </motion.div>

        {/* Horizontal scrollable row */}
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex-shrink-0 w-72 snap-start"
            >
              <FeatureCard feature={feature} index={i} className="border-line-subtle" />
            </motion.div>
          ))}
        </div>

        {/* Bottom accent */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-transparent to-white/10" />
          <div className="w-1.5 h-1.5 rounded-full bg-accent-brand/40" />
          <div className="h-px flex-1 max-w-[100px] bg-gradient-to-l from-transparent to-white/10" />
        </div>
      </div>
    </section>
  );
}
