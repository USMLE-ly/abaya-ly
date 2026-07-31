import { useState } from "react";
import { Play } from "lucide-react";

interface Props {
  src?: string;
  poster?: string;
  title?: string;
}

/** Shrine-style video section — lazy plays inline when opened. */
export function FashionVideo({
  src = "https://cdn.shopify.com/videos/c/o/v/cd26c0cb94b448cd94c16b0ffedbc8ce.mp4",
  poster = "",
  title = "نادين — لمسة فخامة لكل مناسبة",
}: Props) {
  const [playing, setPlaying] = useState(false);

  return (
    <section className="py-14 md:py-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-8">
          <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-accent-brand mb-2">نادين فيلم</p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-fg">{title}</h2>
        </div>
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-sunken group">
          {playing ? (
            <video
              src={src}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="absolute inset-0 flex items-center justify-center"
              aria-label="تشغيل الفيديو"
            >
              {poster && (
                <img src={poster} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
              )}
              <span className="relative z-10 w-20 h-20 rounded-full bg-brand text-white flex items-center justify-center shadow-xl shadow-brand/30 transition-transform duration-300 group-hover:scale-110">
                <Play size={30} className="mr-0.5" fill="currentColor" />
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
