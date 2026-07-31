import { useEffect, useState } from "react";
export interface TicketGeom {
  /** full width of the ticket in its base coordinate system */
  w: number;
  /** full height */
  h: number;
  /** outer corner radius */
  corner: number;
  /** semicircle notch radius on the divider */
  notch: number;
  /** divider x position in the original (LTR) geometry */
  dividerX: number;
}

/**
 * Continuous ticket outline — wide main body + narrow stub separated by
 * semicircle notches punched into the top/bottom edges on the divider.
 * Mirrors the geometry for RTL (stub on the left) like the reference.
 */
export function ticketPath(g: TicketGeom, rtl: boolean): string {
  const { w, h, corner, notch, dividerX } = g;
  if (!rtl) {
    const n1 = dividerX - notch;
    const n2 = dividerX + notch;
    return [
      `M ${corner} 0`,
      `L ${n1} 0`,
      `A ${notch} ${notch} 0 0 0 ${n2} 0`,
      `L ${w - corner} 0`,
      `A ${corner} ${corner} 0 0 0 ${w} ${corner}`,
      `L ${w} ${h - corner}`,
      `A ${corner} ${corner} 0 0 0 ${w - corner} ${h}`,
      `L ${n2} ${h}`,
      `A ${notch} ${notch} 0 0 0 ${n1} ${h}`,
      `L ${corner} ${h}`,
      `A ${corner} ${corner} 0 0 0 0 ${h - corner}`,
      `L 0 ${corner}`,
      `A ${corner} ${corner} 0 0 0 ${corner} 0`,
      "Z",
    ].join(" ");
  }
  const n1 = w - (dividerX + notch);
  const n2 = w - (dividerX - notch);
  return [
    `M ${w - corner} 0`,
    `L ${n2} 0`,
    `A ${notch} ${notch} 0 0 1 ${n1} 0`,
    `L ${corner} 0`,
    `A ${corner} ${corner} 0 0 1 0 ${corner}`,
    `L 0 ${h - corner}`,
    `A ${corner} ${corner} 0 0 1 ${corner} ${h}`,
    `L ${n1} ${h}`,
    `A ${notch} ${notch} 0 0 1 ${n2} ${h}`,
    `L ${w - corner} ${h}`,
    `A ${corner} ${corner} 0 0 1 ${w} ${h - corner}`,
    `L ${w} ${corner}`,
    `A ${corner} ${corner} 0 0 1 ${w - corner} 0`,
    "Z",
  ].join(" ");
}

export function useIsRTL(): boolean {
  const [rtl, setRtl] = useState(() =>
    typeof document !== "undefined" && document.documentElement.dir === "rtl",
  );
  useEffect(() => {
    const update = () => setRtl(document.documentElement.dir === "rtl");
    update();
    const mo =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(update)
        : null;
    mo?.observe(document.documentElement, { attributes: true, attributeFilter: ["dir"] });
    return () => mo?.disconnect();
  }, []);
  return rtl;
}

/** Scale a fixed-size ticket box so it fits its wrapper without upscaling. */
export function useTicketScale(ref: { current: HTMLElement | null }, baseW: number): number {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const update = () => setScale(Math.min(1, el.clientWidth / baseW));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, baseW]);
  return scale;
}
