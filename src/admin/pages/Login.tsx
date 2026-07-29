import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Loader2 } from "lucide-react";
import { setPassword, verifyPassword } from "../lib/api";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!pw.trim()) return;
    setLoading(true);
    setError("");
    try {
      const ok = await verifyPassword(pw.trim());
      if (!ok) {
        setError("كلمة المرور غير صحيحة");
        return;
      }
      setPassword(pw.trim());
      navigate("/admin", { replace: true });
    } catch {
      setError("تعذّر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="admin-root grid place-items-center px-5"
      dir="rtl"
      style={{ minHeight: "100vh" }}
    >
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[400px] rounded-[var(--ad-r-xl)] p-8"
        style={{
          background: "var(--ad-surface)",
          border: "1px solid var(--ad-border)",
          boxShadow: "var(--ad-e3)",
        }}
      >
        <div
          className="w-12 h-12 rounded-[14px] grid place-items-center text-white font-extrabold text-lg mb-5"
          style={{ background: "var(--ad-brand)" }}
        >
          N
        </div>
        <h1
          className="text-[26px] font-extrabold leading-tight"
          style={{ color: "var(--ad-text)", letterSpacing: "-0.02em" }}
        >
          لوحة إدارة Nadine
        </h1>
        <p className="text-[14px] mt-1.5 mb-7" style={{ color: "var(--ad-text-3)" }}>
          أدخلي كلمة المرور للمتابعة
        </p>

        <div
          className="flex items-center gap-2.5 h-12 px-4 rounded-[var(--ad-r-md)] focus-within:ring-4"
          style={{
            background: "var(--ad-surface-2)",
            border: `1px solid ${error ? "#EF4444" : "var(--ad-border-2)"}`,
            // @ts-expect-error css var
            "--tw-ring-color": "var(--ad-brand-ring)",
          }}
        >
          <Lock size={17} style={{ color: "var(--ad-text-4)" }} />
          <input
            type="password"
            autoFocus
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="كلمة المرور"
            className="flex-1 min-w-0 bg-transparent outline-none text-[15px]"
            style={{ color: "var(--ad-text)" }}
          />
        </div>
        {error && (
          <p className="text-[13px] mt-2" style={{ color: "#EF4444" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 mt-6 rounded-[var(--ad-r-md)] text-white text-[15px] font-extrabold inline-flex items-center justify-center gap-2 disabled:opacity-60 transition-all active:scale-[0.99]"
          style={{ background: "var(--ad-brand)" }}
        >
          {loading && <Loader2 size={18} className="animate-spin" />}
          دخول
        </button>
      </motion.form>
    </div>
  );
}
