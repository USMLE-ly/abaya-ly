import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, Loader2, Store } from "lucide-react";
import { setPassword, verifyPassword } from "../lib/api";
import { ADMIN_PATH } from "../lib/config";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError("");
    try {
      const ok = await verifyPassword(password.trim());
      if (!ok) {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        return;
      }
      setPassword(password.trim());
      navigate(`/${ADMIN_PATH}`, { replace: true });
    } catch {
      setError("تعذّر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #FDF2F5 0%, #fff 50%, #FDF2F5 100%)",
        fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div
          className="rounded-3xl p-8 sm:p-10 shadow-xl"
          style={{
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(206,44,96,0.1)",
          }}
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              style={{ background: "linear-gradient(135deg, #CE2C60, #A81F47)" }}
            >
              <Store size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: "#1A1C1E" }}>نادين</h1>
            <p className="text-sm mt-1" style={{ color: "#6B7280" }}>لوحة الإدارة</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="text-[12px] font-semibold block mb-1.5" style={{ color: "#4B5563" }}>
                البريد الإلكتروني
              </label>
              <div
                className="flex items-center gap-3 h-12 px-4 rounded-xl transition-all focus-within:ring-4"
                style={{
                  background: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  "--tw-ring-color": "rgba(206,44,96,0.15)",
                } as React.CSSProperties}
              >
                <Mail size={16} style={{ color: "#9CA3AF" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nadine.ly"
                  required
                  className="flex-1 bg-transparent outline-none text-[14px]"
                  style={{ color: "#1A1C1E" }}
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-[12px] font-semibold block mb-1.5" style={{ color: "#4B5563" }}>
                كلمة المرور
              </label>
              <div
                className="flex items-center gap-3 h-12 px-4 rounded-xl transition-all focus-within:ring-4"
                style={{
                  background: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  "--tw-ring-color": "rgba(206,44,96,0.15)",
                } as React.CSSProperties}
              >
                <Lock size={16} style={{ color: "#9CA3AF" }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="flex-1 bg-transparent outline-none text-[14px]"
                  style={{ color: "#1A1C1E" }}
                />
              </div>
            </div>

            {error && (
              <p className="text-[13px] font-medium text-center" style={{ color: "#CE2C60" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full h-12 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-pink-200/50"
              style={{
                background: "linear-gradient(135deg, #CE2C60, #A81F47)",
              }}
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> جاري تسجيل الدخول...</>
              ) : (
                "تسجيل الدخول"
              )}
            </button>
          </form>

          <p className="text-[11px] text-center mt-6" style={{ color: "#9CA3AF" }}>
            نادين — بيت الفساتين الفاخرة في ليبيا
          </p>
        </div>
      </motion.div>
    </div>
  );
}
