import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { products } from "@/data/products";
import { InteractiveProductCard } from "@/components/ui/card-7";
import { SectionHeader } from "./SectionHeader";

const tabs = ["الكل", "السهرة", "الكاجوال", "الرسمية", "المطرّزة"] as const;

const CrownLogo =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23c9a84c'%3E%3Cpath d='M2.5 18.5l1.5-9 4 3 4-6 4 6 4-3 1.5 9z'/%3E%3Cpath d='M2 19.5h20' stroke='%23c9a84c' stroke-width='1'/%3E%3Ccircle cx='12' cy='4' r='1'/%3E%3Ccircle cx='4.5' cy='9.5' r='0.8'/%3E%3Ccircle cx='19.5' cy='9.5' r='0.8'/%3E%3C/svg%3E";

export function FeaturedCollection() {
  const [active, setActive] = useState<(typeof tabs)[number]>("الكل");
  const list = active === "الكل" ? products : products.filter((p) => p.category === active);

  return (
    <section id="collections" className="py-24 md:py-32 bg-ink overflow-hidden">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeader
          eyebrow="مجموعاتنا"
          title="اخترنا لكِ الأرقى"
          subtitle="كل قطعة قصة، كل تطريزة فن، كل خيط يحكي عن امرأة تستحق الأفضل"
        />

        <div className="flex flex-wrap justify-center gap-2 md:gap-6 mt-12 mb-14 border-b border-gold/10">
          {tabs.map((t) => {
            const isActive = active === t;
            return (
              <button
                key={t}
                onClick={() => setActive(t)}
                className="relative px-4 md:px-5 py-3 text-sm md:text-base font-medium transition"
              >
                <span className={isActive ? "text-gold" : "text-warm hover:text-cream"}>{t}</span>
                {isActive && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-gold"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto px-6 lg:px-10 pb-8 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: "none" }}>
        {list.map((p) => (
          <div key={p.id} className="snap-center flex-shrink-0">
            <InteractiveProductCard
              imageUrl={p.images[0]}
              logoUrl={CrownLogo}
              title={p.name}
              description={p.fabric}
              price={`${p.price} د.ل`}
              badge={p.badge}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-14">
        <a
          href="#collections"
          className="inline-flex items-center gap-2 rounded-full border border-gold text-gold px-8 py-4 font-semibold hover:bg-gold hover:text-ink transition"
        >
          <span>عرض المزيد</span>
          <ArrowLeft size={18} />
        </a>
      </div>
    </section>
  );
}
