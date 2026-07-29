import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    image: "/images/hero/abaya-gold-1.jpg",
    heading: "نادين",
    subheading: "فساتين فاخرة بلمسة ليبية أصيلة",
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

// Staggered letter reveal for Arabic headings
function KineticHeading({ text }: { text: string }) {
  return (
    <span className="inline-block">
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 40, rotateZ: -5 }}
          animate={{ opacity: 1, y: 0, rotateZ: 0 }}
          transition={{ duration: 0.5, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </span>
  );
}

export function SlideshowHero() {
  const [current, setCurrent] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  // Mouse parallax for hero image
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouseX((e.clientX - rect.left) / rect.width - 0.5);
    setMouseY((e.clientY - rect.top) / rect.height - 0.5);
  }, []);

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative w-full overflow-hidden"
      role="region"
      aria-roledescription="carousel"
      aria-label="Slideshow about our brand"
    >
      {/* Full-bleed hero with overlay and parallax */}
      <div className="relative h-[70vh] md:h-[80vh] lg:h-[85vh]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${current + 1} of ${slides.length}`}
          >
            {/* Image with parallax offset */}
            <div
              className="absolute inset-0 transition-transform duration-200 ease-out"
              style={{
                transform: `translate(${mouseX * -12}px, ${mouseY * -8}px) scale(1.08)`,
              }}
            >
              <img
                src={slides[current].image}
                alt={slides[current].heading}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Premium gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-strawberry-900/20 via-transparent to-strawberry-950/10" />

            {/* Content on top of image */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <motion.div
                key={`text-${current}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-2xl"
              >
                {/* Collection tag */}
                <span className="inline-block px-4 py-1.5 mb-4 text-[10px] font-semibold tracking-[0.15em] uppercase text-white/80 glass-subtle border border-white/15 rounded-full backdrop-blur-xl">
                  مجموعة 2026
                </span>

                {/* Kinetic heading */}
                <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 leading-[1.1] tracking-tight text-pretty">
                  <KineticHeading text={slides[current].heading} />
                </h2>

                <p className="text-base md:text-lg text-white/80 mb-8 max-w-lg mx-auto leading-relaxed">
                  {slides[current].subheading}
                </p>

                <motion.a
                  href={slides[current].link}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/15 backdrop-blur-xl text-white font-semibold rounded-full border border-white/25 hover:bg-white/25 transition-all duration-300 text-sm tracking-wide"
                >
                  {slides[current].cta}
                  <span className="text-lg">←</span>
                </motion.a>
              </motion.div>
            </div>

            {/* Dots — over the image, centered at bottom */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-3 z-10">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className="group/dot relative"
                >
                  <span
                    className={`block rounded-full transition-all duration-500 ${
                      i === current
                        ? "w-8 h-2 bg-white"
                        : "w-2 h-2 bg-white/40 group-hover/dot:bg-white/70"
                    }`}
                  />
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
