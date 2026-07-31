// ─────────────────────────────────────────────────────────────
// Single source of truth for the announcement bar's visibility
// and rendered height, so the fixed header can always sit
// directly below it instead of overlapping it.
// ─────────────────────────────────────────────────────────────

const DISMISS_KEY = "nadine-announce-dismissed";

export interface AnnounceState {
  visible: boolean;
  height: number;
}

function isDismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

let state: AnnounceState = { visible: !isDismissed(), height: 0 };
const listeners = new Set<(s: AnnounceState) => void>();

function notify() {
  const snapshot: AnnounceState = { ...state };
  listeners.forEach((l) => l(snapshot));
}

export function getAnnounceState(): AnnounceState {
  return { ...state };
}

export function subscribeAnnounceState(listener: (s: AnnounceState) => void): () => void {
  listener({ ...state });
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function dismissAnnounce() {
  state = { visible: false, height: 0 };
  try {
    sessionStorage.setItem(DISMISS_KEY, "1");
  } catch {
    /* storage unavailable */
  }
  notify();
}

export function setAnnounceHeight(height: number) {
  if (state.height === height) return;
  state = { ...state, height };
  notify();
}
