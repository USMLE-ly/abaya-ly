import { useEffect, useRef, useState } from "react";
import { OptimizedImage } from "@/components/OptimizedImage";

const SLIDES_DESKTOP = [
  {
    media: "/images/hero/abaya-gold-1.jpg",
    title: "فستان السهرة الذهبية",
    subtitle: "مجموعة السهرة الفاخرة",
    accent: "#e11d63",
  },
  {
    media: "/images/hero/abaya-gold-2.jpg",
    title: "الفخامة الليبية",
    subtitle: "تشكيلة ٢٠٢٥",
    accent: "#ff6b9a",
  },
];

const SLIDES_MOBILE = [
  {
    media: "/images/hero/abaya-gold-mobile-1.jpg",
    title: "فستان السهرة الذهبية",
    subtitle: "مجموعة السهرة الفاخرة",
    accent: "#e11d63",
  },
  {
    media: "/images/hero/abaya-gold-mobile-2.jpg",
    title: "الفخامة الليبية",
    subtitle: "تشكيلة ٢٠٢٥",
    accent: "#ff6b9a",
  },
];

const DURATION = 6000;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

export default function LuminaHero() {
  const isMobile = useIsMobile();
  const SLIDES = isMobile ? SLIDES_MOBILE : SLIDES_DESKTOP;
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const idxRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef(Date.now());

  useEffect(() => {
    startRef.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      setProgress(Math.min(elapsed / DURATION, 1));
      if (elapsed < DURATION) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [idx]);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      const next = (idxRef.current + 1) % SLIDES.length;
      idxRef.current = next;
      setIdx(next);
    }, DURATION);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [idx]);

  const goTo = (i: number) => {
    if (i === idxRef.current) return;
    idxRef.current = i;
    setIdx(i);
  };

  return (
    <div className="relative w-full h-[70vh] md:h-[88vh] overflow-hidden bg-surface-inverse">
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            opacity: i === idx ? 1 : 0,
            transition: "opacity 1s ease-in-out",
            zIndex: i === idx ? 1 : 0,
          }}
        >
          <OptimizedImage
            src={slide.media}
            alt=""
            className="absolute inset-0 w-full h-full "
            style={{ filter: "blur(20px) brightness(0.6)", transform: "scale(1.1)" }}
          />
          <OptimizedImage
            src={slide.media}
            alt=""
            className="absolute inset-0 w-full h-full "
          />
        </div>
      ))}

      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/80 via-black/20 to-black/40 pointer-events-none" />

      <div className="absolute inset-0 z-10 flex flex-col justify-end">
        <div className="max-w-[1400px] mx-auto w-full px-4 md:px-10 pb-8">
          <div className="flex items-end justify-between gap-6">
            {/* Right: text blocks */}
            <div className="flex-1 max-w-lg flex flex-col items-start gap-3">
              {/* Counter */}
              <div className="inline-flex items-center gap-2 rounded-2xl border border-line-subtle/10 bg-raised/70 backdrop-blur-xl px-5 py-3 self-start">
                <span className="text-xs font-bold tracking-wider text-fg/40">
                  {String(idx + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
                </span>
                <span className="w-px h-3 bg-surface-inverse/10" />
                <span className="text-xs text-fg/50">نادين</span>
              </div>

              {/* Subtitle */}
              <div className="inline-flex items-center gap-2 rounded-2xl border border-line-subtle/10 bg-raised/70 backdrop-blur-xl px-5 py-2 self-start">
                <p className="text-sm font-medium" style={{ color: SLIDES[idx].accent }}>
                  {SLIDES[idx].subtitle}
                </p>
              </div>

              {/* CTA */}
              <a
                href="/collections"
                className="inline-block px-7 py-3 rounded-full text-sm font-semibold text-fg transition-all duration-300 hover:scale-105 self-start"
                style={{ backgroundColor: SLIDES[idx].accent }}
              >
                اكتشفي المجموعة
              </a>

              {/* Progress bar */}
              <div className="h-[2px] w-full max-w-md rounded-full bg-raised/10 overflow-hidden mt-2 self-start">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${progress * 100}%`, backgroundColor: SLIDES[idx].accent, transition: "none" }}
                />
              </div>
            </div>

            {/* Left: nav dots + arrows */}
            <div className="hidden md:flex flex-col gap-3 items-center rounded-2xl border border-line-subtle/10 bg-raised/70 backdrop-blur-xl px-3 py-4">
              {SLIDES.map((slide, i) => (
                <button key={i} onClick={() => goTo(i)}>
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? "w-6" : "w-1.5 bg-surface-inverse/10 hover:bg-surface-inverse/10"}`}
                    style={i === idx ? { backgroundColor: slide.accent } : undefined}
                  />
                </button>
              ))}
              <div className="w-px h-2 bg-raised/10 my-1" />
              <button onClick={() => goTo((idx - 1 + SLIDES.length) % SLIDES.length)} className="w-8 h-8 rounded-xl flex items-center justify-center text-fg/50 hover:text-fg hover:bg-surface-inverse/[0.05] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={() => goTo((idx + 1) % SLIDES.length)} className="w-8 h-8 rounded-xl flex items-center justify-center text-fg/50 hover:text-fg hover:bg-surface-inverse/[0.05] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



