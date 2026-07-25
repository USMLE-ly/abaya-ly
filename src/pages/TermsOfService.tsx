import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

const sections = [
  {
    title: "القبول بالشروط",
    content: "باستخدامكِ لموقعنا أو إجراء أي طلب، أنتِ توافقين على هذه الشروط والأحكام بالكامل. يُرجى قراءتها بعناية قبل إتمام أي عملية شراء.",
  },
  {
    title: "المنتجات والأسعار",
    content: "جميع الأسعار معروضة بالدينار الليبي (د.ل) وتشمل الضريبة. نحتفظ بالحق في تغيير الأسعار في أي وقت دون إشعار مسبق. صور المنتجات قدر الإمكان دقيقة، لكن قد تختلف الألوان قليلاً بسبب اختلاف شاشات العرض.",
  },
  {
    title: "الطلبات والدفع",
    content: "تُعتبر الطلب مؤكدّاً عند استلام الدفع. نقبل الدفع النقدي عند الاستلام والتحويل البنكي. لا نتحمل المسؤولية عن أي أضرار ناتجة عن تأخير تحويلات البنوك.",
  },
  {
    title: "الشحن والتوصيل",
    content: "نقدم شحناً مجانيّاً لجميع مدن ليبيا. مدة التوصيل ٣-٥ أيام عمل. يرجى الاطلاع على صفحة الشحن والتوصيل للتفاصيل الكاملة.",
    link: "/shipping-policy",
    linkText: "سياسة الشحن",
  },
  {
    title: "الإرجاع والاستبدال",
    content: "يمكنكِ إرجاع المنتج خلال ٧ أيام من الاستلام بشرط أن يكون بحالته الأصلية. يرجى الاطلاع على صفحة سياسة الإرجاع للتفاصيل.",
    link: "/refund-policy",
    linkText: "سياسة الإرجاع",
  },
  {
    title: "الملكية الفكرية",
    content: "جميع المحتويات على الموقع (نصوص، صور، شعارات، تصميمات) هي ملك حصري لشركة الملكة. يُمنع أي نسخ أو استخدام بدون إذن كتابي مسبق.",
  },
  {
    title: "الخصوصية",
    content: "نحترم خصوصيتكِ ونحمي بياناتكِ الشخصية. يرجى الاطلاع على صفحة سياسة الخصوصية لمعرفة كيف نجمع ونستخدم معلوماتكِ.",
    link: "/privacy",
    linkText: "سياسة الخصوصية",
  },
  {
    title: "المسؤولية",
    content: "لا نتحمل المسؤولية عن أي أضرار غير مباشرة ناتجة عن استخدام منتجاتنا أو موقعنا. مسؤوليتنا تقتصر على قيمة المنتج المشترى فقط.",
  },
  {
    title: "تعديل الشروط",
    content: "نحتفظ بالحق في تعديل هذه الشروط في أي وقت. أي تغييرات سارية فور نشرها على الموقع. استخدامكِ للموقع بعد التعديل يعني موافقتكِ على الشروط الجديدة.",
  },
  {
    title: "التواصل",
    content: "أي استفسارات حول هذه الشروط يُرجى التواصل معنا عبر الواتساب أو البريد الإلكتروني.",
  },
];

export default function TermsOfService() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-2 text-xs text-foreground/40 mb-8">
          <Link to="/" className="hover:text-ring transition-colors">الرئيسية</Link>
          <ChevronLeft size={12} />
          <span className="text-foreground font-medium">شروط الاستخدام</span>
        </nav>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">شروط <span className="text-primary">الاستخدام</span></h1>
        <p className="text-sm text-foreground/50 mb-4 leading-relaxed">آخر تحديث: يوليو ٢٠٢٥</p>
        <p className="text-sm text-foreground/50 mb-10 leading-relaxed">يُرجى قراءة شروط الاستخدام هذه بعناية قبل استخدام موقعنا أو إجراء أي طلب.</p>

        <div className="space-y-6">
          {sections.map((s, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl">
              <h2 className="font-display text-sm font-bold text-foreground mb-3">{s.title}</h2>
              <p className="text-xs text-foreground/40 leading-relaxed">
                {s.content}
                {s.link && (
                  <>
                    {" "}
                    <Link to={s.link} className="text-primary hover:underline">{s.linkText}</Link>.
                  </>
                )}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
