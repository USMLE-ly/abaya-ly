import { cors, readItems, writeItem } from "./shared.mjs";

const ALLOWED = new Set([
  "page_view", "view_item", "add_to_cart", "remove_from_cart", "add_to_wishlist",
  "begin_checkout", "purchase", "cta_click", "newsletter_signup", "scroll_depth",
  "popup_shown", "popup_converted", "popup_dismissed", "coupon_applied", "coupon_rejected",
]);
const MAX_EVENTS = 40;
const MAX_RAW = 300;
const MAX_VISITORS = 5000;
const VISITOR_TTL_MS = 30 * 864e5;

export default async function handler(req, res) {
  cors(req, res, { methods: "POST, OPTIONS", headers: "Content-Type" });
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ ok: true, note: "analytics disabled" });

  const events = Array.isArray(req.body?.events) ? req.body.events : [];
  if (events.length === 0) return res.status(200).json({ ok: true });

  const clean = events
    .slice(0, MAX_EVENTS)
    .filter((e) => e && typeof e === "object" && ALLOWED.has(String(e.name)));

  if (clean.length === 0) return res.status(200).json({ ok: true, accepted: 0 });

  const now = new Date();
  const day = now.toISOString().slice(0, 10);

  try {
    const items = await readItems(EC_URL);
    const data = items["analytics"] || { counts: {}, byPage: {}, byProduct: {}, byDay: {}, raw: [], visitors: {} };

    for (const e of clean) {
      const name = String(e.name);
      data.counts[name] = (data.counts[name] || 0) + 1;

      if (name === "page_view") {
        const path = String(e.params?.page_path || e.path || "/");
        data.byPage[path] = (data.byPage[path] || 0) + 1;
      }

      const pid = e.params?.items?.[0]?.item_id || e.params?.product_id;
      if ((name === "view_item" || name === "add_to_cart") && pid) {
        data.byProduct[String(pid)] = (data.byProduct[String(pid)] || 0) + 1;
      }

      data.byDay[day] = data.byDay[day] || { visits: 0, events: 0 };
      data.byDay[day].events += 1;
      if (name === "page_view") data.byDay[day].visits += 1;

      if (e.sid) data.visitors[String(e.sid)] = now.getTime();
    }

    const cutoff = now.getTime() - VISITOR_TTL_MS;
    const v = data.visitors || {};
    for (const [sid, ts] of Object.entries(v)) {
      if (Number(ts) < cutoff) delete v[sid];
    }
    const vEntries = Object.entries(v);
    if (vEntries.length > MAX_VISITORS) {
      vEntries.sort((a, b) => Number(a[1]) - Number(b[1]));
      for (const [sid] of vEntries.slice(0, vEntries.length - MAX_VISITORS)) delete v[sid];
    }
    data.visitors = v;

    // Bound the rest of the store growth: daily rollups and per-page/product
    // counters are only useful for recent history. Pruning here keeps the store
    // well under the 1MB cap so writes never start failing.
    const DAYS_TO_KEEP = 60;
    const dayCutoff = new Date(now.getTime() - DAYS_TO_KEEP * 864e5).toISOString().slice(0, 10);
    if (data.byDay && typeof data.byDay === "object") {
      for (const d of Object.keys(data.byDay)) {
        if (d < dayCutoff) delete data.byDay[d];
      }
    }
    const capMap = (obj, max) => {
      if (!obj || typeof obj !== "object") return obj;
      const entries = Object.entries(obj);
      if (entries.length <= max) return obj;
      entries.sort((a, b) => Number(b[1]) - Number(a[1]));
      return Object.fromEntries(entries.slice(0, max));
    };
    data.byPage = capMap(data.byPage, 500);
    data.byProduct = capMap(data.byProduct, 500);

    data.raw = [
      ...(data.raw || []),
      ...clean.map((e) => ({
        name: String(e.name),
        path: String(e.params?.page_path || e.path || ""),
        ts: String(e.ts || new Date().toISOString()),
        sid: String(e.sid || ""),
      })),
    ].slice(-MAX_RAW);

    await writeItem(EC_URL, "analytics", data);
    return res.status(200).json({ ok: true, accepted: clean.length });
  } catch (err) {
    console.error("Analytics API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
