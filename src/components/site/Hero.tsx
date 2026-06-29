import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const headline = [
  ["حيث", "تلتقي"],
  ["الأناقة", "بالهوية"],
];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 80]);

  return (
    <section id="top" ref={ref} className="relative min-h-screen overflow-hidden pt-24">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 grid lg:grid-cols-5 gap-10 lg:gap-16 items-center min-h-[calc(100vh-6rem)] py-12">
        {/* Text right side (in RTL flows first visually on the right) */}
        <motion.div
          className="lg:col-span-2 order-2 lg:order-1 text-right"
        >
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-gold text-xs md:text-sm tracking-[0.3em] uppercase mb-6"
          >
            الفخامة الليبية الأصيلة
          </motion.p>

          <h1 className="font-display font-bold text-cream leading-[1.05] text-5xl md:text-6xl lg:text-7xl xl:text-[88px]">
            {headline.map((line, li) => (
              <div key={li} className="flex flex-wrap gap-x-4 justify-end">
                {line.map((word, wi) => (
                  <motion.span
                    key={`${li}-${wi}`}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.4 + (li * line.length + wi) * 0.12,
                      duration: 0.7,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={li === 1 ? "text-gold" : ""}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.7 }}
            className="text-warm text-base md:text-lg leading-[1.9] mt-8 max-w-xl mr-auto"
          >
            كل عباية نصنعها تحمل روح المرأة الليبية — قوتها، رقّتها، وتميّزها.
            من أفخر الأقمشة العالمية إلى تفاصيل التطريز اليدوي، الملكة ليست
            مجرد عباية، هي هوية.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="flex flex-wrap gap-4 mt-10 justify-end"
          >
            <a
              href="#collections"
              className="rounded-full bg-gold px-8 py-4 text-ink font-semibold hover:brightness-110 hover:scale-[1.02] transition"
            >
              اكتشفي المجموعة
            </a>
            <a
              href="#about"
              className="rounded-full border border-gold text-gold px-8 py-4 font-semibold hover:bg-gold hover:text-ink transition"
            >
              شاهدي الفيديو
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3, duration: 0.7 }}
            className="flex flex-wrap gap-x-2 gap-y-2 mt-10 text-warm-muted text-sm justify-end"
          >
            <span>✦ شحن مجاني داخل ليبيا</span>
            <span className="text-gold/40">•</span>
            <span>✦ جودة مضمونة</span>
            <span className="text-gold/40">•</span>
            <span>✦ تفصيل حسب الطلب</span>
          </motion.div>
        </motion.div>

        {/* Image left */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-3 order-1 lg:order-2 relative"
        >
          <motion.div style={{ y }} className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-gold/15">
            <img
              src="https://images.unsplash.com/photo-1594938298603-c8148c4b5b3e?w=1400&q=85"
              alt="عباية فاخرة من مجموعة الملكة"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-ink/60 via-ink/10 to-transparent" />
            <div className="absolute top-6 left-6">
              <span className="inline-flex items-center rounded-full bg-gold/95 text-ink text-xs font-semibold px-4 py-2 backdrop-blur">
                مجموعة ٢٠٢٥
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
