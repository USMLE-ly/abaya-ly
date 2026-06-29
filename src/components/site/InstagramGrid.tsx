import { motion } from "framer-motion";
import { Instagram } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const imgs = [
  "https://images.unsplash.com/photo-1594938298603-c8148c4b5b3e?w=600&q=80",
  "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&q=80",
  "https://images.unsplash.com/photo-1617922001439-4a2e6562f328?w=600&q=80",
  "https://images.unsplash.com/photo-1551803091-e20673f15770?w=600&q=80",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80",
  "https://images.unsplash.com/photo-1576185850227-1f72b7f8d483?w=600&q=80",
];

export function InstagramGrid() {
  return (
    <section className="py-24 md:py-32 bg-ink">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeader
          eyebrow="انستغرام"
          title="إطلالاتنا على إنستغرام"
          subtitle="شاركينا إطلالتك بهاشتاق ‎#الملكة_ليبيا"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mt-14">
          {imgs.map((src, i) => (
            <motion.a
              key={i}
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.06, duration: 0.5 }}
              className="group relative aspect-square overflow-hidden rounded-xl border border-gold/10"
            >
              <img src={src} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gold/0 group-hover:bg-gold/60 transition-all duration-500 flex items-center justify-center">
                <Instagram className="opacity-0 group-hover:opacity-100 text-ink transition" size={36} />
              </div>
            </motion.a>
          ))}
        </div>

        <div className="flex justify-center mt-10">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-gold text-gold px-6 py-3 font-semibold hover:bg-gold hover:text-ink transition"
          >
            <Instagram size={18} />
            <span>@almalika.ly</span>
          </a>
        </div>
      </div>
    </section>
  );
}
