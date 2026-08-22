import Clarity from "@microsoft/clarity";

const CLARITY_PROJECT_ID = "y6fvh3g6r6";
let initialized = false;

export function initClarity() {
  if (initialized || typeof window === "undefined") return;
  try {
    Clarity.init(CLARITY_PROJECT_ID);
    initialized = true;
  } catch {
    /* Clarity unavailable — silently skip */
  }
}

export function clarityTag(key: string, value: string | string[]) {
  if (!initialized) return;
  try { Clarity.setTag(key, value); } catch {}
}

export function clarityIdentify(customId: string, friendlyName?: string) {
  if (!initialized) return;
  try { Clarity.identify(customId, undefined, undefined, friendlyName); } catch {}
}

export function clarityEvent(eventName: string) {
  if (!initialized) return;
  try { Clarity.event(eventName); } catch {}
}
