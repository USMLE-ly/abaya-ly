import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { products } from "@/data/products";

const WhatsappIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.7.4 3.3 1.2 4.7L2 22l5.4-1.2c1.4.7 3 1.1 4.6 1.1 5.5 0 10-4.5 10-10S17.5 2 12 2z"/>
  </svg>
);

export function Spotlight() {
  const items = [products[0], products[1]];
  return (
    <section className="bg-ink">
      {items.map((p, i) => {
        const reverse = i % 2 === 1;
        return (
          <div
            key={p.id}
            className={`grid lg:grid-cols-2 min-h-[560px] border-b border-gold/10 ${
              reverse ? "lg:[direction:ltr]" : ""
            }`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 1.03 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1 }}
              className="relative aspect-[4/5] lg:aspect-auto overflow-hidden"
            >
              <img src={p.images[0]} alt={p.name} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/20" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="flex items-center bg-ink-2 px-8 md:px-16 py-16 lg:[direction:rtl]"
            >
              <div className="max-w-lg mx-auto text-right">
                <span className="text-gold text-sm tracking-[0.25em] uppercase">
                  {i === 0 ? "الأكثر طلباً" : "جديد في المجموعة"}
                </span>
                <h3 className="font-display text-4xl md:text-5xl font-bold text-cream mt-4 leading-tight">
                  {p.name}
                </h3>
                <div className="flex items-center gap-2 mt-4 justify-end">
                  <span className="text-warm text-sm">({p.reviewCount} تقييم)</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} size={16} className="fill-gold text-gold" />
                    ))}
                  </div>
                </div>
                <p className="text-warm leading-[1.9] mt-5 text-[15px]">{p.description}</p>

                <div className="mt-6 text-gold text-3xl font-bold">{p.price} د.ل</div>

                <div className="flex items-center gap-3 mt-5 justify-end">
                  {p.colors.map((c) => (
                    <div key={c.hex} className="flex items-center gap-2">
                      <span className="text-warm-muted text-xs">{c.name}</span>
                      <span
                        className="h-5 w-5 rounded-full border border-gold/40"
                        style={{ backgroundColor: c.hex }}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-8 justify-end">
                  <Link
                    to="/product/$id"
                    params={{ id: p.id }}
                    className="rounded-full bg-gold px-8 py-3.5 text-ink font-semibold hover:brightness-110 transition"
                  >
                    اطلبيها الآن
                  </Link>
                  <a
                    href="https://wa.me/2189100000000"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 text-[color:var(--color-whatsapp)] hover:underline"
                  >
                    <WhatsappIcon />
                    <span>أو تواصلي معنا عبر واتساب</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        );
      })}
    </section>
  );
}
