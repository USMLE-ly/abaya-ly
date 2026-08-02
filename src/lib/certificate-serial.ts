/** Render-time certificate serial — NAD-{year}-CA-{suffix}. Derived only; never persisted. */
export function certificateSerial(orderId: string, date?: string): string {
  const year =
    (date && /\d{4}/.exec(date)?.[0]) || String(new Date().getFullYear());
  const suffix =
    String(orderId || "")
      .replace(/^NAD[-_]?/i, "")
      .replace(/[^\w-]/g, "")
      .slice(0, 16) || "000000";
  return `NAD-${year}-CA-${suffix}`;
}
