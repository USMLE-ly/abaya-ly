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
  Tag,
  Trash2,
  Plus,
} from "lucide-react";
import { fetchSettings, saveSettings } from "../lib/api";
import { ACard, AButton, AInput, ASelect, ASkeleton } from "../components/ui";

type Tab = "general" | "notifications" | "account" | "security" | "coupons";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "general", label: "عام", icon: Store },
  { id: "notifications", label: "الإشعارات", icon: Bell },
  { id: "account", label: "الحساب", icon: User },
  { id: "security", label: "الأمان", icon: Shield },
  { id: "coupons", label: "أكواد الخصم", icon: Tag },
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
  storePhone: "+218920060299",
  whatsapp: "+218920060299",
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

  // Account tab (persisted via the settings API)
  const [adminEmail, setAdminEmail] = useState("");
  const [adminName, setAdminName] = useState("");
  const [accountMsg, setAccountMsg] = useState("");
  const [accountSaving, setAccountSaving] = useState(false);

  // Notifications tab (persisted via the settings API)
  const [notifMsg, setNotifMsg] = useState("");
  const [notifSaving, setNotifSaving] = useState(false);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [newCouponCode, setNewCouponCode] = useState("");
  const [newCouponType, setNewCouponType] = useState<"percent" | "fixed">("percent");
  const [newCouponValue, setNewCouponValue] = useState("");
  const [newCouponLabel, setNewCouponLabel] = useState("");
  const [couponMsg, setCouponMsg] = useState("");

  // Notifications tab
  const [emailNotif, setEmailNotif] = useState(true);
  const [telegramNotif, setTelegramNotif] = useState(true);
  const [whatsappNotif, setWhatsappNotif] = useState(false);

  useEffect(() => {
    fetchSettings()
      .then((s) => {
        if (s && Object.keys(s).length > 0) {
          setSettings({ ...DEFAULTS, ...s });
          setAdminName(s.adminName || "");
          setAdminEmail(s.adminEmail || "");
          setEmailNotif(s.notifications?.email ?? true);
          setTelegramNotif(s.notifications?.telegram ?? true);
          setWhatsappNotif(s.notifications?.whatsapp ?? false);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Load coupons
  useEffect(() => {
    const pw = sessionStorage.getItem("nadine_admin_pw") || "";
    fetch("/api/coupons", { headers: { "x-admin-password": pw } })
      .then((r) => r.json())
      .then((d) => setCoupons(d.coupons || []))
      .catch(() => {});
  }, []);

  const handleCreateCoupon = async () => {
    if (!newCouponCode.trim() || !Number(newCouponValue)) return;
    try {
      const pw = sessionStorage.getItem("nadine_admin_pw") || "";
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": pw },
        body: JSON.stringify({
          code: newCouponCode.trim(),
          type: newCouponType,
          value: Number(newCouponValue),
          label: newCouponLabel.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "فشل الإنشاء");
      setCoupons((prev) => [...prev, data.coupon]);
      setNewCouponCode(""); setNewCouponValue(""); setNewCouponLabel("");
      setCouponMsg("تم إنشاء الكود بنجاح");
      setTimeout(() => setCouponMsg(""), 3000);
    } catch (err: any) {
      setCouponMsg(err.message || "فشل الإنشاء");
    }
  };

  const handleDeleteCoupon = async (code: string) => {
    try {
      const pw = sessionStorage.getItem("nadine_admin_pw") || "";
      const res = await fetch("/api/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-password": pw },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) throw new Error("فشل الحذف");
      setCoupons((prev) => prev.filter((c) => c.code !== code));
    } catch { /* ignore */ }
  };

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

  const handleSaveAccount = async () => {
    setAccountSaving(true);
    setAccountMsg("");
    try {
      await saveSettings({ ...settings, adminName: adminName.trim(), adminEmail: adminEmail.trim() });
      setAccountMsg("تم حفظ الملف الشخصي");
      setTimeout(() => setAccountMsg(""), 3000);
    } catch {
      setAccountMsg("فشل حفظ الملف الشخصي");
    } finally {
      setAccountSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setNotifSaving(true);
    setNotifMsg("");
    try {
      await saveSettings({
        ...settings,
        notifications: { email: emailNotif, telegram: telegramNotif, whatsapp: whatsappNotif },
      });
      setNotifMsg("تم حفظ إعدادات الإشعارات");
      setTimeout(() => setNotifMsg(""), 3000);
    } catch {
      setNotifMsg("فشل حفظ الإعدادات");
    } finally {
      setNotifSaving(false);
    }
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
              {input("رقم واتساب", "whatsapp", <MessageCircle size={14} />, { dir: "ltr", placeholder: "+218920060299" })}
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
          {notifMsg && (
            <div className="mt-4 text-[12px] font-bold flex items-center gap-1" style={{ color: notifMsg.includes("فشل") ? "#dc2626" : "#16a34a" }}>
              <CheckCircle2 size={14} /> {notifMsg}
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <AButton
              variant="solid"
              size="md"
              icon={notifSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              onClick={handleSaveNotifications}
              disabled={notifSaving}
            >
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
          {accountMsg && (
            <div className="mt-4 text-[12px] font-bold flex items-center gap-1" style={{ color: accountMsg.includes("فشل") ? "#dc2626" : "#16a34a" }}>
              <CheckCircle2 size={14} /> {accountMsg}
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <AButton
              variant="solid"
              size="md"
              icon={accountSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              onClick={handleSaveAccount}
              disabled={accountSaving}
            >
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
              <Shield size={16} /> حماية الوصول
            </h3>
            <div className="space-y-3 text-[13px]" style={{ color: "var(--nd-text-3)" }}>
              <p>🔒 يتم التحقق من كل طلب ببيانات اعتماد المسؤول (متغير <span dir="ltr">ADMIN_PASSWORD</span>) قبل الوصول إلى أي واجهة إدارية.</p>
              <p>🛡️ جميع واجهات <span dir="ltr">/api/admin/*</span> و <span dir="ltr">/api/update-status</span> ترفض الطلبات بدون كلمة المرور الصحيحة.</p>
              <p>⏱️ جلسة العمل تنتهي عند إغلاق المتصفح (تُحفظ في <span dir="ltr">sessionStorage</span>).</p>
            </div>
          </ACard>
        </div>
      )}

      {/* ── COUPONS TAB ── */}
      {tab === "coupons" && (
        <div className="flex flex-col gap-5">
          <ACard className="p-5 sm:p-6">
            <h3 className="text-[15px] font-extrabold mb-4 flex items-center gap-2" style={{ color: "var(--nd-text)" }}>
              <Tag size={16} /> إنشاء كود خصم جديد
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[12px] font-bold mb-1.5" style={{ color: "var(--nd-text-4)" }}>الكود</p>
                <AInput value={newCouponCode} onChange={(e: any) => setNewCouponCode(e.target.value)} placeholder="NADINE10" style={{ direction: "ltr" } as any} />
              </div>
              <div>
                <p className="text-[12px] font-bold mb-1.5" style={{ color: "var(--nd-text-4)" }}>النوع</p>
                <ASelect value={newCouponType} onChange={(e: any) => setNewCouponType(e.target.value)}>
                  <option value="percent">نسبة %</option>
                  <option value="fixed">مبلغ ثابت</option>
                </ASelect>
              </div>
              <div>
                <p className="text-[12px] font-bold mb-1.5" style={{ color: "var(--nd-text-4)" }}>القيمة</p>
                <AInput type="number" value={newCouponValue} onChange={(e: any) => setNewCouponValue(e.target.value)} placeholder={newCouponType === "percent" ? "10" : "50"} style={{ direction: "ltr" } as any} />
              </div>
              <div>
                <p className="text-[12px] font-bold mb-1.5" style={{ color: "var(--nd-text-4)" }}>الوصف (اختياري)</p>
                <AInput value={newCouponLabel} onChange={(e: any) => setNewCouponLabel(e.target.value)} placeholder="خصم 10% على جميع الفساتين" />
              </div>
            </div>
            {couponMsg && <p className="text-[12px] mt-3 font-bold" style={{ color: couponMsg.includes("فشل") ? "#dc2626" : "#16a34a" }}>{couponMsg}</p>}
            <div className="mt-4 flex justify-end">
              <AButton variant="solid" size="md" icon={<Plus size={15} />} onClick={handleCreateCoupon}>
                إنشاء الكود
              </AButton>
            </div>
          </ACard>

          <ACard className="p-5 sm:p-6">
            <h3 className="text-[15px] font-extrabold mb-4 flex items-center gap-2" style={{ color: "var(--nd-text)" }}>
              <Tag size={16} /> الأكواد الحالية ({coupons.length})
            </h3>
            {coupons.length === 0 ? (
              <p className="text-[13px]" style={{ color: "var(--nd-text-3)" }}>لا توجد أكواد خصم بعد — أنشئ أول كود من الأعلى</p>
            ) : (
              <div className="space-y-2">
                {coupons.map((c) => (
                  <div key={c.code} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--nd-bg)" }}>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold font-mono" style={{ color: "var(--nd-primary-500)", direction: "ltr" }}>{c.code}</span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--nd-primary-100)", color: "var(--nd-primary-600)" }}>
                          {c.type === "percent" ? `${c.value}%` : `${c.value} د.ل`}
                        </span>
                      </div>
                      {c.label && <p className="text-[11px] mt-0.5" style={{ color: "var(--nd-text-3)" }}>{c.label}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]" style={{ color: "var(--nd-text-3)" }}>استخدام: {c.usedCount || 0}{c.maxUses ? `/${c.maxUses}` : ""}</span>
                      <button onClick={() => handleDeleteCoupon(c.code)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors" style={{ color: "#dc2626" }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ACard>
        </div>
      )}
    </div>
  );
}
