import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const items = [
  {
    text: "لما لبست عباية الملكة أول مرة، حسيت روحي مختلفة. النعومة والتطريز ما شفتهم في أي محل ثاني. شكراً الملكة!",
    name: "فاطمة الورفلي",
    city: "طرابلس",
  },
  {
    text: "طلبت عباية بمقاسي الخاص وجاتني أحسن من توقعاتي. الشحن وصل بنغازي في يومين بس!",
    name: "مريم البرغثي",
    city: "بنغازي",
  },
  {
    text: "عبايات الملكة فخامة وأصالة في نفس الوقت. كل مناسبة ألبس فيها عباية منهم وأكون مميزة.",
    name: "سارة العبيدي",
    city: "مصراتة",
  },
  {
    text: "أخيراً لقيت محل يفهم ذوق المرأة الليبية. الأقمشة راقية والألوان محتارة منهم!",
    name: "نور الدرسي",
    city: "الزاوية",
  },
  {
    text: "هدية عيد ميلادي لنفسي كانت عباية البدر — ما ندمت ولا ثانية. تستاهل كل دينار.",
    name: "رنا القذافي",
    city: "سبها",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 md:py-32 bg-ink-2 overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeader
          eyebrow="آراء"
          title="ماذا تقول عميلاتنا؟"
          subtitle="آراء حقيقية من نساء ليبيات"
        />
      </div>

      <div className="mt-14 relative">
        <motion.div
          className="flex gap-6 w-max px-6"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
        >
          {[...items, ...items].map((t, i) => (
            <div
              key={i}
              className="w-[340px] md:w-[420px] shrink-0 rounded-2xl bg-ink-3 border border-gold/15 p-8"
            >
              <Quote className="text-gold/70" size={32} />
              <p className="text-cream/90 leading-[1.9] mt-4 text-[15px]">{t.text}</p>
              <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gold/10">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-gold to-gold-muted flex items-center justify-center text-ink font-bold">
                  {t.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="text-cream font-semibold text-sm">{t.name}</div>
                  <div className="text-warm-muted text-xs">{t.city}</div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} size={12} className="fill-gold text-gold" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
