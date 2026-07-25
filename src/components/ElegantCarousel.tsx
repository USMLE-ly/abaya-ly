import { useState, useEffect, useRef, useCallback } from "react";

const images = [
  "/images/hero/abaya-gold-1.jpg",
  "/images/hero/abaya-gold-2.jpg",
];

export default function ElegantCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef(0);

  const goNext = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    intervalRef.current = setInterval(goNext, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPaused, goNext]);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) setCurrent((c) => (c + (diff > 0 ? 1 : -1) + images.length) % images.length);
  };

  return (
    <div
      className="relative w-full h-[70vh] md:h-[85vh] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {images.map((src, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img src={src} alt="" className="w-full h-full object-cover" />
        </div>
      ))}

      {/* Dots */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-10">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === current ? "bg-white w-6" : "bg-white/40 hover:bg-white/60"}`}
          />
        ))}
      </div>
    </div>
  );
}
