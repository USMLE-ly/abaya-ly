import { useState, useEffect, useRef, useCallback } from "react";

interface SlideData {
  title: string;
  subtitle: string;
  description: string;
  accent: string;
  imageUrl: string;
}

const slides: SlideData[] = [
  {
    title: "عباية السهرة الذهبية",
    subtitle: "مجموعة السهرة الفاخرة",
    description:
      "عباية تجمع بين الفخامة المعاصرة والهوية الليبية الأصيلة. مصنوعة من الجورجيت الإيطالي مع تطريز يدوي بخيوط ذهبية.",
    accent: "#c9a84c",
    imageUrl: "/images/hero/abaya-gold-1.jpg",
  },
  {
    title: "الفخامة الليبية",
    subtitle: "تشكيلة ٢٠٢٥",
    description:
      "صُنعت لكل امرأة تستحق الأفضل — أقمشة عالمية من إيطاليا وفرنسا، تطريز يدوي ليبي يحكي تراثنا العريق.",
    accent: "#dd1d1d",
    imageUrl: "/images/hero/abaya-gold-2.jpg",
  },
];

export default function ElegantCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const SLIDE_DURATION = 6000;
  const TRANSITION_DURATION = 800;

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentIndex) return;
      setIsTransitioning(true);
      setProgress(0);
      setTimeout(() => {
        setCurrentIndex(index);
        setTimeout(() => setIsTransitioning(false), 50);
      }, TRANSITION_DURATION / 2);
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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 60) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <div
      className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden bg-[#0a0a0a]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Accent color wash */}
      <div
        className="absolute inset-0 z-0 transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at 70% 50%, ${currentSlide.accent}18 0%, transparent 70%)`,
        }}
      />

      {/* Inner layout */}
      <div className="relative z-10 h-full max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">

        {/* Left: Text Content */}
        <div className="flex-1 flex flex-col justify-center w-full md:w-auto pt-20 md:pt-0">
          {/* Collection number */}
          <div
            className={`flex items-center gap-3 mb-5 transition-all duration-500 ${
              isTransitioning ? "opacity-0 translate-y-3" : "opacity-100 translate-y-0"
            }`}
          >
            <span className="w-8 h-px bg-white/30" />
            <span className="text-xs tracking-[0.2em] text-white/50 font-light">
              {String(currentIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </span>
          </div>

          {/* Title */}
          <h2
            className={`font-display text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-3 transition-all duration-500 ${
              isTransitioning ? "opacity-0 translate-y-5" : "opacity-100 translate-y-0"
            }`}
          >
            {currentSlide.title}
          </h2>

          {/* Subtitle */}
          <p
            className={`text-sm md:text-base font-medium tracking-wide mb-4 transition-all duration-500 ${
              isTransitioning ? "opacity-0 translate-y-5" : "opacity-100 translate-y-0"
            }`}
            style={{ color: currentSlide.accent }}
          >
            {currentSlide.subtitle}
          </p>

          {/* Description — glassmorphism card */}
          <div
            className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 max-w-md transition-all duration-500 ${
              isTransitioning ? "opacity-0 translate-y-5" : "opacity-100 translate-y-0"
            }`}
          >
            <p className="text-sm text-white/70 leading-relaxed">
              {currentSlide.description}
            </p>
          </div>

          {/* CTA + Arrows */}
          <div className="flex items-center gap-4 mt-6">
            <a
              href="/collections"
              className="px-7 py-3 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: currentSlide.accent }}
            >
              اكتشفي المجموعة
            </a>
            <div className="flex gap-2">
              <button
                onClick={goPrev}
                className="w-10 h-10 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                aria-label="Previous slide"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goNext}
                className="w-10 h-10 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                aria-label="Next slide"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Image */}
        <div className="flex-1 flex justify-center items-center w-full md:w-auto relative">
          {/* Decorative frame corners */}
          <div
            className="hidden md:block absolute -top-4 -left-4 w-16 h-16 border-t-2 border-l-2 rounded-tl-lg z-20 transition-colors duration-700"
            style={{ borderColor: currentSlide.accent }}
          />
          <div
            className="hidden md:block absolute -bottom-4 -right-4 w-16 h-16 border-b-2 border-r-2 rounded-br-lg z-20 transition-colors duration-700"
            style={{ borderColor: currentSlide.accent }}
          />

          <div
            className={`relative w-[280px] md:w-[360px] lg:w-[420px] aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl transition-all duration-700 ${
              isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
          >
            <img
              src={currentSlide.imageUrl}
              alt={currentSlide.title}
              className="w-full h-full object-cover"
            />
            {/* Image overlay gradient */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(135deg, ${currentSlide.accent}22 0%, transparent 50%)`,
              }}
            />
            {/* Glassmorphism label on image */}
            <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md px-4 py-3 flex items-center justify-between">
              <span className="text-xs text-white/80">{currentSlide.subtitle}</span>
              <span className="text-xs font-bold" style={{ color: currentSlide.accent }}>
                NEW
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Progress Indicators */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center gap-3 px-6">
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className="flex flex-col items-center gap-1.5"
            aria-label={`Go to slide ${index + 1}`}
          >
            <div className="w-16 md:w-24 h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-100"
                style={{
                  width: index === currentIndex ? `${progress}%` : index < currentIndex ? "100%" : "0%",
                  backgroundColor: index === currentIndex ? currentSlide.accent : undefined,
                }}
              />
            </div>
            <span className={`text-[9px] tracking-wider transition-colors ${index === currentIndex ? "text-white" : "text-white/30"}`}>
              {slide.title}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
