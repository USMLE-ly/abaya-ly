import { Star, BadgeCheck } from "lucide-react";
import { Reveal } from "@/components/PageTransition";
import { Marquee } from "@/components/Marquee";
import { Card } from "@/components/velar/Card";

interface Testimonial {
  name: string;
  city: string;
  text: string;
  rating: number;
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: "نور الهدى",
    city: "طرابلس",
    text: "طلبت فستان نبيذي لحفل زفاف أختي — وصلني قبل الموعد والقماش أجمل من الصور بكثير. شكراً نادين!",
    rating: 5,
  },
  {
    name: "ريم",
    city: "بنغازي",
    text: "الدفع عند الاستلام خلّاني أطلب بثقة، والخياطة مضبوطة على المقاس حرفياً. تجربة تستحق التكرار.",
    rating: 5,
  },
  {
    name: "لمى",
    city: "مصراتة",
    text: "التطريز فخم جداً والتفاصيل واضح إنها شغل راقي. صار فستان السهرة المفضل عندي.",
    rating: 5,
  },
  {
    name: "دانة",
    city: "الخمس",
    text: "خدمة العملاء ردّت على كل استفساراتي بالواتساب بسرعة، والتوصيل وصلني خلال يومين فقط.",
    rating: 5,
  },
  {
    name: "شهد",
    city: "زليتن",
    text: "أول مرة أطلب أونلاين من ليبيا وأنا راضية تماماً. الفستان مطابق للوصف واللون أجمل من الصورة.",
    rating: 5,
  },
  {
    name: "مريم",
    city: "سبها",
    text: "القماش ثقيل وفخم والخياطة نضيفة. وصلني بغلاف أنيق، حسّيت إني أشتري من متجر عالمي.",
    rating: 5,
  },
  {
    name: "أمل",
    city: "طرابلس",
    text: "طلبت فستانين مع بعض والخصم طُبّق صح. الإرجاع مريح والجودة فوق الممتاز.",
    rating: 5,
  },
  {
    name: "سلمى",
    city: "البيضاء",
    text: "فستان البولكا الأسود تحفة! التطريز عالي الجودة والقماش مريح، أنصح في نادين كل صديقاتي.",
    rating: 5,
  },
  {
    name: "فاطمة",
    city: "درنة",
    text: "التوصيل لدرنة كان سريع والدفع عند الاستلام. المقاس مطابق لجدول المقاسات تماماً.",
    rating: 5,
  },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={12} className={i < rating ? "fill-strawberry-500 text-strawberry-500" : "text-strawberry-200"} />
      ))}
    </div>
  );
}

function TestimonialCard({ name, city, text, rating }: Testimonial) {
  return (
    <Card elevation="flat" padding="lg" className="w-60 md:w-64 bg-white border-strawberry-100 shadow-[0_8px_30px_rgba(196,40,85,0.08)]">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <figcaption className="text-sm font-bold text-fg flex items-center gap-1 truncate">
            {name}
            <BadgeCheck size={13} className="text-strawberry-600 flex-shrink-0" />
          </figcaption>
          <p className="text-[11px] text-fg-tertiary">{city} — عميلة موثقة</p>
        </div>
        <div className="flex-shrink-0"><Stars rating={rating} /></div>
      </div>
      <blockquote className="mt-3 text-sm text-fg-secondary leading-relaxed">{text}</blockquote>
    </Card>
  );
}

/** 3D vertical marquee — Shrine-style customer reviews in white / rose / strawberry. */
export function Testimonials() {
  const cards = TESTIMONIALS.map((t) => <TestimonialCard key={t.name} {...t} />);

  return (
    <Reveal>
      <section className="py-14 md:py-20 overflow-hidden">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-10">
          <div className="text-center mb-10">
            <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-accent-brand mb-2">آراء عميلاتنا</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-fg">
              ماذا قالت <span className="text-accent-brand">عميلاتنا</span>
            </h2>
          </div>

          <div className="relative flex h-[420px] items-center justify-center gap-4 overflow-hidden rounded-3xl border border-strawberry-100 bg-gradient-to-b from-strawberry-50/60 via-canvas to-strawberry-50/60 [perspective:900px]">
            <div
              className="flex flex-row items-center gap-4"
              style={{ transform: "translateX(-24px) translateY(0px) translateZ(-60px) rotateX(8deg) rotateY(0deg) rotateZ(2deg)" }}
            >
              <Marquee vertical pauseOnHover repeat={3} className="[--duration:45s]">{cards}</Marquee>
              <Marquee vertical pauseOnHover reverse repeat={3} className="[--duration:45s]">{cards}</Marquee>
              <Marquee vertical pauseOnHover repeat={3} className="[--duration:45s]">{cards}</Marquee>
              <Marquee vertical pauseOnHover reverse repeat={3} className="[--duration:45s]">{cards}</Marquee>
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-canvas to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-canvas to-transparent" />
          </div>
        </div>
      </section>
    </Reveal>
  );
}
