import { Link } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { ChevronLeft, Shield, Eye, Database, Share2 } from "lucide-react";

const sections = [
  {
    icon: Eye,
    title: "المعلومات التي نجمعها",
    content: "نجمع المعلومات التي تقدمينها مباشرة عند إنشاء حساب أو إجراء طلب: الاسم الكامل، رقم الهاتف، العنوان، البريد الإلكتروني. كما نجمع معلومات تلقائية مثل عنوان IP ونوع الجهاز عند استخدامكِ للموقع.",
  },
  {
    icon: Database,
    title: "كيف نستخدم معلوماتكِ",
    content: "نستخدم معلوماتكِ لـ: معالجة طلباتكِ وتوصيلها، التواصل معكِ بخصوص طلبكِ، تحسين تجربة التسوق على موقعنا، إرسال عروض وتحديثات (فقط بموافقتكِ)، والامتثال للالتزامات القانونية.",
  },
  {
    icon: Share2,
    title: "مشاركة المعلومات",
    content: "لا نبيع أو نؤجر معلوماتكِ الشخصية لأي طرف ثالث. نشارك معلوماتكِ فقط مع شركاء الشحن والتوصيل لغرض توصيل طلبكِ، وبشكل محدود عند الالتزام القانوني.",
  },
  {
    icon: Shield,
    title: "حماية معلوماتكِ",
    content: "نستخدم تقنيات تشفير متقدمة لحماية معلوماتكِ الشخصية. جميع البيانات المحفوظة على خوادم آمنة ومؤمّنة. نلتزم بإجراءات أمان صارمة لمنع الوصول غير المصرح به.",
  },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-2 text-xs text-fg/40 mb-8">
          <Link to="/" className="hover:text-ring transition-colors">الرئيسية</Link>
          <ChevronLeft size={12} />
          <span className="text-fg font-medium">سياسة الخصوصية</span>
        </nav>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-fg mb-4">سياسة <span className="text-accent-brand">الخصوصية</span></h1>
        <p className="text-sm text-fg/50 mb-4 leading-relaxed">آخر تحديث: يوليو ٢٠٢٥</p>
        <p className="text-sm text-fg/50 mb-10 leading-relaxed">نحترم خصوصيتكِ ونلتزم بحماية بياناتكِ الشخصية. تعرفي على كيف نجمع ونستخدم ونحمي معلوماتكِ.</p>

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
          <h2 className="font-display text-lg font-bold text-fg">حقوقكِ</h2>
          <div className="space-y-3 text-xs text-fg/50 leading-relaxed">
            <p>• الحق في الوصول إلى معلوماتكِ الشخصية المحفوظة لدينا.</p>
            <p>• الحق في طلب تعديل أو حذف معلوماتكِ الشخصية.</p>
            <p>• الحق في إلغاء الاشتراك من الرسائل التسويقية في أي وقت.</p>
            <p>• الحق في طلب نسخة من جميع بياناتكِ المحفوظة.</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl mt-6">
          <h2 className="font-display text-lg font-bold text-fg mb-3">التواصل</h2>
          <p className="text-xs text-fg/50 leading-relaxed">أي استفسارات حول سياسة الخصوصية يُرجى التواصل معنا عبر الواتساب أو البريد الإلكتروني.</p>
        </div>
      </div>
    </div>
  );
}
