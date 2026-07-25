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

declare const gsap: any;

export default function LuminaHero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [prevIdx, setPrevIdx] = useState<number | null>(null);
  const [fading, setFading] = useState(false);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goToSlide = useCallback((idx: number) => {
    if (idx === activeIdx || fading) return;
    setPrevIdx(activeIdx);
    setActiveIdx(idx);
    setFading(true);

    // Animate text out then in
    const tEl = document.getElementById("mainTitle-overlay");
    const dEl = document.getElementById("mainDesc-overlay");
    if (typeof gsap !== "undefined" && tEl && dEl) {
      gsap.to(tEl, { y: -15, opacity: 0, duration: 0.3, ease: "power2.in" });
      gsap.to(dEl, { y: -10, opacity: 0, duration: 0.25, ease: "power2.in" });
      setTimeout(() => {
        gsap.fromTo(tEl, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" });
        gsap.fromTo(dEl, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.1 });
      }, 350);
    }

    // After crossfade completes, remove previous image
    setTimeout(() => {
      setPrevIdx(null);
      setFading(false);
    }, 1000);

    // Reset auto-slide timer
    if (autoTimer.current) clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => {
      goToSlide((idx + 1) % SLIDES.length);
    }, 6000);
  }, [activeIdx, fading]);

  useEffect(() => {
    autoTimer.current = setTimeout(() => {
      goToSlide((activeIdx + 1) % SLIDES.length);
    }, 6000);

    // Load GSAP
    const loadScript = (src: string, globalName: string) =>
      new Promise<void>((res) => {
        if ((window as any)[globalName]) { res(); return; }
        const s = document.createElement("script");
        s.src = src;
        s.onload = () => setTimeout(res, 100);
        document.head.appendChild(s);
      });

    loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js", "gsap");

    // Animate initial text
    setTimeout(() => {
      if (typeof gsap !== "undefined") {
        const tEl = document.getElementById("mainTitle-overlay");
        const dEl = document.getElementById("mainDesc-overlay");
        if (tEl) gsap.fromTo(tEl, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.3 });
        if (dEl) gsap.fromTo(dEl, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.5 });
      }
    }, 500);

    return () => {
      if (autoTimer.current) clearTimeout(autoTimer.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const splitText = (text: string) =>
    text.split(" ").map((w, i) => `<span class="word"><span class="word-inner">${w}</span></span>`).join(" ");

  return (
    <div className="relative w-full h-[70vh] md:h-[88vh] overflow-hidden bg-black">
      {/* ── Image layers ── */}
      {prevIdx !== null && (
        <img
          src={SLIDES[prevIdx].media}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 opacity-0 pointer-events-none"
          style={{ opacity: 0 }}
        />
      )}
      <img
        src={SLIDES[activeIdx].media}
        alt={SLIDES[activeIdx].title}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
          fading ? "opacity-100" : "opacity-100"
        }`}
      />

      {/* ── Dark gradient for readability ── */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/70 via-black/10 to-black/30 pointer-events-none" />

      {/* ── Overlay (glassmorphism) ── */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end">
        <div className="max-w-[1400px] mx-auto w-full px-4 md:px-10 pb-8">
          <div className="flex items-end justify-between gap-6">
            {/* Left: slide info + text */}
            <div className="flex-1">
              {/* Counter */}
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl px-5 py-3 mb-4">
                <span className="text-xs font-bold tracking-wider text-white/40">
                  {String(activeIdx + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
                </span>
                <span className="w-px h-3 bg-white/15" />
                <span className="text-xs text-white/50">الملكة</span>
              </div>

              {/* Title */}
              <h1
                className="!text-left !mb-2"
                id="mainTitle-overlay"
                style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontFamily: "var(--font-body)", fontWeight: 300, color: "#fff", lineHeight: 1.1, textShadow: "0 2px 30px rgba(0,0,0,0.5)" }}
              />

              {/* Subtitle */}
              <p className="text-sm font-medium mb-2" style={{ color: SLIDES[activeIdx].accent }}>
                {SLIDES[activeIdx].subtitle}
              </p>

              {/* CTA + Nav arrows */}
              <div className="flex items-center gap-4 mt-2">
                <a href="/collections" className="px-7 py-3 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:scale-105" style={{ backgroundColor: SLIDES[activeIdx].accent }}>
                  اكتشفي المجموعة
                </a>
                <div className="flex gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-1.5">
                  <button onClick={() => goToSlide((activeIdx - 1 + SLIDES.length) % SLIDES.length)} className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08] transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                  </button>
                  <button onClick={() => goToSlide((activeIdx + 1) % SLIDES.length)} className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08] transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: nav dots in glass */}
            <div className="hidden md:flex flex-col gap-2 items-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl px-3 py-4">
              {SLIDES.map((slide, i) => (
                <button key={i} onClick={() => goToSlide(i)} className="group" aria-label={`Slide ${i + 1}`}>
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIdx ? "w-6" : "w-1.5 bg-white/20 group-hover:bg-white/40"}`}
                    style={i === activeIdx ? { backgroundColor: slide.accent } : undefined}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
