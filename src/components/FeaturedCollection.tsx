import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { brandCollections } from "@/data/products";
import { useCatalogProducts } from "@/lib/useCatalog";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Reveal, StaggerGrid, StaggerItem } from "@/components/PageTransition";

const FEATURED_ID = "rouge-heritage";
const HERO_ID = "rouge-burgundy-mermaid";
const CARD_IDS = ["rouge-burgundy-silk-fitted", "rouge-red-polka-sweetheart", "rouge-burgundy-off-shoulder"];

const shortName = (name: string) => name.split(" • ").slice(2).join(" • ") || name;

export function FeaturedCollection() {
  const catalog = useCatalogProducts();
  const collection = brandCollections.find((c) => c.id === FEATURED_ID);
  if (!collection) return null;

  const all = catalog.filter((p) => p.collection === collection.name);
  const hero = all.find((p) => p.id === HERO_ID) ?? all[0];
  const cards = CARD_IDS.map((id) => all.find((p) => p.id === id)).filter(Boolean);

  const palette = [
    { name: "نبيذي", hex: "#682849" },
    { name: "ياقوتي", hex: "#9E1B32" },
    { name: "عنابي", hex: "#722F37" },
  ];

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Soft brand glow */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[420px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(closest-side, rgba(196,40,85,0.10), transparent)" }}
      />

      <div className="relative w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Eyebrow + title */}
        <Reveal>
          <div className="text-center mb-10 md:mb-12">
            <p className="flex items-center justify-center gap-1.5 text-[11px] font-bold tracking-widest uppercase mb-3" style={{ color: "#c42855" }}>
              المجموعة المميزة • إصدار 2026
            </p>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-fg">
              {collection.name} <span className="text-accent-brand">—</span>{" "}
              <span className="font-display text-accent-brand">{collection.arabic}</span>
            </h2>
            <p className="text-xs md:text-sm text-fg-tertiary mt-3">
              {collection.palette} • {collection.mood}
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-stretch">
          {/* Hero image with floating glass card */}
          {hero && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="group relative rounded-3xl overflow-hidden aspect-[3/4] md:aspect-auto md:min-h-[560px]"
            >
              <Link to={`/product/${hero.id}`} className="absolute inset-0 block">
                <OptimizedImage
                  src={hero.images[0]}
                  alt={hero.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(17,15,13,0.55), transparent 55%)" }} />
              </Link>

              {/* Floating story card */}
              <div
                className="absolute bottom-4 inset-x-4 md:bottom-6 md:inset-x-6 rounded-2xl p-5"
                style={{
                  background: "rgba(255,255,255,0.82)",
                  backdropFilter: "blur(20px)",
                  WebkitBackdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.6)",
                  boxShadow: "0 12px 32px rgba(17,15,13,0.12)",
                }}
              >
                <p className="text-[10px] font-bold tracking-widest uppercase mb-1" style={{ color: "#c42855" }}>
                  {collection.name} • {hero.model}
                </p>
                <p className="text-sm md:text-[15px] font-bold text-fg leading-snug">{shortName(hero.name)}</p>
                <p className="text-xs text-fg-tertiary mt-1.5 leading-relaxed">
                  بريق مسائي كلاسيكي بألوان النبيذ والياقوت — قطعة تُصاغ بإتقان لتبقى خالدة.
                </p>
              </div>
            </motion.div>
          )}

          {/* Editorial copy + CTA */}
          <Reveal className="flex flex-col justify-center">
            <div className="md:ps-2">
              <p className="text-xs text-fg-tertiary leading-7 md:text-sm md:leading-8">
                من أعماق {collection.name}، نُقدّم تشكيلة استثنائية تجمع بين الجرأة المسائية والرقي الهادئ.
                لوحة ألوان {collection.palette} تُترجم الحضور الأنثوي إلى خطوط واضحة وقصّات تعانق القوام،
                بمخمل ناعم وساتان ثقيل ينسدل بحركة ملكية.
              </p>
              <p className="text-xs text-fg-tertiary leading-7 md:text-sm md:leading-8 mt-3">
                كل قطعة في هذه المجموعة حكاية — من الميرميد بكتف واحد إلى القصّة الحريرية المحدّدة،
                صُمّمت لمناسبات تُستحق أن تُحفر في الذاكرة.
              </p>

              {/* Palette swatches */}
              <div className="flex items-center gap-3 mt-6">
                {palette.map((sw) => (
                  <div key={sw.name} className="flex items-center gap-1.5">
                    <span
                      className="w-6 h-6 rounded-full border border-black/5 shadow-sm"
                      style={{ background: sw.hex }}
                    />
                    <span className="text-[11px] text-fg-secondary">{sw.name}</span>
                  </div>
                ))}
              </div>

              <Link
                to={`/collections?collection=${FEATURED_ID}`}
                className="group inline-flex items-center gap-2 mt-8 px-7 py-3.5 rounded-full text-sm font-bold text-white transition-all duration-300 hover:scale-[1.03] hover:shadow-lg active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, #e63d6a, #c42855)", boxShadow: "0 8px 20px rgba(196,40,85,0.28)" }}
              >
                اكتشفي المجموعة
                <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Product cards */}
        <StaggerGrid className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mt-10">
          {cards.map((p) => p && (
            <StaggerItem key={p.id}>
              <Link to={`/product/${p.id}`} className="group block">
                <div className="relative rounded-2xl overflow-hidden">
                  <OptimizedImage
                    src={p.images[0]}
                    alt={p.name}
                    className="aspect-[3/4] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 p-3.5"
                    style={{ background: "linear-gradient(to top, rgba(17,15,13,0.62), transparent)" }}
                  />
                  <div className="absolute inset-x-0 bottom-0 p-3.5 flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold tracking-widest text-white/70 uppercase">{p.collection}</p>
                      <p className="text-xs md:text-sm font-bold text-white truncate mt-0.5">{shortName(p.name)}</p>
                    </div>
                    <span className="text-white text-xs md:text-sm font-bold whitespace-nowrap">{p.price} د.ل</span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
