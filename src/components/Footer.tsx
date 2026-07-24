import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <h3 className="font-display text-2xl font-bold text-gold mb-4">الملكة</h3>
            <p className="text-warm text-sm leading-relaxed">
              بيت العباءات الفاخرة في ليبيا. صُنعت لكل امرأة تستحق الأفضل.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-cream mb-4">روابط سريعة</h4>
            <ul className="space-y-2 text-sm text-warm">
              <li><Link to="/" className="hover:text-gold transition-colors">الرئيسية</Link></li>
              <li><Link to="/collections" className="hover:text-gold transition-colors">المجموعات</Link></li>
              <li><Link to="/about" className="hover:text-gold transition-colors">عن الملكة</Link></li>
              <li><Link to="/contact" className="hover:text-gold transition-colors">تواصلي معنا</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-cream mb-4">خدمة العملاء</h4>
            <ul className="space-y-2 text-sm text-warm">
              <li><Link to="/faq" className="hover:text-gold transition-colors">الأسئلة الشائعة</Link></li>
              <li><Link to="/track-order" className="hover:text-gold transition-colors">تتبع الطلب</Link></li>
              <li><span className="text-warm">الشحن والتوصيل</span></li>
              <li><span className="text-warm">سياسة الإرجاع</span></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-cream mb-4">تواصلي معنا</h4>
            <ul className="space-y-2 text-sm text-warm">
              <li>طرابلس، ليبيا</li>
              <li>+218 91 XXX XXXX</li>
              <li>info@almalika.ly</li>
            </ul>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-warm hover:text-gold transition-colors"><Instagram size={18} /></a>
              <a href="#" className="text-warm hover:text-gold transition-colors"><Facebook size={18} /></a>
              <a href="#" className="text-warm hover:text-gold transition-colors"><Twitter size={18} /></a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-gold/20 flex flex-col md:flex-row items-center justify-between text-xs text-warm">
          <p>جميع الحقوق محفوظة © ٢٠٢٥ الملكة</p>
          <p>صُنع بـ ❤ لكل امرأة ليبية</p>
        </div>
      </div>
    </footer>
  );
}
