import { Link } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { usePageMeta } from "@/lib/usePageMeta";
import { ChevronLeft, Truck, Clock, MapPin, Package } from "lucide-react";

const sections = [
  {
    icon: Truck,
    title: "التوصيل المجاني",
    content: "التوصيل مجاني داخل بنغازي. للمدن الأخرى تُضاف رسوم توصيل ثابتة (15 د.ل) تُعرض بوضوح عند إتمام الطلب.",
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
  usePageMeta("الشحن والتوصيل", "توصيل مجاني داخل بنغازي خلال 3-5 أيام عمل.");
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-2 text-xs text-fg/40 mb-8">
          <Link to="/" className="hover:text-ring transition-colors">الرئيسية</Link>
          <ChevronLeft size={12} />
          <span className="text-fg font-medium">سياسة الشحن والتوصيل</span>
        </nav>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-fg mb-4">سياسة الشحن <span className="text-accent-brand">والتوصيل</span></h1>
        <p className="text-sm text-fg/50 mb-10 leading-relaxed">نحرص على وصول طلبك بأمان وسرعة — تعرفي على تفاصيل شحننا وتوصيلنا.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {sections.map((s, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 flex items-center justify-center mb-4">
                <s.icon className="text-accent-brand" size={18} strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-bold text-fg mb-2">{s.title}</h3>
              <p className="text-xs text-fg/40 leading-relaxed">{s.content}</p>
            </div>
          ))}
        </div>

        <div className="glass-card p-6 rounded-2xl space-y-4">
          <h2 className="font-display text-lg font-bold text-fg">تفاصيل إضافية</h2>
          <div className="space-y-3 text-xs text-fg/50 leading-relaxed">
            <p>• عند تأكيد الطلب ستحصلين على رقم تتبععبر الواتساب أو البريد الإلكتروني.</p>
            <p>• يمكنكِ تتبع حالة طلبكِ من خلال صفحة <Link to="/track-order" className="text-accent-brand hover:underline">تتبع الطلب</Link>.</p>
            <p>• في حالة التأخر عن موعد التوصيل المحدد، يرجى التواصل معنا فوراً وسنساعدكِ في حل المشكلة.</p>
            <p>• نحرص على إبلاغكِ بأي تغييرات في موعد التوصيل مسبقاً.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
