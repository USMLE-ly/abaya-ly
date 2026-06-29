import { MapPin, Phone, Mail } from "lucide-react";
import { Logo } from "./Crown";
import { InstagramIcon, FacebookIcon, TiktokIcon, WhatsappIcon } from "./SocialIcons";

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
              {[InstagramIcon, FacebookIcon, TiktokIcon].map((Icon, i) => (
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
