import { Link } from "react-router-dom";
import { PageTransition } from "@/components/PageTransition";
import { usePageMeta } from "@/lib/usePageMeta";
import { ChevronLeft, RotateCcw, Clock, CheckCircle, XCircle } from "lucide-react";

const conditions = [
  { icon: CheckCircle, text: "يجب أن يكون المنتج بحالته الأصلية دون استعمال", type: "success" },
  { icon: CheckCircle, text: "الإرجاع خلال ٧ أيام من تاريخ الاستلام", type: "success" },
  { icon: CheckCircle, text: "المنتج غير مغسول ولا يحمل أي رائحة عطر أو مستحضرات", type: "success" },
  { icon: XCircle, text: "المنتجات المُصممة حسب الطلب لا تُقبل للإرجاع", type: "danger" },
  { icon: XCircle, text: "المنتجات المخفضة لا تُقبل للإرجاع إلا في حالة العيب", type: "danger" },
];

export default function RefundPolicy() {
  usePageMeta("سياسة الاسترجاع", "سياسة إرجاع واستبدال فساتين نادين خلال 7 أيام من الاستلام.");
  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6">
        <nav className="flex items-center gap-2 text-xs text-fg/40 mb-8">
          <Link to="/" className="hover:text-ring transition-colors">الرئيسية</Link>
          <ChevronLeft size={12} />
          <span className="text-fg font-medium">سياسة الإرجاع والاستبدال</span>
        </nav>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-fg mb-4">سياسة الإرجاع <span className="text-accent-brand">والاستبدال</span></h1>
        <p className="text-sm text-fg/50 mb-10 leading-relaxed">رضاؤكِ هو أولويتنا — تعرفي على سياسة الإرجاع والاستبدال الخاصة بنا.</p>

        <div className="glass-card p-6 rounded-2xl mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 flex items-center justify-center">
              <RotateCcw className="text-accent-brand" size={18} strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-lg font-bold text-fg">سياسة الإرجاع</h2>
          </div>
          <p className="text-xs text-fg/50 leading-relaxed mb-4">يمكنكِ إرجاع المنتج خلال ٧ أيام من تاريخ الاستلام بشرط أن يكون بحالته الأصلية. سنقوم باسترداد المبلغ كاملاً خلال ٣-٥ أيام عمل من استلام المنتج المراد إرجاعه.</p>
        </div>

        <div className="glass-card p-6 rounded-2xl mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/10 flex items-center justify-center">
              <Clock className="text-accent-brand" size={18} strokeWidth={1.5} />
            </div>
            <h2 className="font-display text-lg font-bold text-fg">مدة الاسترداد</h2>
          </div>
          <p className="text-xs text-fg/50 leading-relaxed">يتم رد المبلغ نقداً خلال ٣-٥ أيام عمل من تاريخ استلام المنتج المُرجَع.</p>
        </div>

        <div className="glass-card p-6 rounded-2xl mb-8">
          <h2 className="font-display text-lg font-bold text-fg mb-4">شروط الإرجاع</h2>
          <div className="space-y-3">
            {conditions.map((c, i) => (
              <div key={i} className="flex items-start gap-3">
                <c.icon size={16} className={`flex-shrink-0 mt-0.5 ${c.type === "success" ? "text-green-500" : "text-red-400"}`} />
                <span className="text-xs text-fg/50 leading-relaxed">{c.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <h2 className="font-display text-lg font-bold text-fg mb-4">كيفية الإرجاع</h2>
          <div className="space-y-3 text-xs text-fg/50 leading-relaxed">
            <p>١. تواصلي معنا عبر الواتساب وแจفي رقم الطلب وسبب الإرجاع.</p>
            <p>٢. سنقوم بإرسال عنوان الإرجاع وتفاصيل الشحن.</p>
            <p>٣. ارسلي المنتج في غلافه الأصلي مع الفاتورة إن وجدت.</p>
            <p>٤. بمجرد استلام المنتج والتحقق من حالته، سيتم رد المبلغ خلال ٣-٥ أيام عمل.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
