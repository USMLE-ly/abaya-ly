import { Component, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X, Download } from "lucide-react";
import { toPng } from "html-to-image";
import { Awards } from "@/components/ui/award";
import { CertificateMessage } from "./CertificateMessage";
import { CustomerInformation } from "./CustomerInformation";
import { ProductInformation } from "./ProductInformation";
import { RecognitionZone } from "./RecognitionZone";
import type { OutfitSealItem } from "./OutfitSeal";

export interface CertificateData {
  orderId: string;
  customerName: string;
  date: string;
  items: OutfitSealItem[];
}

const IVORY = "#fdfaf3";
const GOLD = "#c9a25e";

/** The printable luxury certificate surface (Tajawal / RTL, ivory + gold). */
export function OrderCertificate({ data }: { data: CertificateData }) {
  return (
    <div
      dir="rtl"
      className="w-full"
      style={{ background: IVORY, fontFamily: "Tajawal, sans-serif" }}
    >
      {/* Outer gold hairline frame */}
      <div className="p-1.5" style={{ border: "1.5px solid " + GOLD }}>
        {/* Inner dotted gold frame */}
        <div
          className="rounded-sm px-5 py-8 sm:px-10 sm:py-9"
          style={{
            border: "1.5px dashed rgba(201,162,94,0.8)",
            background: "rgba(255,255,255,0.35)",
          }}
        >
          {/* Main certificate — full Awards component, certificate variant (reference anatomy) */}
          <Awards
            variant="certificate"
            title="أصالة"
            recipient={data.customerName.trim() ? data.customerName.trim() : "عميلتنا الغالية"}
            subtitle="تُمنح هذه الشهادة توثيقاً لأصالة القطعة المقتناة من دار نادين للأزياء، والمطابقة لأعلى معايير الحرفية والجودة."
            date={data.date}
            className="border-[#c9a25e]/60"
          />

          <div className="mx-auto mt-8 max-w-md">
            <CertificateMessage customerName={data.customerName} />
          </div>

          <div className="mx-auto mt-7 max-w-md">
            <CustomerInformation
              name={data.customerName}
              orderId={data.orderId}
              date={data.date}
            />
          </div>

          <div className="mx-auto mt-7 max-w-md">
            <ProductInformation items={data.items} />
          </div>

          <RecognitionZone items={data.items} orderId={data.orderId} date={data.date} />
        </div>
      </div>
    </div>
  );
}

/** Keeps the success modal intact if the certificate surface fails to render. */
class CertificateBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed) {
      return (
        <div
          dir="rtl"
          className="w-full rounded-2xl bg-white p-6 text-center text-sm text-fg-tertiary"
          style={{ fontFamily: "Tajawal, sans-serif" }}
        >
          تعذّر عرض الشهادة الآن — ستتمكنين من تنزيلها لاحقاً من صفحة تتبع الطلب.
        </div>
      );
    }
    return this.props.children;
  }
}

/** Full-screen viewer with high-resolution PNG download. */
export function OrderCertificateModal({
  open,
  onClose,
  data,
}: {
  open: boolean;
  onClose: () => void;
  data: CertificateData | null;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  if (!open || !data) return null;

  const download = async () => {
    if (!ref.current) return;
    setBusy(true);
    try {
      const url = await toPng(ref.current, {
        pixelRatio: 3,
        backgroundColor: IVORY,
      });
      const a = document.createElement("a");
      a.href = url;
      a.download = `nadine-certificate-${data.orderId}.png`;
      a.click();
    } catch {
      /* download unavailable — the certificate stays viewable */
    } finally {
      setBusy(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center overflow-y-auto p-4"
      style={{ background: "rgba(17,15,13,0.75)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div className="my-6 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">شهادة الطلب</h3>
          <button onClick={onClose} aria-label="إغلاق" className="text-white/70 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div ref={ref}>
          <CertificateBoundary>
            <OrderCertificate data={data} />
          </CertificateBoundary>
        </div>

        <button
          onClick={download}
          disabled={busy}
          className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-bold text-white disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #e63d6a, #c42855)" }}
        >
          <Download size={16} />
          {busy ? "جارٍ التحضير…" : "تحميل الشهادة"}
        </button>
      </div>
    </div>,
    document.body
  );
}
