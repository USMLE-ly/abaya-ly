// ─────────────────────────────────────────────────────────────
// Meta (Facebook) Pixel bridge.
// The base snippet lives in index.html; this module only forwards
// events. Every call is guarded so a blocked or failed fbevents.js
// can never throw into React render or break checkout.
// ─────────────────────────────────────────────────────────────

export const PIXEL_IDS = ["760469593227327", "1742209750300193"];
export const PIXEL_ID = PIXEL_IDS[PIXEL_IDS.length - 1];
export const PIXEL_CURRENCY = "LYD";

type Fbq = (...args: unknown[]) => void;

function fbq(): Fbq | null {
  if (typeof window === "undefined") return null;
  const fn = (window as unknown as { fbq?: Fbq }).fbq;
  return typeof fn === "function" ? fn : null;
}

/** Fire a Meta standard event. Never throws. */
export function pixelTrack(event: string, params: Record<string, unknown> = {}) {
  try {
    for (const id of PIXEL_IDS) {
      fbq()?.("track", id, event, { currency: PIXEL_CURRENCY, ...params });
    }
  } catch {
    /* tracking must never break the app */
  }
}

/** Fire a Meta custom event (non-standard names). Never throws. */
export function pixelTrackCustom(event: string, params: Record<string, unknown> = {}) {
  try {
    for (const id of PIXEL_IDS) {
      fbq()?.("trackCustom", id, event, params);
    }
  } catch {
    /* tracking must never break the app */
  }
}

/** Purchase must count once per order, even if the success screen reloads. */
export function pixelTrackOnce(key: string, event: string, params: Record<string, unknown> = {}) {
  const storageKey = `fbq-once-${event}-${key}`;
  try {
    if (sessionStorage.getItem(storageKey)) return;
    sessionStorage.setItem(storageKey, "1");
  } catch {
    /* private mode — fall through and still fire once per page load */
  }
  pixelTrack(event, params);
}
