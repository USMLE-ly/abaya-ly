import { lazy, Suspense, useRef, useState } from "react";
import { Download, FileText, Loader2, Maximize2, ShieldCheck } from "lucide-react";
import { downloadCertificatePdf, downloadCertificatePng } from "@/lib/certificateExport";
import { OrderCertificate, type CertificateData } from "./OrderCertificate";
import { IVORY } from "./tokens";

/** The certificate modal is heavy — open it only when requested. */
const OrderCertificateModal = lazy(() =>
  import("./OrderCertificate").then((m) => ({
    default: m.OrderCertificateModal,
  }))
);

/**
 * Certificate preview on the order tracking page: renders the real certificate
 * surface (same store seal + outfit seal layout) inside a scrollable frame so
 * customers can view the generated certificate before downloading it as
 * PDF/PNG or opening it full-screen.
 */
export function CertificatePreview({ data }: { data: CertificateData }) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState<"png" | "pdf" | null>(null);
  const [status, setStatus] = useState("");
  const [fullscreen, setFullscreen] = useState(false);

  const fileName = `nadine-certificate-${data.orderId}`;

  const handlePdf = async () => {
    if (!ref.current) return;
    setBusy("pdf");
    setStatus("");
    try {
      await downloadCertificatePdf(ref.current, `${fileName}.pdf`);
    } catch {
      setStatus("تعذّر تحميل نسخة PDF — جربي تحميل الصورة");
    } finally {
      setBusy(null);
    }
  };

  const handlePng = async () => {
    if (!ref.current) return;
    setBusy("png");
    setStatus("");
    try {
      await downloadCertificatePng(ref.current, `${fileName}.png`);
    } catch {
      setStatus("تعذّر تحميل الشهادة — حاولي مرة أخرى");
    } finally {
      setBusy(null);
    }
  };

  return (
    <section aria-label="شهادة الأصالة" className="mt-8">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold" style={{ color: "#22201c" }}>
            <ShieldCheck size={18} style={{ color: "#9c7138" }} />
            شهادة الأصالة
          </h2>
          <p className="mt-0.5 text-xs" style={{ color: "#8c8276" }}>
            معاينة شهادة التوثيق الخاصة بطلبكِ — جاهزة للتحميل أو المشاركة.
          </p>
        </div>
        <button
          onClick={() => setFullscreen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors"
          style={{ borderColor: "rgba(201,162,94,0.5)", color: "#9c7138" }}
        >
          <Maximize2 size={14} />
          عرض أكبر
        </button>
      </div>

      {/* Preview frame — the actual certificate surface, scrollable, non-interactive */}
      <div
        className="max-h-[540px] overflow-y-auto rounded-2xl border shadow-sm"
        style={{ borderColor: "rgba(201,162,94,0.35)", background: IVORY }}
      >
        <div ref={ref} className="pointer-events-none select-none">
          <OrderCertificate data={data} />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={handlePdf}
          disabled={busy !== null}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
          style={{ background: "linear-gradient(135deg, #e63d6a, #c42855)" }}
        >
          {busy === "pdf" ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          {busy === "pdf" ? "جارٍ التجهيز…" : "تحميل PDF"}
        </button>
        <button
          onClick={handlePng}
          disabled={busy !== null}
          className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border text-sm font-bold transition-all disabled:opacity-60"
          style={{ borderColor: "rgba(201,162,94,0.5)", color: "#9c7138" }}
        >
          {busy === "png" ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {busy === "png" ? "جارٍ التحضير…" : "تحميل الصورة"}
        </button>
      </div>
      {status && (
        <p className="mt-3 text-center text-xs" style={{ color: "#8c8276" }}>
          {status}
        </p>
      )}

      <Suspense fallback={null}>
        <OrderCertificateModal
          open={fullscreen}
          onClose={() => setFullscreen(false)}
          data={data}
        />
      </Suspense>
    </section>
  );
}
