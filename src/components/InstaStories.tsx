import { Instagram } from "lucide-react";
import { products } from "@/data/products";
import { Reveal } from "@/components/PageTransition";

const INSTAGRAM_URL = "https://instagram.com/nadine.ly";

/** Shrine-style Instagram stories strip — circular links to the brand profile. */
export function InstaStories() {
  const items = products.slice(0, 8);

  return (
    <Reveal>
      <section className="py-14 md:py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-accent-brand mb-2 flex items-center gap-1.5">
                <Instagram size={13} />
                nadine.ly
              </p>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-fg">
                تابعينا على <span className="text-accent-brand">انستغرام</span>
              </h2>
            </div>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-xs font-semibold text-accent-brand hover:underline"
            >
              <Instagram size={14} />
              متابعة
            </a>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" dir="ltr">
            {items.map((p, i) => (
              <a
                key={p.id}
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="snap-start shrink-0 group text-center"
                dir="rtl"
              >
                <span
                  className="block rounded-full p-[3px] transition-transform duration-300 group-hover:scale-105"
                  style={{ background: "conic-gradient(from 180deg, #c42855, #ff8fa3, #ffd3a5, #c42855)" }}
                >
                  <span className="block rounded-full p-[3px] bg-canvas">
                    <span className="block w-[76px] h-[76px] sm:w-[88px] sm:h-[88px] rounded-full overflow-hidden border-2 border-white dark:border-zinc-900">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </span>
                  </span>
                </span>
                <span className="block mt-2 w-[76px] sm:w-[88px] truncate text-[10px] font-medium text-fg-secondary">
                  {p.model || p.name.split(" • ").slice(1).join(" • ")}
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </Reveal>
  );
}
