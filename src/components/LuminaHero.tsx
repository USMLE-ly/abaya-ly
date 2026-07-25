import { useEffect, useRef, useState, useCallback } from "react";

const SLIDES = [
  {
    media: "/images/hero/abaya-gold-1.jpg",
    title: "عباية السهرة الذهبية",
    description: "مصنوعة من الجورجيت الإيطالي الفاخر مع تطريز يدوي بخيوط ذهبية أصيلة",
    accent: "#c9a84c",
    subtitle: "مجموعة السهرة الفاخرة",
  },
  {
    media: "/images/hero/abaya-gold-2.jpg",
    title: "الفخامة الليبية",
    description: "أقمشة عالمية من إيطاليا وفرنسا وتركيا — صُنعت لكل امرأة تستحق الأفضل",
    accent: "#dd1d1d",
    subtitle: "تشكيلة ٢٠٢٥",
  },
];

const SLIDE_DURATION = 6000;
declare const gsap: any;

export default function LuminaHero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [fading, setFading] = useState(false);
  const [progress, setProgress] = useState(0);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressStart = useRef(Date.now());
  const progressRaf = useRef<number>(0);

  useEffect(() => {
    progressStart.current = Date.now();
    const tick = () => {
      const elapsed = Date.now() - progressStart.current;
      setProgress(Math.min(elapsed / SLIDE_DURATION, 1));
      if (elapsed < SLIDE_DURATION) {
        progressRaf.current = requestAnimationFrame(tick);
      }
    };
    progressRaf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(progressRaf.current);
  }, [activeIdx]);

  const goToSlide = useCallback((idx: number) => {
    if (idx === activeIdx || fading) return;
    setPrevIdx(activeIdx);
    setActiveIdx(idx);
    setFading(true);
    setProgress(0);

    const tEl = document.getElementById("mainTitle-overlay");
    if (typeof gsap !== "undefined" && tEl) {
      gsap.to(tEl, { y: -15, opacity: 0, duration: 0.3, ease: "power2.in" });
      setTimeout(() => {
        gsap.fromTo(tEl, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" });
      }, 350);
    }

    setTimeout(() => { setPrevIdx(null); setFading(false); }, 1000);

    if (autoTimer.current) clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => {
      goToSlide((idx + 1) % SLIDES.length);
    }, SLIDE_DURATION);
  }, [activeIdx, fading]);

  useEffect(() => {
    autoTimer.current = setTimeout(() => {
      goToSlide((activeIdx + 1) % SLIDES.length);
    }, SLIDE_DURATION);

    if (typeof gsap === "undefined") {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js";
      document.head.appendChild(s);
    }

    setTimeout(() => {
      if (typeof gsap !== "undefined") {
        const tEl = document.getElementById("mainTitle-overlay");
        if (tEl) gsap.fromTo(tEl, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.3 });
      }
    }, 500);

    return () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="relative w-full h-[70vh] md:h-[88vh] overflow-hidden bg-black">
      {prevIdx !== null && (
        <img src={SLIDES[prevIdx].media} alt="" className="absolute inset-0 w-full h-full object-cover pointer-events-none" style={{ opacity: 0 }} />
      )}
      <img
        src={SLIDES[activeIdx].media}
        alt={SLIDES[activeIdx].title}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transition: "opacity 1s ease" }}
      />

      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/80 via-black/20 to-black/40 pointer-events-none" />

      <div className="absolute inset-0 z-10 flex flex-col justify-end">
        <div className="max-w-[1400px] mx-auto w-full px-4 md:px-10 pb-8">
          <div className="flex items-end justify-between gap-6">
            {/* Left: text block */}
            <div className="flex-1 max-w-lg">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl px-5 py-3 mb-4">
                <span className="text-xs font-bold tracking-wider text-white/40">
                  {String(activeIdx + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
                </span>
                <span className="w-px h-3 bg-white/15" />
                <span className="text-xs text-white/50">الملكة</span>
              </div>

              <h1
                className="!text-left !mb-2"
                id="mainTitle-overlay"
                style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontFamily: "var(--font-body)", fontWeight: 300, color: "#fff", lineHeight: 1.1, textShadow: "0 2px 30px rgba(0,0,0,0.5)" }}
              />

              <p className="text-sm font-medium mb-4" style={{ color: SLIDES[activeIdx].accent }}>
                {SLIDES[activeIdx].subtitle}
              </p>

              <a
                href="/collections"
                className="inline-block px-7 py-3 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: SLIDES[activeIdx].accent }}
              >
                اكتشفي المجموعة
              </a>
            </div>

            {/* Right: nav arrows + dots in glass panel */}
            <div className="hidden md:flex flex-col gap-3 items-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl px-3 py-4">
              {SLIDES.map((slide, i) => (
                <button key={i} onClick={() => goToSlide(i)} className="group" aria-label={`Slide ${i + 1}`}>
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIdx ? "w-6" : "w-1.5 bg-white/20 group-hover:bg-white/40"}`}
                    style={i === activeIdx ? { backgroundColor: slide.accent } : undefined}
                  />
                </button>
              ))}
              <div className="w-px h-2 bg-white/10 my-1" />
              <button onClick={() => goToSlide((activeIdx - 1 + SLIDES.length) % SLIDES.length)} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={() => goToSlide((activeIdx + 1) % SLIDES.length)} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-5 h-[2px] w-full max-w-md rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${progress * 100}%`, backgroundColor: SLIDES[activeIdx].accent, transition: "none" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
