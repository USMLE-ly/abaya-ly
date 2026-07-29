import { Link } from "react-router-dom";
import { Package, ArrowRight } from "lucide-react";
import { ACard, AButton, AEmpty } from "../components/ui";

export default function Products() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1
          className="text-[26px] sm:text-[30px] font-extrabold leading-tight"
          style={{ color: "var(--ad-text)", letterSpacing: "-0.025em" }}
        >
          المنتجات
        </h1>
        <p className="text-[14px] mt-1" style={{ color: "var(--ad-text-3)" }}>
          إدارة كتالوج المنتجات
        </p>
      </div>

      <ACard className="p-8">
        <AEmpty
          icon={<Package size={34} />}
          title="قريباً"
          hint="صفحة إدارة المنتجات قيد التطوير"
        />
      </ACard>
    </div>
  );
}
