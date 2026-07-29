import { Settings as SettingsIcon } from "lucide-react";
import { ACard, AEmpty } from "../components/ui";

export default function Settings() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1
          className="text-[26px] sm:text-[30px] font-extrabold leading-tight"
          style={{ color: "var(--ad-text)", letterSpacing: "-0.025em" }}
        >
          الإعدادات
        </h1>
        <p className="text-[14px] mt-1" style={{ color: "var(--ad-text-3)" }}>
          إعدادات لوحة التحكم
        </p>
      </div>

      <ACard className="p-8">
        <AEmpty
          icon={<SettingsIcon size={34} />}
          title="قريباً"
          hint="صفحة الإعدادات قيد التطوير"
        />
      </ACard>
    </div>
  );
}
