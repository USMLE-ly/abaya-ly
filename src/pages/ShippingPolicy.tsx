import { Link } from "react-router-dom";
import { ChevronLeft, Truck, Clock, MapPin, Package } from "lucide-react";

const sections = [
  {
    icon: Truck,
    title: "الشحن المجاني",
    content: "نقدم شحناً مجانيّاً لجميع مدن ليبيا. لا توجد أي رسوم إضافية على الشحن — السعر الذي ترين هو السعر النهائي.",
  },
  {
    icon: Clock,
    title: "مدة التوصيل",
    content: "يتم توصيل الطلبات خلال ٣-٥ أيام عمل من تاريخ تأكيد الطلب. في المناطق النائية قد يستغرق التوصيل يوماً إضافياً.",
  },
  {
    icon: MapPin,
    title: "مناطق التغطية",
    content: "نغطي جميع المدن وال المناطق الليبية بما في ذلك طرابلس، بنغازي، مصراتة،misrata، الخمس، سبها، والكثير غيرها.",
  },
  {
    icon: Package,
    title: "تغليف الطلب",
    content: "جميع طلباتنا مغلفة بعناية فائقة في عبوات أنيقة تحافظ على سلامة المنتج وتجعله جاهزاً للهدية مباشرة.",
  },
];

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-2 text-xs text-foreground/40 mb-8">
          <Link to="/" className="hover:text-ring transition-colors">الرئيسية</Link>
          <ChevronLeft size={12} />
          <span className="text-foreground font-medium">سياسة الشحن والتوصيل</span>
        </nav>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">سياسة الشحن <span className="text-primary">والتوصيل</span></h1>
        <p className="text-sm text-foreground/50 mb-10 leading-relaxed">نحرص على وصول طلبك بأمان وسرعة — تعرفي على تفاصيل شحننا وتوصيلنا.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {sections.map((s, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 flex items-center justify-center mb-4">
                <s.icon className="text-primary" size={18} strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-bold text-foreground mb-2">{s.title}</h3>
              <p className="text-xs text-foreground/40 leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h2 className="font-display text-lg font-bold text-foreground">تفاصيل إضافية</h2>
          <div className="space-y-3 text-xs text-foreground/50 leading-relaxed">
            <p>• عند تأكيد الطلب ستحصلين على رقم تتبععبر الواتساب أو البريد الإلكتروني.</p>
            <p>• يمكنكِ تتبع حالة طلبكِ من خلال صفحة <Link to="/track-order" className="text-primary hover:underline">تتبع الطلب</Link>.</p>
            <p>• في حالة التأخر عن موعد التوصيل المحدد، يرجى التواصل معنا فوراً وسنساعدكِ في حل المشكلة.</p>
            <p>• نحرص على إبلاغكِ بأي تغييرات في موعد التوصيل مسبقاً.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
