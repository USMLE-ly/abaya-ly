import { useEffect, useRef, useState } from "react";

const SLIDES = [
  {
    media: "/images/hero/abaya-gold-1.jpg",
    title: "عباية السهرة الذهبية",
    subtitle: "مجموعة السهرة الفاخرة",
    accent: "#c9a84c",
  },
  {
    media: "/images/hero/abaya-gold-2.jpg",
    title: "الفخامة الليبية",
    subtitle: "تشكيلة ٢٠٢٥",
    accent: "#dd1d1d",
  },
];

const DURATION = 6000;

export default function LuminaHero() {
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
    <div className="relative w-full h-[70vh] md:h-[88vh] overflow-hidden bg-black">
      {SLIDES.map((slide, i) => (
        <img
          key={i}
          src={slide.media}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: i === idx ? 1 : 0,
            transition: "opacity 1s ease-in-out",
            zIndex: i === idx ? 1 : 0,
          }}
        />
      ))}

      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/80 via-black/20 to-black/40 pointer-events-none" />

      <div className="absolute inset-0 z-10 flex flex-col justify-end">
        <div className="max-w-[1400px] mx-auto w-full px-4 md:px-10 pb-8">
          <div className="flex items-end justify-between gap-6">
            {/* Right: text blocks — each in its own glass card */}
            <div className="flex-1 max-w-lg flex flex-col items-end gap-3">
              {/* Counter */}
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl px-5 py-3">
                <span className="text-xs font-bold tracking-wider text-white/40">
                  {String(idx + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
                </span>
                <span className="w-px h-3 bg-white/15" />
                <span className="text-xs text-white/50">الملكة</span>
              </div>

              {/* Title */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl px-6 py-4 w-full text-right">
                <h1
                  style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 300, color: "#fff", lineHeight: 1.1, textShadow: "0 2px 30px rgba(0,0,0,0.5)" }}
                >
                  {SLIDES[idx].title}
                </h1>
              </div>

              {/* Subtitle */}
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl px-5 py-2">
                <p className="text-sm font-medium" style={{ color: SLIDES[idx].accent }}>
                  {SLIDES[idx].subtitle}
                </p>
              </div>

              {/* CTA */}
              <a
                href="/collections"
                className="inline-block px-7 py-3 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:scale-105 border border-white/10 bg-white/[0.06] backdrop-blur-xl"
                style={{ backgroundColor: SLIDES[idx].accent, borderColor: "transparent" }}
              >
                اكتشفي المجموعة
              </a>

              {/* Progress bar */}
              <div className="h-[2px] w-full max-w-md rounded-full bg-white/10 overflow-hidden mt-2">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${progress * 100}%`, backgroundColor: SLIDES[idx].accent, transition: "none" }}
                />
              </div>
            </div>

            {/* Left: nav dots + arrows in glass panel */}
            <div className="hidden md:flex flex-col gap-3 items-center rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-xl px-3 py-4">
              {SLIDES.map((slide, i) => (
                <button key={i} onClick={() => goTo(i)}>
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? "w-6" : "w-1.5 bg-white/20 hover:bg-white/40"}`}
                    style={i === idx ? { backgroundColor: slide.accent } : undefined}
                  />
                </button>
              ))}
              <div className="w-px h-2 bg-white/10 my-1" />
              <button onClick={() => goTo((idx - 1 + SLIDES.length) % SLIDES.length)} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={() => goTo((idx + 1) % SLIDES.length)} className="w-8 h-8 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.08] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
