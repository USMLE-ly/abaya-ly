import { motion } from "framer-motion";

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "right";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7 }}
      className={align === "center" ? "text-center mx-auto max-w-2xl" : "text-right max-w-2xl"}
    >
      {eyebrow && (
        <p className="text-gold text-sm tracking-[0.25em] uppercase mb-4">{eyebrow}</p>
      )}
      <h2 className="font-display font-bold text-cream text-4xl md:text-5xl leading-tight">
        {title}
      </h2>
      {subtitle && <p className="text-warm text-base md:text-lg leading-[1.9] mt-5">{subtitle}</p>}
    </motion.div>
  );
}
