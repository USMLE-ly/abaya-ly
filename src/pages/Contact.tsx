import { ContactForm } from "@/components/ContactForm";
import { MapPin, Phone } from "lucide-react";

import { PageTransition } from "@/components/PageTransition";
import { usePageMeta } from "@/lib/usePageMeta";

export function Contact() {
  usePageMeta("تواصلي معنا", "فريق نادين يرد عبر الواتساب خلال ساعات النهار — مقاس، طلب، أو شحن.");
  return <PageTransition><ContactContent /></PageTransition>;
}

function ContactContent() {
  return (
    <div className="min-h-screen">
      <section className="pt-24 pb-10 md:pt-28 md:pb-14">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6 text-center">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-fg mb-3">تواصلي <span className="text-accent-brand">معنا</span></h1>
          <p className="text-sm text-fg-tertiary max-w-lg mx-auto">سؤال عن مقاس، طلب، أو شحن؟ اكتبي لنا. نرد خلال ساعات النهار.</p>
        </div>
      </section>
      <section className="py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-6">
              {[
                { icon: <MapPin size={18} className="text-accent-brand" />, title: "العنوان", text: "طرابلس، ليبيا" },
                { icon: <Phone size={18} className="text-accent-brand" />, title: "الهاتف", text: "+218 91 XXX XXXX" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 glass-card p-5">
                  <div className="w-10 h-10 rounded-full bg-brand-subtle border border-line flex items-center justify-center flex-shrink-0">{item.icon}</div>
                  <div>
                    <h3 className="text-sm font-semibold text-fg">{item.title}</h3>
                    <p className="text-xs text-fg-tertiary">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div><ContactForm /></div>
          </div>
        </div>
      </section>
    </div>
  );
}
