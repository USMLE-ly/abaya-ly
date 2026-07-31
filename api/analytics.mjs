// Internal analytics ingest — POST batches of storefront events.
// Whitelisted names only; aggregated in Edge Config under "analytics".

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
  const origin = req.headers.origin || "";
  const allowedOrigins = [
    "https://nadine.luxor.ly",
    "https://abaya-ly.vercel.app",
    "http://localhost:5173",
  ];
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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
    const readResp = await fetch(EC_URL);
    const allData = readResp.ok ? await readResp.json() : { items: {} };
    const items = allData.items || {};
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

    // Prune stale sessions, cap total
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

    data.raw = [
      ...(data.raw || []),
      ...clean.map((e) => ({
        name: String(e.name),
        path: String(e.params?.page_path || e.path || ""),
        ts: String(e.ts || new Date().toISOString()),
        sid: String(e.sid || ""),
      })),
    ].slice(-MAX_RAW);

    const writeResp = await fetch(`${EC_URL}/items`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: [{ operation: "upsert", key: "analytics", value: data }],
      }),
    });
    if (!writeResp.ok) {
      const text = await writeResp.text();
      console.error("Analytics write error:", text);
      return res.status(500).json({ error: "Failed to save analytics" });
    }

    return res.status(200).json({ ok: true, accepted: clean.length });
  } catch (err) {
    console.error("Analytics API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
