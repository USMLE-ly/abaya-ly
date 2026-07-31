import { Star, Quote, BadgeCheck } from "lucide-react";
import { Reveal } from "@/components/PageTransition";

interface Testimonial {
  name: string;
  city: string;
  text: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "أسماء. ب",
    city: "بنغازي",
    text: "الفستان وصلني قبل الموعد المتوقع والخياطة أجمل من الصور! تجربة شراء راقية جداً.",
    rating: 5,
  },
  {
    name: "هاجر. م",
    city: "طرابلس",
    text: "طلبت فستان لحفل تخرجي وكانت القطعة مضبوطة على المقاس. شكراً نادين على الذوق الرفيع.",
    rating: 5,
  },
  {
    name: "سارة. ع",
    city: "مصراتة",
    text: "خدمة العملاء محترفة والدفع عند الاستلام ريّحني. أكيد راح أطلب مرة ثانية.",
    rating: 4,
  },
  {
    name: "مودة. ف",
    city: "البيضاء",
    text: "التفصيل حسب المقاس كان ممتاز والقماش فخم جداً. أنصح فيكم كل صديقاتي.",
    rating: 5,
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} className={i < rating ? "fill-accent-brand text-accent-brand" : "text-line-default"} />
      ))}
    </div>
  );
}

/** Shrine-style testimonials — Arabic customer reviews with social proof. */
export function Testimonials() {
  return (
    <Reveal>
      <section className="py-14 md:py-20">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-10">
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-accent-brand mb-2">آراء عميلاتنا</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-fg">
              ماذا قالت <span className="text-accent-brand">عميلاتنا</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-line-subtle bg-canvas p-5 flex flex-col gap-3 hover:border-line-default hover:shadow-e1 transition-all duration-300">
                <Quote size={18} className="text-accent-brand/40" />
                <blockquote className="text-sm text-fg-secondary leading-relaxed flex-1">{t.text}</blockquote>
                <figcaption className="flex items-center gap-2.5 border-t border-line-subtle pt-3">
                  <span className="w-9 h-9 rounded-full bg-brand-subtle text-brand flex items-center justify-center text-sm font-bold">
                    {t.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-fg flex items-center gap-1">
                      {t.name}
                      <BadgeCheck size={12} className="text-status-success" />
                    </p>
                    <p className="text-[10px] text-fg-tertiary">{t.city} — عميلة موثقة</p>
                  </div>
                  <div className="mr-auto"><Stars rating={t.rating} /></div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}
