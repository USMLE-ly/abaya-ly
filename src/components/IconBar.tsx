import { Truck, RotateCcw, Shield, Headphones, Star, Clock } from "lucide-react";
import { FeatureCard } from "@/components/ui/grid-feature-cards";
import { motion } from "framer-motion";

const features = [
  { icon: Truck, title: "شحن مجاني", description: "لجميع مدن ليبيا — التوصيل خلال ٣-٥ أيام عمل", stat: "٧" },
  { icon: RotateCcw, title: "إرجاع سهل", description: "خلال ٧ أيام من تاريخ الاستلام بدون أي تعقيد", stat: "٧" },
  { icon: Shield, title: "ضمان الجودة", description: "أقمشة عالمية مضمونة من أفضل المصانع العالمية", stat: "١٠٠٪" },
  { icon: Headphones, title: "دعم متواصل", description: "فريق خدمة العملاء متاح عبر الواتساب على مدار الساعة", stat: "٢٤/٧" },
  { icon: Star, title: "تقييمات ممتازة", description: "أكثر من ١٠٠٠ امرأة ليبية تثق بجودة منتجاتنا", stat: "٤.٩" },
  { icon: Clock, title: "خدمة سريعة", description: "نعمل بسرعة لتوصيل طلبك في أسرع وقت ممكن", stat: "٢٤س" },
];

export function IconBar() {
  return (
    <section className="py-20 md:py-32">
      <div className="mx-auto w-full max-w-6xl space-y-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-block text-xs font-semibold tracking-widest text-primary/60 uppercase mb-4">مميزاتنا</span>
          <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-foreground text-balance leading-tight">
            لماذا <span className="text-primary">تختاريننا</span>؟
          </h2>
          <p className="mt-5 text-sm md:text-base tracking-wide text-foreground/30 text-balance leading-relaxed max-w-xl mx-auto">
            نقدم لكِ ما لا تجدينه لدى الآخرين — جودة لا تُضاهى بلمسة ليبية أصيلة
          </p>
        </motion.div>

        <div className="grid grid-cols-1 divide-y divide-black/[0.06] border border-black/[0.06] sm:grid-cols-2 md:grid-cols-3">
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} className="border-black/[0.06]" />
          ))}
        </div>

        {/* Bottom accent */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <div className="h-px flex-1 max-w-[100px] bg-gradient-to-r from-transparent to-white/10" />
          <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
          <div className="h-px flex-1 max-w-[100px] bg-gradient-to-l from-transparent to-white/10" />
        </div>
      </div>
    </section>
  );
}
