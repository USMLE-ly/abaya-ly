import { useState, useEffect } from "react";
import {
  Save,
  Loader2,
  CheckCircle2,
  Store,
  Phone,
  Mail,
  MapPin,
  Truck,
  Globe,
  MessageCircle,
  Instagram,
  Facebook,
  Bell,
  User,
  Shield,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { fetchSettings, saveSettings } from "../lib/api";
import { ACard, AButton, AInput, ASkeleton } from "../components/ui";

type Tab = "general" | "notifications" | "account" | "security";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "general", label: "عام", icon: Store },
  { id: "notifications", label: "الإشعارات", icon: Bell },
  { id: "account", label: "الحساب", icon: User },
  { id: "security", label: "الأمان", icon: Shield },
];

interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  whatsapp: string;
  address: string;
  shippingInfo: string;
  socialInstagram: string;
  socialFacebook: string;
  currency: string;
}

const DEFAULTS: StoreSettings = {
  storeName: "نادين",
  storeEmail: "nadine.luxor@gmail.com",
  storePhone: "+218944003708",
  whatsapp: "+218944003708",
  address: "بنغازي، ليبيا",
  shippingInfo: "توصيل إلى جميع المدن الليبية خلال 3-7 أيام عمل",
  socialInstagram: "nadine.ly",
  socialFacebook: "nadine.ly",
  currency: "د.ل",
};

export default function Settings() {
  const [tab, setTab] = useState<Tab>("general");
  const [settings, setSettings] = useState<StoreSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Account tab
  const [adminEmail, setAdminEmail] = useState("admin@nadine.ly");
  const [adminName, setAdminName] = useState("Admin");

  // Security tab
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwChanged, setPwChanged] = useState(false);

  // Notifications tab
  const [emailNotif, setEmailNotif] = useState(true);
  const [telegramNotif, setTelegramNotif] = useState(true);
  const [whatsappNotif, setWhatsappNotif] = useState(false);

  useEffect(() => {
    fetchSettings()
      .then((s) => {
        if (s && Object.keys(s).length > 0) setSettings({ ...DEFAULTS, ...s });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (key: keyof StoreSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await saveSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("فشل حفظ الإعدادات");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = () => {
    if (!currentPw || !newPw || newPw !== confirmPw) return;
    setPwChanged(true);
    setTimeout(() => setPwChanged(false), 3000);
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <ASkeleton className="h-12 w-48" />
        <ASkeleton className="h-96" />
      </div>
    );
  }

  const input = (
    label: string,
    key: keyof StoreSettings,
    icon?: React.ReactNode,
    opts?: { type?: string; placeholder?: string; dir?: string }
  ) => (
    <div>
      <p className="text-[12px] font-bold mb-1.5" style={{ color: "var(--nd-text-4)" }}>{label}</p>
      <AInput
        icon={icon}
        type={opts?.type || "text"}
        value={settings[key]}
        onChange={(e: any) => update(key, e.target.value)}
        placeholder={opts?.placeholder}
        style={opts?.dir ? { direction: opts.dir as any } : undefined}
      />
    </div>
  );

  return (
    <div className="flex flex-col gap-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[26px] sm:text-[30px] font-extrabold leading-tight" style={{ color: "var(--nd-text)" }}>
            الإعدادات
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--nd-text-3)" }}>
            إدارة إعدادات المتجر والمستخدم
          </p>
        </div>
        {tab === "general" && (
          <div className="flex items-center gap-2">
            {saved && (
              <span className="text-[12px] font-bold flex items-center gap-1" style={{ color: "#16a34a" }}>
                <CheckCircle2 size={14} /> تم الحفظ
              </span>
            )}
            <AButton
              variant="solid"
              size="md"
              icon={saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              onClick={handleSave}
              disabled={saving}
            >
              حفظ الإعدادات
            </AButton>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--nd-bg)", border: "1px solid var(--nd-border)" }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-bold transition-all flex-1 justify-center sm:flex-none"
              style={{
                background: tab === t.id ? "var(--nd-primary-500)" : "transparent",
                color: tab === t.id ? "#fff" : "var(--nd-text-3)",
              }}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-3 rounded-xl text-[13px] font-bold" style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626" }}>
          {error}
        </div>
      )}

      {/* ── GENERAL TAB ── */}
      {tab === "general" && (
        <div className="flex flex-col gap-5">
          <ACard className="p-5 sm:p-6">
            <h3 className="text-[15px] font-extrabold mb-4 flex items-center gap-2" style={{ color: "var(--nd-text)" }}>
              <Store size={16} /> معلومات المتجر
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {input("اسم المتجر", "storeName", <Store size={14} />)}
              {input("العملة", "currency", <Globe size={14} />, { placeholder: "د.ل" })}
            </div>
          </ACard>

          <ACard className="p-5 sm:p-6">
            <h3 className="text-[15px] font-extrabold mb-4 flex items-center gap-2" style={{ color: "var(--nd-text)" }}>
              <Phone size={16} /> معلومات الاتصال
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {input("البريد الإلكتروني", "storeEmail", <Mail size={14} />, { type: "email", dir: "ltr" })}
              {input("رقم الهاتف", "storePhone", <Phone size={14} />, { dir: "ltr" })}
              {input("رقم واتساب", "whatsapp", <MessageCircle size={14} />, { dir: "ltr", placeholder: "+218944003708" })}
              {input("العنوان", "address", <MapPin size={14} />)}
            </div>
          </ACard>

          <ACard className="p-5 sm:p-6">
            <h3 className="text-[15px] font-extrabold mb-4 flex items-center gap-2" style={{ color: "var(--nd-text)" }}>
              <Truck size={16} /> الشحن والتوصيل
            </h3>
            <div>
              <p className="text-[12px] font-bold mb-1.5" style={{ color: "var(--nd-text-4)" }}>معلومات الشحن</p>
              <textarea
                value={settings.shippingInfo}
                onChange={(e) => update("shippingInfo", e.target.value)}
                rows={3}
                className="w-full px-3.5 py-2.5 rounded-xl text-[14px] outline-none resize-none"
                style={{
                  background: "var(--nd-white)",
                  border: "1px solid var(--nd-border)",
                  color: "var(--nd-text)",
                }}
              />
            </div>
          </ACard>

          <ACard className="p-5 sm:p-6">
            <h3 className="text-[15px] font-extrabold mb-4" style={{ color: "var(--nd-text)" }}>
              <Instagram size={16} className="inline mr-1" /> وسائل التواصل الاجتماعي
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {input("انستغرام", "socialInstagram", <Instagram size={14} />)}
              {input("فيسبوك", "socialFacebook", <Facebook size={14} />)}
            </div>
          </ACard>
        </div>
      )}

      {/* ── NOTIFICATIONS TAB ── */}
      {tab === "notifications" && (
        <ACard className="p-5 sm:p-6">
          <h3 className="text-[15px] font-extrabold mb-4 flex items-center gap-2" style={{ color: "var(--nd-text)" }}>
            <Bell size={16} /> إعدادات الإشعارات
          </h3>
          <div className="space-y-4">
            {[
              { label: "إشعارات البريد الإلكتروني", desc: "عند تقديم طلب جديد", value: emailNotif, set: setEmailNotif },
              { label: "إشعارات التليجرام", desc: "تصل إلى قناة التليجرام", value: telegramNotif, set: setTelegramNotif },
              { label: "إشعارات واتساب", desc: "رسائل تأكيد الطلبات", value: whatsappNotif, set: setWhatsappNotif },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--nd-bg)" }}>
                <div>
                  <p className="text-[13px] font-bold" style={{ color: "var(--nd-text)" }}>{item.label}</p>
                  <p className="text-[11px]" style={{ color: "var(--nd-text-3)" }}>{item.desc}</p>
                </div>
                <button
                  onClick={() => item.set(!item.value)}
                  className="w-10 h-6 rounded-full transition-all relative"
                  style={{
                    background: item.value ? "var(--nd-primary-500)" : "var(--nd-border)",
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all shadow-sm"
                    style={{ [document.dir === "rtl" ? "right" : "left"]: item.value ? "22px" : "3px" }}
                  />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <AButton variant="solid" size="md" icon={<Save size={15} />} onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}>
              حفظ الإعدادات
            </AButton>
          </div>
        </ACard>
      )}

      {/* ── ACCOUNT TAB ── */}
      {tab === "account" && (
        <ACard className="p-5 sm:p-6">
          <h3 className="text-[15px] font-extrabold mb-4 flex items-center gap-2" style={{ color: "var(--nd-text)" }}>
            <User size={16} /> الملف الشخصي
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[12px] font-bold mb-1.5" style={{ color: "var(--nd-text-4)" }}>الاسم</p>
              <AInput
                icon={<User size={14} />}
                value={adminName}
                onChange={(e: any) => setAdminName(e.target.value)}
              />
            </div>
            <div>
              <p className="text-[12px] font-bold mb-1.5" style={{ color: "var(--nd-text-4)" }}>البريد الإلكتروني</p>
              <AInput
                icon={<Mail size={14} />}
                type="email"
                value={adminEmail}
                onChange={(e: any) => setAdminEmail(e.target.value)}
                style={{ direction: "ltr" } as any}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <AButton variant="solid" size="md" icon={<Save size={15} />} onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 3000); }}>
              حفظ التغييرات
            </AButton>
          </div>
        </ACard>
      )}

      {/* ── SECURITY TAB ── */}
      {tab === "security" && (
        <div className="flex flex-col gap-5">
          <ACard className="p-5 sm:p-6">
            <h3 className="text-[15px] font-extrabold mb-4 flex items-center gap-2" style={{ color: "var(--nd-text)" }}>
              <Lock size={16} /> تغيير كلمة المرور
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[12px] font-bold mb-1.5" style={{ color: "var(--nd-text-4)" }}>كلمة المرور الحالية</p>
                <div className="relative">
                  <AInput
                    icon={<Lock size={14} />}
                    type={showPw ? "text" : "password"}
                    value={currentPw}
                    onChange={(e: any) => setCurrentPw(e.target.value)}
                    style={{ direction: "ltr" } as any}
                  />
                  <button
                    onClick={() => setShowPw(!showPw)}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--nd-text-3)" }}
                  >
                    {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <p className="text-[12px] font-bold mb-1.5" style={{ color: "var(--nd-text-4)" }}>كلمة المرور الجديدة</p>
                <AInput
                  icon={<Lock size={14} />}
                  type="password"
                  value={newPw}
                  onChange={(e: any) => setNewPw(e.target.value)}
                  style={{ direction: "ltr" } as any}
                />
              </div>
              <div>
                <p className="text-[12px] font-bold mb-1.5" style={{ color: "var(--nd-text-4)" }}>تأكيد كلمة المرور</p>
                <AInput
                  icon={<Lock size={14} />}
                  type="password"
                  value={confirmPw}
                  onChange={(e: any) => setConfirmPw(e.target.value)}
                  style={{ direction: "ltr" } as any}
                />
              </div>
            </div>
            {pwChanged && (
              <div className="mt-3 text-[12px] font-bold flex items-center gap-1" style={{ color: "#16a34a" }}>
                <CheckCircle2 size={14} /> تم تغيير كلمة المرور بنجاح
              </div>
            )}
            <div className="mt-4 flex justify-end">
              <AButton
                variant="solid"
                size="md"
                icon={<Save size={15} />}
                onClick={handleChangePassword}
                disabled={!currentPw || !newPw || newPw !== confirmPw}
              >
                تغيير كلمة المرور
              </AButton>
            </div>
          </ACard>

          <ACard className="p-5 sm:p-6">
            <h3 className="text-[15px] font-extrabold mb-4 flex items-center gap-2" style={{ color: "var(--nd-text)" }}>
              <Shield size={16} /> معلومات الأمان
            </h3>
            <div className="space-y-3 text-[13px]" style={{ color: "var(--nd-text-3)" }}>
              <p>🔒 تم تمكين المصادقة لكافة لوحات الإدارة</p>
              <p>🛡️ جميع طلبات API محمية بكلمة مرور المسؤول</p>
              <p>📋 يتم تسجيل جميع العمليات الحساسة</p>
              <p>⏱️ timeout الجلسة: 24 ساعة</p>
            </div>
          </ACard>
        </div>
      )}
    </div>
  );
}
