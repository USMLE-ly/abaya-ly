import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { products } from "@/data/products";
import { ProductCard } from "./ProductCard";
import { SectionHeader } from "./SectionHeader";

const tabs = ["الكل", "السهرة", "الكاجوال", "الرسمية", "المطرّزة"] as const;

export function FeaturedCollection() {
  const [active, setActive] = useState<(typeof tabs)[number]>("الكل");
  const list = active === "الكل" ? products : products.filter((p) => p.category === active);

  return (
    <section id="collections" className="py-24 md:py-32 bg-ink">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {list.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
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
      </div>
    </section>
  );
}
