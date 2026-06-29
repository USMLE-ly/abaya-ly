import { motion } from "framer-motion";
import { Scissors, Sparkles, Ruler, Truck } from "lucide-react";
import { SectionHeader } from "./SectionHeader";

const features = [
  {
    n: "٠١",
    icon: Sparkles,
    title: "أقمشة من قلب العالم",
    text: "نختار أقمشتنا بعناية من إيطاليا وفرنسا وتركيا — جورجيت، حرير، كريب، وستان بجودة لا تُضاهى",
  },
  {
    n: "٠٢",
    icon: Scissors,
    title: "تطريز يدوي بلمسة ليبية",
    text: "كل خيط يُحاك بحب، كل زخرفة تحكي تراثنا — نساء حرفيات ليبيات يبدعن في كل تفصيلة",
  },
  {
    n: "٠٣",
    icon: Ruler,
    title: "مقاسات لكل امرأة",
    text: "نؤمن أن الجمال لا مقاس له — تفصيل مخصص يناسب كل جسم وكل ذوق",
  },
  {
    n: "٠٤",
    icon: Truck,
    title: "وصول لباب بيتك",
    text: "شحن مجاني وسريع لجميع مدن ليبيا — طرابلس، بنغازي، مصراتة، الزنتان، وكل مدينة تسكنها",
  },
];

export function WhyUs() {
  return (
    <section id="about" className="py-24 md:py-32 bg-ink-2">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <SectionHeader
          eyebrow="القيم"
          title="لماذا الملكة؟"
          subtitle="لأن المرأة الليبية تستحق ما هو أفخر وأجمل"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {features.map((f, i) => (
            <motion.div
              key={f.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-2xl bg-ink-3 border border-gold/15 p-8 hover:border-gold/40 transition-colors"
            >
              <span className="absolute -bottom-4 -left-2 text-[140px] font-bold text-gold/[0.06] leading-none select-none">
                {f.n}
              </span>
              <div className="relative">
                <f.icon className="text-gold" size={36} strokeWidth={1.5} />
                <h3 className="text-cream text-xl font-semibold mt-6">{f.title}</h3>
                <p className="text-warm leading-[1.9] mt-3 text-[15px]">{f.text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
