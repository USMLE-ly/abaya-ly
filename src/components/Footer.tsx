import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-canvas to-sunken border-t border-line/5">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10" style={{ direction: "rtl" }}>
          <div>
            <h3 className="font-display text-2xl font-bold text-accent-brand mb-4">نادين</h3>
            <p className="text-fg-tertiary text-sm leading-relaxed">
              بيت الفساتين الفاخرة في ليبيا. صُنعت لكل امرأة تستحق الأفضل.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-fg mb-4 text-sm">روابط سريعة</h4>
            <ul className="space-y-2.5 text-sm text-fg-tertiary">
              <li><Link to="/" className="hover:text-accent-brand transition-colors">الرئيسية</Link></li>
              <li><Link to="/collections" className="hover:text-accent-brand transition-colors">المجموعات</Link></li>
              <li><Link to="/about" className="hover:text-accent-brand transition-colors">عن نادين</Link></li>
              <li><Link to="/contact" className="hover:text-accent-brand transition-colors">تواصلي معنا</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-fg mb-4 text-sm">خدمة العملاء</h4>
            <ul className="space-y-2.5 text-sm text-fg-tertiary">
              <li><Link to="/faq" className="hover:text-accent-brand transition-colors">الأسئلة الشائعة</Link></li>
              <li><Link to="/track-order" className="hover:text-accent-brand transition-colors">تتبع الطلب</Link></li>
              <li><Link to="/shipping-policy" className="hover:text-accent-brand transition-colors">الشحن والتوصيل</Link></li>
              <li><Link to="/refund-policy" className="hover:text-accent-brand transition-colors">سياسة الإرجاع</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-fg mb-4 text-sm">السياسات</h4>
            <ul className="space-y-2.5 text-sm text-fg-tertiary">
              <li><Link to="/terms" className="hover:text-accent-brand transition-colors">شروط الاستخدام</Link></li>
              <li><Link to="/privacy" className="hover:text-accent-brand transition-colors">سياسة الخصوصية</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-fg mb-4 text-sm">تواصلي معنا</h4>
            <ul className="space-y-2.5 text-sm text-fg-tertiary">
              <li>بنغازي، ليبيا</li>
              <li><a href="mailto:nadine.luxor@gmail.com" className="hover:text-accent-brand transition-colors">nadine.luxor@gmail.com</a></li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="https://instagram.com/nadine.ly" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full glass flex items-center justify-center text-fg-tertiary hover:text-accent-brand hover:bg-sunken transition-all"><Instagram size={16} /></a>
              <a href="https://facebook.com/nadine.ly" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full glass flex items-center justify-center text-fg-tertiary hover:text-accent-brand hover:bg-sunken transition-all"><Facebook size={16} /></a>
              <a href="https://x.com/nadine_ly" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full glass flex items-center justify-center text-fg-tertiary hover:text-accent-brand hover:bg-sunken transition-all"><Twitter size={16} /></a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-line-subtle flex flex-col md:flex-row items-center justify-between text-xs text-fg-quaternary">
          <p>جميع الحقوق محفوظة © 2026 نادين</p>
        </div>
      </div>
      <div className="h-0.5 bg-gradient-to-r from-transparent via-strawberry-300/30 to-transparent" />
    </footer>
  );
}
