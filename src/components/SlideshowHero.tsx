import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    image: "/images/hero/abaya-gold-1.jpg",
    heading: "الملكة",
    subheading: "عبايات فاخرة بلمسة ليبية أصيلة",
    cta: "اكتشفي المجموعة",
    link: "/collections",
  },
  {
    image: "/images/hero/abaya-gold-2.jpg",
    heading: "الفخامة الليبية",
    subheading: "صُنعت لكل امرأة تستحق الأفضل",
    cta: "تسوقي الآن",
    link: "/collections",
  },
];

export function SlideshowHero() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section
      className="relative w-full"
      role="region"
      aria-roledescription="carousel"
      aria-label="Slideshow about our brand"
    >
      {/* Image Slides — full bleed, dots overlaid */}
      <div className="relative h-[50vh] md:h-[65vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0"
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${current + 1} of ${slides.length}`}
          >
            <div className="absolute inset-0">
              <img
                src={slides[current].image}
                alt={slides[current].heading}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Dots — over the image, centered at bottom */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    i === current
                      ? "bg-raised w-6"
                      : "bg-raised/60 hover:bg-surface-inverse/5"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Text Below — heading, subheading, button */}
      <div className="bg-raised py-8 md:py-10 text-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold text-fg mb-3 leading-tight">
              {slides[current].heading}
            </h2>
            <p className="text-sm md:text-base text-fg-light mb-6 max-w-lg mx-auto">
              {slides[current].subheading}
            </p>
            <a
              href={slides[current].link}
              className="inline-block px-8 py-3 bg-accent-brand text-fg-inverse font-semibold rounded-full hover:bg-accent-brand/90 transition-colors text-sm"
            >
              {slides[current].cta}
            </a>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
