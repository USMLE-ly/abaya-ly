import { toBlob, toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { IVORY } from "@/components/certificate/tokens";

/**
 * Certificate export pipeline (PNG + PDF).
 *
 * Both paths wait for document.fonts.ready BEFORE measuring/capturing the DOM.
 * html-to-image embeds @font-face into the clone lazily, so capturing while the
 * webfonts (Tajawal / Playfair Display) are still swapping produced shifted
 * layouts in the download. Waiting for the fonts keeps the export pixel-
 * identical to what the customer sees on screen — the store seal (HouseMark),
 * the outfit/recognition seal and every section keep their exact positions.
 */

/** Render the certificate node to a high-resolution PNG data URL. */
export async function renderCertificatePng(
  node: HTMLElement,
  pixelRatio = 2
): Promise<string> {
  await document.fonts.ready;
  return toPng(node, { pixelRatio, backgroundColor: IVORY, cacheBust: true });
}

/** Render the certificate node to a PNG Blob (used for share / clipboard). */
export async function renderCertificateBlob(
  node: HTMLElement,
  pixelRatio = 2
): Promise<Blob> {
  await document.fonts.ready;
  const blob = await toBlob(node, { pixelRatio, backgroundColor: IVORY, cacheBust: true });
  if (!blob) throw new Error("Failed to render certificate blob");
  return blob;
}

function triggerDownload(href: string, fileName: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/** Download the certificate as a PNG image. */
export async function downloadCertificatePng(
  node: HTMLElement,
  fileName: string,
  pixelRatio = 3
): Promise<void> {
  const dataUrl = await renderCertificatePng(node, pixelRatio);
  triggerDownload(dataUrl, fileName);
}

/**
 * Download the certificate as a PDF.
 *
 * The certificate is captured from the SAME DOM node used on screen (so the
 * store seal and outfit seal layout are identical), then paginated onto A4
 * pages with a generous margin — ideal for printing or saving as a keepsake.
 */
export async function downloadCertificatePdf(
  node: HTMLElement,
  fileName: string
): Promise<void> {
  await document.fonts.ready;
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    backgroundColor: IVORY,
    cacheBust: true,
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4", compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 48;
  const contentHeight = pageHeight - margin * 2;

  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const imgWidth = pageWidth - margin * 2;
  const imgHeight = (img.height * imgWidth) / img.width;

  // Paginate the tall certificate onto successive A4 pages without distortion.
  let drawn = 0;
  do {
    pdf.addImage(dataUrl, "PNG", margin, margin - drawn, imgWidth, imgHeight, undefined, "FAST");
    drawn += contentHeight;
    if (drawn < imgHeight) pdf.addPage();
  } while (drawn < imgHeight);

  pdf.save(fileName);
}

/** Share or copy the certificate via the native platform APIs. */
export async function shareCertificate(node: HTMLElement, fileName: string): Promise<"shared" | "copied" | "downloaded"> {
  const blob = await renderCertificateBlob(node, 2);
  const file = new File([blob], fileName, { type: "image/png" });
  const shareNav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };
  if (shareNav.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: "شهادة أصالة نادين",
      text: "شهادة أصالة من دار نادين للأزياء",
    });
    return "shared";
  }
  if ("ClipboardItem" in window && navigator.clipboard?.write) {
    const ClipboardImage = (
      window as unknown as { ClipboardItem: new (items: Record<string, Blob>) => ClipboardItem }
    ).ClipboardItem;
    await navigator.clipboard.write([new ClipboardImage({ "image/png": blob })]);
    return "copied";
  }
  const href = URL.createObjectURL(blob);
  triggerDownload(href, fileName);
  URL.revokeObjectURL(href);
  return "downloaded";
}
