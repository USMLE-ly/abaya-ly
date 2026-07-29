import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    image: "/images/hero/abaya-gold-1.jpg",
    heading: "نادين",
    subheading: "فساتين فاخرة بلمسة ليبية أصيلة",
    accent: "#c42855",
  },
  {
    image: "/images/hero/abaya-gold-2.jpg",
    heading: "الفخامة الليبية",
    subheading: "صُنعت لكل امرأة تستحق الأفضل",
    accent: "#e63d6a",
  },
];

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
          {char === " " ? "\u00a0" : char}
        </motion.span>
      ))}
    </span>
  );
}

export default function ElegantCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);

  const SLIDE_DURATION = 6000;

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentIndex) return;
      setIsTransitioning(true);
      setProgress(0);
      setTimeout(() => {
        setCurrentIndex(index);
        setTimeout(() => setIsTransitioning(false), 50);
      }, 400);
    },
    [isTransitioning, currentIndex]
  );

  const goNext = useCallback(() => {
    goToSlide((currentIndex + 1) % slides.length);
  }, [currentIndex, goToSlide]);

  const goPrev = useCallback(() => {
    goToSlide((currentIndex - 1 + slides.length) % slides.length);
  }, [currentIndex, goToSlide]);

  useEffect(() => {
    if (isPaused) return;
    progressRef.current = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 100 : prev + 100 / (SLIDE_DURATION / 50)));
    }, 50);
    intervalRef.current = setInterval(goNext, SLIDE_DURATION);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [currentIndex, isPaused, goNext]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouseX((e.clientX - rect.left) / rect.width - 0.5);
    setMouseY((e.clientY - rect.top) / rect.height - 0.5);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full h-[70vh] md:h-[88vh] overflow-hidden bg-background"
      role="region"
      aria-roledescription="carousel"
      aria-label="Slideshow about our brand"
    >
      {/* Accent glow */}
      <div
        className="absolute inset-0 z-0 transition-all duration-1000 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${slides[currentIndex].accent}0d 0%, transparent 60%)`,
        }}
      />

      {/* Slides */}
      <AnimatePresence mode="wait">
        {slides.map((slide, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: i === currentIndex ? 1 : 0, scale: i === currentIndex ? 1 : 1.05 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
            style={{ zIndex: i === currentIndex ? 1 : 0, pointerEvents: i === currentIndex ? "auto" : "none" }}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${i + 1} of ${slides.length}`}
          >
            {/* Image with parallax offset */}
            <div
              className="absolute inset-0 transition-transform duration-200 ease-out"
              style={{
                transform: i === currentIndex
                  ? `translate(${mouseX * -12}px, ${mouseY * -8}px) scale(1.08)`
                  : "scale(1.08)",
              }}
            >
              <img src={slide.image} alt={slide.heading} className="w-full h-full object-cover" />
            </div>

            {/* Premium gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/10" />
            <div className="absolute inset-0 bg-gradient-to-r from-strawberry-900/20 via-transparent to-strawberry-950/10" />

            {/* Content overlay */}
            {i === currentIndex && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 z-[3] flex flex-col items-center justify-center text-center px-6"
              >
                <div className="max-w-2xl">
                  <span className="inline-block px-4 py-1.5 mb-4 text-[10px] font-semibold tracking-[0.15em] uppercase text-white/80 glass-subtle border border-white/15 rounded-full backdrop-blur-xl">
                    مجموعة 2026
                  </span>
                  <h2 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold text-white mb-4 leading-[1.1] tracking-tight text-pretty">
                    <KineticHeading text={slide.heading} />
                  </h2>
                  <p className="text-base md:text-lg text-white/80 mb-8 max-w-lg mx-auto leading-relaxed">
                    {slide.subheading}
                  </p>
                  <motion.a
                    href="/collections"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/15 backdrop-blur-xl text-white font-semibold rounded-full border border-white/25 hover:bg-white/25 transition-all duration-300 text-sm tracking-wide"
                  >
                    اكتشفي المجموعة
                    <span className="text-lg">←</span>
                  </motion.a>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Bottom glass panel with nav */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="max-w-[1400px] mx-auto px-4 md:px-10 pb-8">
          <div className="flex items-end justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-2xl px-5 py-3 mb-3">
                <span className="text-xs font-bold tracking-wider text-white/50">
                  {String(currentIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                </span>
                <span className="w-px h-3 bg-white/20" />
                <span className="text-xs text-white/50">نادين</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-2xl p-1.5">
                <button onClick={goPrev} className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all" aria-label="Previous">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={goNext} className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all" aria-label="Next">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>
              <div className="flex gap-2 items-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur-2xl px-4 py-3">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => goToSlide(i)} className="group" aria-label={`Slide ${i + 1}`}>
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === currentIndex ? "w-8" : "w-1.5 bg-white/30 group-hover:bg-white/50"
                      }`}
                      style={i === currentIndex ? { backgroundColor: slides[i].accent } : undefined}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 h-px w-full rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{ width: `${progress}%`, backgroundColor: slides[currentIndex].accent }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
