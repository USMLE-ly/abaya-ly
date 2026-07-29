import { BarChart3 } from "lucide-react";
import { ACard, AEmpty } from "../components/ui";

export default function Analytics() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1
          className="text-[26px] sm:text-[30px] font-extrabold leading-tight"
          style={{ color: "var(--ad-text)", letterSpacing: "-0.025em" }}
        >
          التحليلات
        </h1>
        <p className="text-[14px] mt-1" style={{ color: "var(--ad-text-3)" }}>
          إحصائيات وتحليلات المتجر
        </p>
      </div>

      <ACard className="p-8">
        <AEmpty
          icon={<BarChart3 size={34} />}
          title="قريباً"
          hint="لوحة التحليلات قيد التطوير"
        />
      </ACard>
    </div>
  );
}
