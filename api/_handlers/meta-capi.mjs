// ─────────────────────────────────────────────────────────────
// Meta Conversions API (CAPI) — server-side event relay.
//
// The browser pixel fires every event client-side (src/lib/meta-pixel.ts)
// AND mirrors it here with the SAME event_id. Meta deduplicates
// browser + server hits by (event_id, event_name, pixel).
//
// Env vars (set in Vercel):
//   META_CAPI_ACCESS_TOKEN — token with manage_pixel / ads_management
//   META_PIXEL_ID          — one or more comma-separated pixel IDs
//
// Dedup: each event_id is recorded in storage for 48h; repeated
// arrivals are answered without re-sending to Meta.
// ─────────────────────────────────────────────────────────────
import { createHash } from "crypto";
import { cors, createRateLimiter, clientIp, readItems, writeItem, deleteItem, ecGetItem } from "./shared.mjs";

const rl = createRateLimiter({ windowMs: 60_000, max: 120 });

const GRAPH_URL = "https://graph.facebook.com/v21.0";
const EVENT_TTL_MS = 48 * 60 * 60 * 1000; // dedup window (hours)

const ALLOWED_EVENTS = new Set([
  "PageView", "ViewContent", "AddToCart", "AddToWishlist",
  "InitiateCheckout", "Purchase", "Lead", "Search", "Contact",
  "CompleteRegistration",
]);

// Only whitelisted custom_data fields are forwarded to Meta.
const CUSTOM_DATA_ALLOWED = new Set([
  "currency", "value", "content_ids", "content_type", "content_name",
  "contents", "num_items", "search_string", "content_category",
]);

function sha256(value) {
  return createHash("sha256").update(String(value ?? "").trim().toLowerCase()).digest("hex");
}

/** Accept Libyan 09x (10-digit) or already-E.164 numbers → 218 + 9 digits. */
function normalizePhone(phone) {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("218")) return digits;
  if (digits.startsWith("0")) return "218" + digits.slice(1);
  return digits;
}

function cleanUserData(userData, req) {
  const out = {
    client_ip_address: clientIp(req),
    client_user_agent: req.headers["user-agent"] || "",
  };
  const u = userData || {};
  if (u.ph) out.ph = sha256(normalizePhone(u.ph));
  if (u.em) out.em = sha256(u.em);
  if (u.fn) out.fn = sha256(u.fn);
  if (u.ln) out.ln = sha256(u.ln);
  return out;
}

function cleanCustomData(raw = {}) {
  const out = {};
  for (const [key, value] of Object.entries(raw || {})) {
    if (CUSTOM_DATA_ALLOWED.has(key) && value !== undefined && value !== null) out[key] = value;
  }
  return out;
}

function newEventId() {
  return `srv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export default async function handler(req, res) {
  cors(req, res, { methods: "GET, POST, OPTIONS", headers: "Content-Type" });
  if (req.method === "OPTIONS") return res.status(200).end();

  const TOKEN = process.env.META_CAPI_ACCESS_TOKEN || "";
  const PIXELS = (process.env.META_PIXEL_ID || "").split(",").map((s) => s.trim()).filter(Boolean);

  // GET = config probe used by the /meta-debug QA page.
  if (req.method === "GET") {
    return res.status(200).json({
      configured: !!(TOKEN && PIXELS.length),
      pixels: PIXELS,
      events: [...ALLOWED_EVENTS],
      dedupWindowHours: EVENT_TTL_MS / 3_600_000,
    });
  }

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const r = rl(clientIp(req));
  if (!r.allowed) return res.status(429).json({ error: "Too many requests", retryAfter: r.retryAfter });

  const body = (req.body && typeof req.body === "object") ? req.body : {};
  const eventName = String(body.eventName || "").trim();
  if (!ALLOWED_EVENTS.has(eventName)) {
    return res.status(400).json({ error: `Unsupported event: ${eventName}` });
  }

  const eventId = String(body.eventId || "").trim() || newEventId();
  const eventSourceUrl = String(body.eventSourceUrl || "").slice(0, 500);

  if (!TOKEN || !PIXELS.length) {
    console.warn(`[meta-capi] not configured — "${eventName}" skipped (set META_CAPI_ACCESS_TOKEN + META_PIXEL_ID)`);
    return res.status(200).json({ success: false, skipped: true, reason: "not_configured" });
  }

  // ── Deduplication ────────────────────────────────────────────
  // Record event_id in storage; prune entries older than 48h.
  let deduplicated = false;
  const EC_URL = process.env.EDGE_CONFIG;
  if (EC_URL) {
    try {
      const items = await readItems(EC_URL);
      const now = Date.now();
      for (const key of Object.keys(items)) {
        if (key.startsWith("meta_events:") || key.startsWith("meta_events_")) {
          const ts = Number(items[key]);
          if (Number.isFinite(ts) && now - ts > EVENT_TTL_MS) {
            await deleteItem(EC_URL, key).catch(() => {});
          }
        }
      }
      const existing = ecGetItem(items, `meta_events:${eventId}`);
      if (existing !== undefined) {
        deduplicated = true;
      } else {
        await writeItem(EC_URL, `meta_events:${eventId}`, now);
      }
    } catch (err) {
      console.error("[meta-capi] dedup storage error:", err?.message || err);
    }
  }

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: eventSourceUrl || undefined,
        action_source: "website",
        user_data: cleanUserData(body.userData, req),
        ...(Object.keys(cleanCustomData(body.customData)).length
          ? { custom_data: cleanCustomData(body.customData) }
          : {}),
      },
    ],
  };

  if (deduplicated) {
    return res.status(200).json({ success: true, deduplicated: true });
  }

  // ── Forward to Meta (one request per pixel) ──────────────────
  const results = [];
  for (const pixelId of PIXELS) {
    try {
      const url = `${GRAPH_URL}/${encodeURIComponent(pixelId)}/events?access_token=${TOKEN}`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await resp.json().catch(() => ({}));
      results.push({
        pixelId,
        status: resp.status,
        received: json?.events_received === 1,
        error: json?.error?.message || undefined,
      });
      if (json?.error?.message) {
        console.error(`[meta-capi] pixel ${pixelId} error:`, json.error.message);
      }
    } catch (err) {
      results.push({ pixelId, status: 0, received: false, error: String(err?.message || err) });
    }
  }

  return res.status(200).json({ success: true, deduplicated: false, results });
}
