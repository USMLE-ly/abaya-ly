// ─────────────────────────────────────────────────────────────
// GA4 analytics — safe no-op when no measurement ID is present.
// ─────────────────────────────────────────────────────────────

declare global {
  interface Window {
    dataLayer?: unknown[];
    __nadineGaReady?: boolean;
  }
}

const MEASUREMENT_ID =
  (import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY as string | undefined) ||
  (import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined) ||
  "";

export const analyticsEnabled = Boolean(MEASUREMENT_ID);

function pushEvent(args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

export function initAnalytics() {
  if (!MEASUREMENT_ID || typeof window === "undefined" || window.__nadineGaReady) return;
  window.__nadineGaReady = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  pushEvent(["js", new Date()]);
  pushEvent(["config", MEASUREMENT_ID, { send_page_view: false }]);
}

export function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (!MEASUREMENT_ID) {
    if (import.meta.env.DEV) console.debug("[analytics]", event, params);
    return;
  }
  pushEvent(["event", event, params]);
}

export const trackPageView = (path: string, title?: string) =>
  track("page_view", { page_path: path, page_title: title ?? document.title });

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

export const trackViewItem = (p: TrackableProduct) =>
  track("view_item", { currency: "LYD", value: p.price, items: [toItem(p)] });

export const trackAddToCart = (p: TrackableProduct, quantity = 1) =>
  track("add_to_cart", { currency: "LYD", value: p.price * quantity, items: [toItem(p, quantity)] });

export const trackRemoveFromCart = (p: TrackableProduct, quantity = 1) =>
  track("remove_from_cart", { currency: "LYD", value: p.price * quantity, items: [toItem(p, quantity)] });

export const trackAddToWishlist = (p: TrackableProduct) =>
  track("add_to_wishlist", { currency: "LYD", value: p.price, items: [toItem(p)] });

export const trackBeginCheckout = (value: number, items: TrackableProduct[]) =>
  track("begin_checkout", { currency: "LYD", value, items: items.map((i) => toItem(i)) });

export const trackPurchase = (transactionId: string, value: number, items: TrackableProduct[]) =>
  track("purchase", { transaction_id: transactionId, currency: "LYD", value, items: items.map((i) => toItem(i)) });

export const trackCta = (label: string, location: string) =>
  track("cta_click", { cta_label: label, cta_location: location });

export const trackCoupon = (code: string, status: "applied" | "rejected") =>
  track("coupon_applied", { coupon: code, status });

export const trackNewsletter = (source: string) => track("newsletter_signup", { source });

export const trackPopup = (name: string, action: "shown" | "converted" | "dismissed") =>
  track("popup_" + action, { popup_name: name });

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
