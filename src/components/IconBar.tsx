import { Truck, RotateCcw, Shield, Headphones, Star, Clock } from "lucide-react";
import { FeatureCard } from "@/components/ui/grid-feature-cards";

const features = [
  { icon: Truck, title: "شحن مجاني", description: "لجميع مدن ليبيا — التوصيل خلال ٣-٥ أيام عمل" },
  { icon: RotateCcw, title: "إرجاع سهل", description: " خلال ٧ أيام من تاريخ الاستلام بدون أي تعقيد" },
  { icon: Shield, title: "ضمان الجودة", description: "أقمشة عالمية مضمونة من أفضل المصانع العالمية" },
  { icon: Headphones, title: "دعم متواصل", description: "فريق خدمة العملاء متاح عبر الواتساب على مدار الساعة" },
  { icon: Star, title: "تقييمات ممتازة", description: "أكثر من ١٠٠٠ امرأة ليبية تثق بجودة منتجاتنا" },
  { icon: Clock, title: "خدمة سريعة", description: "نعمل بسرعة لتوصيل طلبك في أسرع وقت ممكن" },
];

export function IconBar() {
  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto w-full max-w-5xl space-y-8 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-wide text-white text-balance">
            لماذا <span className="text-brand">تختاريننا</span>؟
          </h2>
          <p className="mt-4 text-sm tracking-wide text-white/40 text-balance md:text-base">
            نقدم لكِ ما لا تجدينه لدى الآخرين — جودة لا تُضاهى بلمسة ليبية أصيلة
          </p>
        </div>
        <div className="grid grid-cols-1 divide-y divide-white/5 border border-white/5 sm:grid-cols-2 md:grid-cols-3">
          {features.map((feature, i) => (
            <FeatureCard key={i} feature={feature} className="border-white/5" />
          ))}
        </div>
      </div>
    </section>
  );
}
