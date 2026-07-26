import { useState, useEffect, useRef, useCallback } from "react";

const slides = [
  { accent: "#e11d63", imageUrl: "/images/hero/abaya-gold-1.jpg" },
  { accent: "#ff6b9a", imageUrl: "/images/hero/abaya-gold-2.jpg" },
];

export default function ElegantCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);
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

  const currentSlide = slides[currentIndex];

  return (
    <div
      className="relative w-full h-[70vh] md:h-[88vh] overflow-hidden bg-background"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Accent glow */}
      <div className="absolute inset-0 z-0 transition-all duration-1000 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 50%, ${currentSlide.accent}0d 0%, transparent 60%)` }} />

      {/* ── Image (full bleed, fills frame) ── */}
      {slides.map((slide, i) => (
        <div key={i} className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out" style={{ opacity: i === currentIndex ? 1 : 0, zIndex: i === currentIndex ? 1 : 0 }}>
          <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
        </div>
      ))}

      {/* ── Dark gradient for glass readability ── */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/70 via-black/10 to-black/30 pointer-events-none" />

      {/* ── Glassmorphism overlay panel (bottom) ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <div className="max-w-[1400px] mx-auto px-4 md:px-10 pb-8">
          <div className="flex items-end justify-between gap-6">
            {/* Left: slide info in glass card */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-line-subtle bg-raised/60 backdrop-blur-2xl px-5 py-3 mb-3">
                <span className="text-xs font-bold tracking-wider text-fg/40">
                  {String(currentIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                </span>
                <span className="w-px h-3 bg-sunken/80" />
                <span className="text-xs text-fg/50">نادين</span>
              </div>
            </div>

            {/* Right: glass nav + progress */}
            <div className="flex items-center gap-3">
              {/* Nav arrows in glass */}
              <div className="flex gap-1.5 rounded-2xl border border-line-subtle bg-raised/60 backdrop-blur-2xl p-1.5">
                <button onClick={goPrev} className="w-9 h-9 rounded-xl flex items-center justify-center text-fg/60 hover:text-fg hover:bg-black/[0.05] transition-all" aria-label="Previous">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={goNext} className="w-9 h-9 rounded-xl flex items-center justify-center text-fg/60 hover:text-fg hover:bg-black/[0.05] transition-all" aria-label="Next">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                </button>
              </div>

              {/* Progress dots in glass */}
              <div className="flex gap-2 items-center rounded-2xl border border-line-subtle bg-raised/60 backdrop-blur-2xl px-4 py-3">
                {slides.map((_, i) => (
                  <button key={i} onClick={() => goToSlide(i)} className="group" aria-label={`Slide ${i + 1}`}>
                    <div className={`h-1.5 rounded-full transition-all duration-300 ${i === currentIndex ? "w-8" : "w-1.5 bg-sunken/80 group-hover:bg-sunken/80"}`} style={i === currentIndex ? { backgroundColor: currentSlide.accent } : undefined} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 h-px w-full rounded-full bg-raised/70 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-100" style={{ width: `${progress}%`, backgroundColor: currentSlide.accent }} />
          </div>
        </div>
      </div>
    </div>
  );
}
