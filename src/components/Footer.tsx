import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="glass-subtle border-t border-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="font-display text-2xl font-bold text-ring mb-4">الملكة</h3>
            <p className="text-foreground/50 text-sm leading-relaxed">
              بيت العباءات الفاخرة في ليبيا. صُنعت لكل امرأة تستحق الأفضل.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">روابط سريعة</h4>
            <ul className="space-y-2.5 text-sm text-foreground/50">
              <li><Link to="/" className="hover:text-ring transition-colors">الرئيسية</Link></li>
              <li><Link to="/collections" className="hover:text-ring transition-colors">المجموعات</Link></li>
              <li><Link to="/about" className="hover:text-ring transition-colors">عن الملكة</Link></li>
              <li><Link to="/contact" className="hover:text-ring transition-colors">تواصلي معنا</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">خدمة العملاء</h4>
            <ul className="space-y-2.5 text-sm text-foreground/50">
              <li><Link to="/faq" className="hover:text-ring transition-colors">الأسئلة الشائعة</Link></li>
              <li><Link to="/track-order" className="hover:text-ring transition-colors">تتبع الطلب</Link></li>
              <li><span>الشحن والتوصيل</span></li>
              <li><span>سياسة الإرجاع</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">تواصلي معنا</h4>
            <ul className="space-y-2.5 text-sm text-foreground/50">
              <li>طرابلس، ليبيا</li>
              <li>+218 91 XXX XXXX</li>
              <li>info@almalika.ly</li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 rounded-full glass flex items-center justify-center text-foreground/50 hover:text-ring hover:bg-black/5 transition-all"><Instagram size={16} /></a>
              <a href="#" className="w-9 h-9 rounded-full glass flex items-center justify-center text-foreground/50 hover:text-ring hover:bg-black/5 transition-all"><Facebook size={16} /></a>
              <a href="#" className="w-9 h-9 rounded-full glass flex items-center justify-center text-foreground/50 hover:text-ring hover:bg-black/5 transition-all"><Twitter size={16} /></a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-black/5 flex flex-col md:flex-row items-center justify-between text-xs text-foreground/30">
          <p>جميع الحقوق محفوظة © ٢٠٢٥ الملكة</p>
          <p>صُنع بـ ❤ لكل امرأة ليبية</p>
        </div>
      </div>
    </footer>
  );
}
