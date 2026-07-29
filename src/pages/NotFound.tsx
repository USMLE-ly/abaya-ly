import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <h1 className="font-display text-7xl md:text-9xl font-bold text-accent-brand mb-4">404</h1>
      <p className="text-lg md:text-xl font-semibold text-fg mb-2">الصفحة غير موجودة</p>
      <p className="text-sm text-fg-tertiary mb-8 max-w-md">
        عذراً، الصفحة التي تبحثين عنها غير موجودة أو تم نقلها.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-fg-inverse transition-all duration-300 hover:scale-105"
        style={{ backgroundColor: "#c42855" }}
      >
        العودة إلى الرئيسية
      </Link>
    </div>
  );
}
