// ─────────────────────────────────────────────────────────────
// Internal storefront analytics — buffered + batched to our own API.
// No third-party scripts, no Google/Lovable connectors.
// Data appears in the admin dashboard (التحليلات → نشاط المتجر).
// ─────────────────────────────────────────────────────────────

import { pixelTrack, pixelTrackOnce, type MetaUserData } from "@/lib/meta-pixel";
import { clarityEvent } from "@/lib/clarity";

const FLUSH_INTERVAL = 15_000;
const FLUSH_BATCH = 25;
const MAX_BUFFER = 100;

interface AnalyticsEvent {
  name: string;
  params: Record<string, unknown>;
  path: string;
  ts: string;
  sid: string;
}

let buffer: AnalyticsEvent[] = [];
let timer: number | null = null;
let listenersBound = false;
let sessionId = "";

function getSid(): string {
  if (sessionId) return sessionId;
  try {
    sessionId = sessionStorage.getItem("nadine-sid") || "";
    if (!sessionId) {
      sessionId = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("nadine-sid", sessionId);
    }
  } catch {
    sessionId = "s-" + Math.random().toString(36).slice(2);
  }
  return sessionId;
}

export const analyticsEnabled = true;

export function initAnalytics() {
  if (typeof window === "undefined" || listenersBound) return;
  listenersBound = true;
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
}

export function flush() {
  if (timer !== null) {
    window.clearTimeout(timer);
    timer = null;
  }
  if (buffer.length === 0) return;
  const payload = buffer;
  buffer = [];
  try {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events: payload }),
      keepalive: true,
    }).catch(() => {
      // Re-buffer small batches on failure so nothing is silently lost.
      if (payload.length <= 5) buffer = [...payload, ...buffer].slice(0, MAX_BUFFER);
    });
  } catch {
    buffer = [...payload, ...buffer].slice(0, MAX_BUFFER);
  }
}

function scheduleFlush() {
  if (timer !== null) return;
  timer = window.setTimeout(flush, FLUSH_INTERVAL);
}

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (import.meta.env.DEV) console.debug("[analytics]", event, params);
  clarityEvent(event);
  buffer.push({
    name: event,
    params,
    path: window.location.pathname + window.location.search,
    ts: new Date().toISOString(),
    sid: getSid(),
  });
  if (buffer.length >= FLUSH_BATCH) flush();
  else scheduleFlush();
}

// ── Typed event helpers (internal backend + Meta Pixel) ──

export const trackPageView = (path: string, title?: string) => {
  track("page_view", { page_path: path, page_title: title ?? document.title });
  pixelTrack("PageView");
};

interface TrackableProduct {
  id: string;
  name: string;
  price: number;
  collection?: string;
  category?: string;
}

const toItem = (p: TrackableProduct, quantity = 1) => ({
  item_id: p.id,
  item_name: p.name,
  item_brand: "Nadine",
  item_category: p.category,
  item_list_name: p.collection,
  price: p.price,
  quantity,
});

/** Meta payload shared by ViewContent / AddToCart / AddToWishlist. */
const toPixelItems = (items: TrackableProduct[], quantities: number[] = []) => ({
  content_ids: items.map((i) => i.id),
  content_name: items.map((i) => i.name).join(" • "),
  content_type: "product",
  contents: items.map((i, idx) => ({ id: i.id, quantity: quantities[idx] ?? 1 })),
  num_items: quantities.length ? quantities.reduce((a, b) => a + b, 0) : items.length,
});

export const trackViewItem = (p: TrackableProduct) => {
  track("view_item", { value: p.price, items: [toItem(p)] });
  pixelTrack("ViewContent", { ...toPixelItems([p]), value: p.price });
};

export const trackAddToCart = (p: TrackableProduct, quantity = 1) => {
  track("add_to_cart", { value: p.price * quantity, items: [toItem(p, quantity)] });
  pixelTrack("AddToCart", { ...toPixelItems([p], [quantity]), value: p.price * quantity });
};

export const trackRemoveFromCart = (p: TrackableProduct, quantity = 1) =>
  track("remove_from_cart", { value: p.price * quantity, items: [toItem(p, quantity)] });

export const trackAddToWishlist = (p: TrackableProduct) => {
  track("add_to_wishlist", { value: p.price, items: [toItem(p)] });
  pixelTrack("AddToWishlist", { ...toPixelItems([p]), value: p.price });
};

export const trackBeginCheckout = (value: number, items: TrackableProduct[], quantities: number[] = []) => {
  track("begin_checkout", { value, items: items.map((i) => toItem(i)) });
  pixelTrack("InitiateCheckout", { ...toPixelItems(items, quantities), value });
};

export const trackPurchase = (transactionId: string, value: number, items: TrackableProduct[], quantities: number[] = [], userData?: MetaUserData) => {
  track("purchase", { transaction_id: transactionId, value, items: items.map((i) => toItem(i)) });
  pixelTrackOnce(transactionId || "no-id", "Purchase", {
    ...toPixelItems(items, quantities),
    value,
  }, userData);
};

export const trackCta = (label: string, location: string) =>
  track("cta_click", { cta_label: label, cta_location: location });

export const trackCoupon = (code: string, status: "applied" | "rejected") =>
  track(status === "applied" ? "coupon_applied" : "coupon_rejected", { coupon: code });

/** Newsletter, contact form and any other lead capture. */
export const trackLead = (source: string, userData?: MetaUserData) => {
  track("lead", { source });
  pixelTrack("Lead", { content_name: source, value: 0 }, userData);
};

export const trackNewsletter = (source: string, userData?: MetaUserData) => {
  track("newsletter_signup", { source });
  pixelTrack("Lead", { content_name: "Newsletter Signup", value: 0 }, userData);
};

export const trackSearch = (query: string, resultCount = 0) => {
  track("search", { search_term: query, result_count: resultCount });
  pixelTrack("Search", { search_string: query, content_type: "product" });
};

export const trackPopup = (name: string, action: "shown" | "converted" | "dismissed") =>
  track(`popup_${action}`, { popup_name: name });


// ── Scroll depth (25 / 50 / 75 / 100) ────────────────────────
export function startScrollDepthTracking() {
  if (typeof window === "undefined") return () => {};
  const fired = new Set<number>();
  const onScroll = () => {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    const pct = Math.round((window.scrollY / max) * 100);
    for (const step of [25, 50, 75, 100]) {
      if (pct >= step && !fired.has(step)) {
        fired.add(step);
        track("scroll_depth", { percent_scrolled: step, page_path: window.location.pathname });
      }
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  return () => window.removeEventListener("scroll", onScroll);
}
