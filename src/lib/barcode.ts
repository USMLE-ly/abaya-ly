/**
 * Deterministic certificate barcodes.
 *
 * Every authenticated piece derives its own unique, reproducible barcode from
 * real order data — order reference, product SKU, piece number and issue date.
 * Values are derived at render time only (never persisted) and always
 * regenerate identically for the same order.
 */

export interface PieceBarcodeInput {
  orderId: string;
  /** Product SKU, e.g. "LM26-01". */
  sku?: string;
  /** 1-based piece number within the order. */
  pieceIndex: number;
  /** Issue date — ISO string, Arabic locale date, or any string with a YYYY-MM-DD. */
  date?: string;
}

const clean = (value: unknown, fallback: string, max: number): string =>
  String(value ?? "")
    .replace(/[^\w-]/g, "")
    .toUpperCase()
    .slice(0, max) || fallback;

/** Barcode value — NAD-{order}-{sku}-P{n}-{YYYYMMDD}. */
export function pieceBarcode({ orderId, sku, pieceIndex, date }: PieceBarcodeInput): string {
  const orderSuffix = clean(String(orderId ?? "").replace(/^NAD[-_]?/i, ""), "000000", 8);
  const skuPart = clean(sku, "NA", 8);

  const iso = /\d{4}-\d{2}-\d{2}/.exec(date ?? "")?.[0];
  let ymd: string;
  if (iso) {
    const [y, m, d] = iso.split("-").map(Number);
    ymd = `${y}${String(m).padStart(2, "0")}${String(d).padStart(2, "0")}`;
  } else {
    const n = new Date();
    ymd = `${n.getFullYear()}${String(n.getMonth() + 1).padStart(2, "0")}${String(n.getDate()).padStart(2, "0")}`;
  }
  return `NAD-${orderSuffix}-${skuPart}-P${pieceIndex}-${ymd}`;
}

/** Stable 32-bit hash — the same string always yields the same seed. */
export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) - hash + value.charCodeAt(i)) | 0;
  }
  return hash >>> 0;
}

/** Deterministic PRNG (mulberry32) from a seed — same seed, same sequence. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
