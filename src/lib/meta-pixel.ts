// ─────────────────────────────────────────────────────────────
// Meta (Facebook) Pixel bridge + Conversions API (CAPI) client.
//
// The base snippet lives in index.html. This module:
//   1. fires every event to ALL initialized pixels,
//   2. mirrors the same event server-side via /api/meta/capi with
//      the SAME event_id (so Meta deduplicates browser + server),
//   3. records every event into window.__META_EVENTS__ for QA
//      (debug page at /meta-debug).
//
// Every call is guarded so a blocked or failed fbevents.js can
// never throw into React render or break checkout.
// ─────────────────────────────────────────────────────────────

export const PIXEL_IDS = ["760469593227327", "1742209750300193"];
export const PIXEL_ID = PIXEL_IDS[PIXEL_IDS.length - 1];
export const PIXEL_CURRENCY = "LYD";

export interface MetaDebugEvent {
  ts: string;
  event: string;
  eventId: string;
  source: "pixel" | "capi";
  params: Record<string, unknown>;
}

export interface MetaUserData {
  /** E.164 phone with country code, e.g. 218920060299 (hashed server-side). */
  ph?: string;
  /** Raw email (hashed server-side). */
  em?: string;
  fn?: string;
  ln?: string;
}

const MAX_BUFFER = 200;

declare global {
  interface Window {
    __META_EVENTS__?: MetaDebugEvent[];
  }
}

function debugEnabled(): boolean {
  try {
    if (typeof window === "undefined") return false;
    if (sessionStorage.getItem("meta_debug") === "1") return true;
    return (
      import.meta.env.VITE_META_DEBUG === "1" ||
      new URLSearchParams(window.location.search).has("meta_debug")
    );
  } catch {
    return false;
  }
}

let debugOn = debugEnabled();

/** Turn console + buffer logging on/off (persisted in sessionStorage). */
export function setMetaDebug(on: boolean) {
  debugOn = on;
  try {
    if (on) sessionStorage.setItem("meta_debug", "1");
    else sessionStorage.removeItem("meta_debug");
  } catch {
    /* private mode — the in-memory flag still works */
  }
}

export function isMetaDebug(): boolean {
  return debugOn;
}

export function getMetaDebugEvents(): MetaDebugEvent[] {
  if (typeof window === "undefined") return [];
  return window.__META_EVENTS__ ?? [];
}

function record(event: string, eventId: string, params: Record<string, unknown>, source: "pixel" | "capi") {
  if (typeof window === "undefined") return;
  const entry: MetaDebugEvent = { ts: new Date().toISOString(), event, eventId, source, params };
  try {
    window.__META_EVENTS__ = [...(window.__META_EVENTS__ ?? []), entry].slice(-MAX_BUFFER);
    window.dispatchEvent(new CustomEvent("meta-debug-event"));
  } catch {
    /* ignore */
  }
  if (debugOn) {
    const color = source === "pixel" ? "#1877F2" : "#00A400";
    // eslint-disable-next-line no-console
    console.log(`%c[Meta ${source}] ${event}`, `color:${color};font-weight:bold`, { eventId, ...params });
  }
}

/** Unique ID shared by the browser pixel (eventID) and the CAPI call (event_id). */
function newEventId(): string {
  return `ev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

type Fbq = (...args: unknown[]) => void;

function fbq(): Fbq | null {
  if (typeof window === "undefined") return null;
  const fn = (window as unknown as { fbq?: Fbq }).fbq;
  return typeof fn === "function" ? fn : null;
}

/** Convert a Libyan 09x number (10 digits) to E.164: 218 + 9 digits. */
export function toInternationalPhone(phone: string): string {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("218")) return digits;
  if (digits.startsWith("0")) return "218" + digits.slice(1);
  return digits;
}

function sendToCapi(event: string, eventId: string, params: Record<string, unknown>, userData?: MetaUserData) {
  try {
    const payload = {
      eventName: event,
      eventId,
      customData: params,
      userData,
      eventSourceUrl: window.location.href,
    };
    fetch("/api/meta/capi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {
      /* CAPI must never block the app */
    });
  } catch {
    /* ignore */
  }
}

/** Fire a Meta standard event to every pixel + the Conversions API. Never throws. */
export function pixelTrack(event: string, params: Record<string, unknown> = {}, userData?: MetaUserData) {
  try {
    const eventId = newEventId();
    const payload: Record<string, unknown> = { currency: PIXEL_CURRENCY, ...params, eventID: eventId };
    for (const id of PIXEL_IDS) {
      fbq()?.("track", id, event, payload);
    }
    record(event, eventId, payload, "pixel");
    sendToCapi(event, eventId, payload, userData);
  } catch {
    /* tracking must never break the app */
  }
}

/** Fire a Meta custom (non-standard) event to every pixel. Never throws. */
export function pixelTrackCustom(event: string, params: Record<string, unknown> = {}) {
  try {
    const eventId = newEventId();
    const payload: Record<string, unknown> = { ...params, eventID: eventId };
    for (const id of PIXEL_IDS) {
      fbq()?.("trackCustom", id, event, payload);
    }
    record(event, eventId, payload, "pixel");
  } catch {
    /* tracking must never break the app */
  }
}

/** Purchase must count once per order, even if the success screen reloads. */
export function pixelTrackOnce(key: string, event: string, params: Record<string, unknown> = {}, userData?: MetaUserData) {
  const storageKey = `fbq-once-${event}-${key}`;
  try {
    if (sessionStorage.getItem(storageKey)) return;
    sessionStorage.setItem(storageKey, "1");
  } catch {
    /* private mode — fall through and still fire once per page load */
  }
  pixelTrack(event, params, userData);
}
