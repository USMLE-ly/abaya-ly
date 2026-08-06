import { Component, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X, Download, Share2, FileText } from "lucide-react";
import { downloadCertificatePdf, downloadCertificatePng, shareCertificate } from "@/lib/certificateExport";
import { Awards } from "@/components/ui/award";
import { CustomerInformation } from "./CustomerInformation";
import { ProductInformation } from "./ProductInformation";
import { RecognitionZone } from "./RecognitionZone";
import { AuthenticationZone } from "./AuthenticationZone";
import { CertificateMessage } from "./CertificateMessage";
import { CertificateFooter } from "./CertificateFooter";
import { MonogramWatermark } from "./MonogramWatermark";
import { certificateSerial } from "@/lib/certificate-serial";
import { IVORY } from "./tokens";
import type { OutfitSealItem } from "./OutfitSeal";

export interface CertificateData {
  orderId: string;
  customerName: string;
  date: string;
  items: OutfitSealItem[];
}

/** The printable luxury certificate surface: the original certificate frame with every
 *  section — letter, authentication registry, product passport, recognition zone, footer. */
export function OrderCertificate({ data }: { data: CertificateData }) {
  const serial = certificateSerial(data.orderId, data.date);
  return (
    <div
      dir="rtl"
      className="relative w-full"
      style={{ background: IVORY, fontFamily: "Tajawal, sans-serif" }}
    >
      <MonogramWatermark />
      <Awards
        variant="certificate"
        title="أصالة"
        recipient={data.customerName || "—"}
        className="w-full"
      >
        <div className="space-y-7">
          <CertificateMessage />
          <CustomerInformation
            name={data.customerName}
            orderId={data.orderId}
            date={data.date}
            serial={serial}
          />
          <ProductInformation items={data.items} />
          <AuthenticationZone
            items={data.items}
            orderId={data.orderId}
            serial={serial}
            date={data.date}
          />
          <RecognitionZone items={data.items} orderId={data.orderId} />
          <CertificateFooter serial={serial} />
        </div>
      </Awards>
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

/** Full-screen viewer with high-resolution PNG/PDF download and native share/copy. */
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
  const [busy, setBusy] = useState<"download" | "pdf" | "share" | null>(null);
  const [status, setStatus] = useState("");

  if (!open || !data) return null;

  const fileName = `nadine-certificate-${data.orderId}`;

  const download = async () => {
    if (!ref.current) return;
    setBusy("download");
    setStatus("");
    try {
      await downloadCertificatePng(ref.current, `${fileName}.png`, 4);
    } catch {
      setStatus("تعذّر تنزيل الشهادة — حاولي مرة أخرى");
    } finally {
      setBusy(null);
    }
  };

  const downloadPdf = async () => {
    if (!ref.current) return;
    setBusy("pdf");
    setStatus("");
    try {
      await downloadCertificatePdf(ref.current, `${fileName}.pdf`);
    } catch {
      setStatus("تعذّر تنزيل نسخة PDF — جربي تحميل الصورة");
    } finally {
      setBusy(null);
    }
  };

  const share = async () => {
    if (!ref.current) return;
    setBusy("share");
    setStatus("");
    try {
      const result = await shareCertificate(ref.current, `${fileName}.png`);
      setStatus(
        result === "copied"
          ? "تم نسخ الشهادة — الصقيها أينما تريدين"
          : result === "downloaded"
            ? "تم تنزيل الشهادة — شاركيها مع من تحبين"
            : ""
      );
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) {
        setStatus("تعذّرت المشاركة — جربي التنزيل بدلاً من ذلك");
      }
    } finally {
      setBusy(null);
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

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={downloadPdf}
              disabled={busy !== null}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white disabled:opacity-60"
              style={{ background: "linear-gradient(135deg, #e63d6a, #c42855)" }}
            >
              <FileText size={16} />
              {busy === "pdf" ? "جارٍ التجهيز…" : "تحميل PDF"}
            </button>
            <button
              onClick={download}
              disabled={busy !== null}
              className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/30 text-sm font-bold text-white disabled:opacity-60"
            >
              <Download size={16} />
              {busy === "download" ? "جارٍ التحضير…" : "تحميل الصورة"}
            </button>
          </div>
          <button
            onClick={share}
            disabled={busy !== null}
            className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-white/30 text-sm font-bold text-white disabled:opacity-60"
          >
            <Share2 size={16} />
            {busy === "share" ? "جارٍ التجهيز…" : "مشاركة الشهادة"}
          </button>
        </div>
        {status && (
          <p className="mt-3 text-center text-xs text-white/80">{status}</p>
        )}
      </div>
    </div>,
    document.body
  );
}
