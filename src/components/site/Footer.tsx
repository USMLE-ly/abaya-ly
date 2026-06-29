import { Instagram, Facebook, Music2, MapPin, Phone, Mail } from "lucide-react";
import { Logo } from "./Crown";

const WhatsappIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.4-1.5-.9-.8-1.5-1.8-1.6-2.1-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.2.2-1.3-.1-.1-.3-.2-.6-.3zM12 2C6.5 2 2 6.5 2 12c0 1.7.4 3.3 1.2 4.7L2 22l5.4-1.2c1.4.7 3 1.1 4.6 1.1 5.5 0 10-4.5 10-10S17.5 2 12 2z"/>
  </svg>
);

export function Footer() {
  return (
    <footer id="contact" className="bg-[#050505] border-t border-gold/30 pt-20 pb-8">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="text-right">
            <Logo />
            <p className="text-warm leading-[1.9] mt-6 text-sm">
              بيت العباءات الفاخرة في ليبيا — نصنع لكِ ما يليق بمكانتك.
            </p>
            <div className="flex gap-3 mt-6 justify-end">
              {[Instagram, Facebook, Music2].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-10 w-10 rounded-full bg-ink-3 border border-gold/20 flex items-center justify-center text-gold hover:bg-gold hover:text-ink transition"
                >
                  <Icon size={16} />
                </a>
              ))}
              <a
                href="https://wa.me/2189100000000"
                className="h-10 w-10 rounded-full bg-ink-3 border border-gold/20 flex items-center justify-center text-gold hover:bg-gold hover:text-ink transition"
              >
                <WhatsappIcon size={16} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="text-right">
            <h4 className="text-gold font-semibold mb-5">روابط سريعة</h4>
            <ul className="space-y-3 text-warm text-sm">
              <li><a href="#top" className="hover:text-gold transition">الرئيسية</a></li>
              <li><a href="#collections" className="hover:text-gold transition">المجموعات</a></li>
              <li><a href="#about" className="hover:text-gold transition">عن الملكة</a></li>
              <li><a href="#contact" className="hover:text-gold transition">تواصلي معنا</a></li>
            </ul>
          </div>

          {/* Collections */}
          <div className="text-right">
            <h4 className="text-gold font-semibold mb-5">المجموعات</h4>
            <ul className="space-y-3 text-warm text-sm">
              <li><a href="#collections" className="hover:text-gold transition">عبايات السهرة</a></li>
              <li><a href="#collections" className="hover:text-gold transition">عبايات كاجوال</a></li>
              <li><a href="#collections" className="hover:text-gold transition">عبايات رسمية</a></li>
              <li><a href="#collections" className="hover:text-gold transition">عبايات مطرّزة</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="text-right">
            <h4 className="text-gold font-semibold mb-5">تواصلي معنا</h4>
            <ul className="space-y-3 text-warm text-sm">
              <li className="flex items-center justify-end gap-2"><span>طرابلس، ليبيا</span><MapPin size={15} className="text-gold"/></li>
              <li className="flex items-center justify-end gap-2"><span>‎+218 91 XXX XXXX</span><Phone size={15} className="text-gold"/></li>
              <li className="flex items-center justify-end gap-2"><span>info@almalika.ly</span><Mail size={15} className="text-gold"/></li>
            </ul>
            <a
              href="https://wa.me/2189100000000"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-[color:var(--color-whatsapp)] text-white px-5 py-3 text-sm font-semibold hover:brightness-110 transition"
            >
              <WhatsappIcon />
              <span>راسلينا على واتساب</span>
            </a>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-gold/10 flex flex-col md:flex-row gap-3 items-center justify-between text-warm-muted text-xs">
          <p>جميع الحقوق محفوظة © ٢٠٢٥ الملكة</p>
          <p>صُنع بـ ❤ لكل امرأة ليبية</p>
        </div>
      </div>
    </footer>
  );
}
