import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Download, Crown } from "lucide-react";
import { toPng } from "html-to-image";
import { StoreSeal } from "./StoreSeal";
import { OutfitSeal, type OutfitSealItem } from "./OutfitSeal";

export interface CertificateData {
  orderId: string;
  customerName: string;
  date: string;
  items: OutfitSealItem[];
}

const MAX_SEALS = 4;

/** The printable certificate surface (Tajawal / RTL). */
export function OrderCertificate({ data }: { data: CertificateData }) {
  const shown = data.items.slice(0, MAX_SEALS);
  const extra = data.items.length - shown.length;

  return (
    <div
      dir="rtl"
      className="w-full bg-white p-6 sm:p-8 rounded-2xl border-2 border-dotted"
      style={{ borderColor: "rgba(196,40,85,0.35)", fontFamily: "Tajawal, sans-serif" }}
    >
      <div className="text-center">
        <div
          className="mx-auto w-12 h-12 rounded-full grid place-items-center"
          style={{ background: "rgba(196,40,85,0.08)" }}
        >
          <Crown size={22} style={{ color: "#c42855" }} />
        </div>
        <h2 className="mt-3 text-2xl font-black text-fg">شهادة أصالة</h2>
        <p className="text-[11px] tracking-[0.25em] text-fg-tertiary">NADINE LUXURY</p>
        <div className="mx-auto my-4 h-px w-40" style={{ background: "rgba(196,40,85,0.35)" }} />
      </div>

      <p className="text-center text-xs text-fg-tertiary">تشهد دار نادين بأن</p>
      <p className="text-center text-xl font-bold mt-1" style={{ color: "#c42855" }}>
        {data.customerName || "—"}
      </p>
      <p className="text-center text-xs text-fg-secondary mt-2 leading-relaxed">
        قد اقتنت قطعة أصلية من تشكيلاتنا، مصنوعة بعناية ومسجّلة برقم الطلب أدناه.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-line-subtle p-3 text-center">
          <p className="text-[10px] text-fg-tertiary">رقم الطلب</p>
          <p className="text-sm font-bold text-fg tabular-nums">{data.orderId}</p>
        </div>
        <div className="rounded-xl border border-line-subtle p-3 text-center">
          <p className="text-[10px] text-fg-tertiary">التاريخ</p>
          <p className="text-sm font-bold text-fg">{data.date}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {shown.map((it, i) => (
          <OutfitSeal key={i} item={it} orderId={data.orderId} />
        ))}
        {extra > 0 && (
          <p className="text-center text-[11px] text-fg-tertiary">+{extra} قطعة أخرى ضمن الطلب</p>
        )}
      </div>

      <div className="mt-6 flex items-end justify-between gap-4">
        <div className="text-[10px] text-fg-tertiary leading-relaxed max-w-[45%]">
          هذه الشهادة صادرة إلكترونياً ولا تحتاج إلى توقيع.
        </div>
        <StoreSeal date={data.date} className="!h-36 !w-36 !mx-0" />
      </div>
    </div>
  );
}

/** Full-screen viewer with PNG download. */
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
      const url = await toPng(ref.current, { pixelRatio: 2, backgroundColor: "#ffffff" });
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
      className="fixed inset-0 z-[300] overflow-y-auto p-4 flex items-start justify-center"
      style={{ background: "rgba(17,15,13,0.75)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div className="w-full max-w-lg my-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-white">شهادة الطلب</h3>
          <button onClick={onClose} aria-label="إغلاق" className="text-white/70 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div ref={ref}>
          <OrderCertificate data={data} />
        </div>

        <button
          onClick={download}
          disabled={busy}
          className="mt-4 w-full h-12 inline-flex items-center justify-center gap-2 rounded-xl text-sm font-bold text-white disabled:opacity-60"
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
