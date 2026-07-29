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
} from "lucide-react";
import { fetchSettings, saveSettings } from "../lib/api";
import { ACard, AButton, AInput, ASkeleton, AEmpty } from "../components/ui";

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
  const [settings, setSettings] = useState<StoreSettings>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

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
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[26px] sm:text-[30px] font-extrabold leading-tight" style={{ color: "var(--nd-text)" }}>
            الإعدادات
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "var(--nd-text-3)" }}>
            إعدادات المتجر ومعلومات الاتصال
          </p>
        </div>
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
      </div>

      {error && (
        <div className="p-3 rounded-xl text-[13px] font-bold" style={{ background: "rgba(239,68,68,0.1)", color: "#dc2626" }}>
          {error}
        </div>
      )}

      {/* Store Info */}
      <ACard className="p-5 sm:p-6">
        <h3 className="text-[15px] font-extrabold mb-4 flex items-center gap-2" style={{ color: "var(--nd-text)" }}>
          <Store size={16} /> معلومات المتجر
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {input("اسم المتجر", "storeName", <Store size={14} />)}
          {input("العملة", "currency", <Globe size={14} />, { placeholder: "د.ل" })}
        </div>
      </ACard>

      {/* Contact */}
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

      {/* Shipping */}
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

      {/* Social */}
      <ACard className="p-5 sm:p-6">
        <h3 className="text-[15px] font-extrabold mb-4" style={{ color: "var(--nd-text)" }}>
          وسائل التواصل الاجتماعي
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {input("انستغرام", "socialInstagram")}
          {input("فيسبوك", "socialFacebook")}
        </div>
      </ACard>
    </div>
  );
}
