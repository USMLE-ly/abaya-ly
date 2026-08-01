// Shared helpers for the consolidated Nadine API (single serverless function).
// NOTE: files under api/_handlers are NOT deployed as Vercel functions — only
// the catch-all api/[...route].mjs is.

export const ALLOWED_ORIGINS = [
  "https://nadine.luxor.ly",
  "https://abaya-ly.vercel.app",
  "http://localhost:5173",
];

/** Set per-route CORS headers. Methods/headers must match the original endpoints. */
export function cors(req, res, { methods = "GET, OPTIONS", headers = "Content-Type" } = {}) {
  const origin = req.headers.origin || "";
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", headers);
}

/** Per-route in-instance rate limiter (window + max attempts per IP). */
export function createRateLimiter({ windowMs = 15 * 60 * 1000, max = 10 } = {}) {
  const attempts = new Map();
  return function rl_check(ip) {
    const now = Date.now();
    const key = String(ip || "unknown");
    const entry = attempts.get(key);
    if (!entry || now - entry.windowStart > windowMs) {
      attempts.set(key, { windowStart: now, count: 1 });
      return { allowed: true, remaining: max - 1 };
    }
    if (entry.count >= max) {
      const retryAfter = Math.ceil((windowMs - (now - entry.windowStart)) / 1000);
      return { allowed: false, remaining: 0, retryAfter };
    }
    entry.count++;
    return { allowed: true, remaining: max - entry.count };
  };
}

export function clientIp(req) {
  return req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown";
}

export function isAdmin(req) {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  return !!ADMIN_PASSWORD && req.headers["x-admin-password"] === ADMIN_PASSWORD;
}

/** Read the whole Edge Config dataset → { key: value } map. */
export async function readItems(EC_URL) {
  if (!EC_URL) return {};
  const readResp = await fetch(EC_URL);
  const allData = readResp.ok ? await readResp.json() : { items: {} };
  return allData.items || {};
}

const GLOBAL_CONFIG_API = "https://api.vercel.com/v1/global-config";

function ecStoreId(EC_URL) {
  const m = String(EC_URL || "").match(/\/((?:ecfg|gcfg)_[A-Za-z0-9]+)/i);
  return m ? m[1] : "";
}

/**
 * The Vercel REST API only allows keys matching [A-Za-z0-9_-] (≤256 chars).
 * The app uses colon-prefixed keys ("reviews:...", "order:..."), so every key
 * is sanitized at the write boundary. Reads use ecGetItem / ecKeyStartsWith,
 * which understand both the legacy colon form and the sanitized "_" form.
 */
export function ecSanitizeKey(key) {
  return String(key).replace(/[^A-Za-z0-9_-]/g, "_").slice(0, 256);
}

/** Read an item, accepting either the legacy colon key or its sanitized form. */
export function ecGetItem(items, key) {
  if (items && items[key] !== undefined) return items[key];
  const safe = ecSanitizeKey(key);
  return items && items[safe] !== undefined ? items[safe] : undefined;
}

/** Prefix match accepting both the legacy colon form and the sanitized form. */
export function ecKeyStartsWith(key, prefix) {
  return key.startsWith(prefix) || key.startsWith(ecSanitizeKey(prefix));
}

/**
 * Upsert one key in Edge Config / Global Config.
 *
 * Reads use the connection string (GET `EDGE_CONFIG`) — fast and CDN-backed.
 * Writes must go through the Vercel REST API with an account access token:
 *   PATCH https://api.vercel.com/v1/global-config/{storeId}/items
 * The connection-string gateway is read-only — appending /items to it returns
 * 404. Requires VERCEL_API_TOKEN (Vercel Account Settings → Tokens), set as a
 * Production env var on the project.
 */
export async function writeItem(EC_URL, key, value) {
  const storeId = ecStoreId(EC_URL);
  const apiToken = process.env.VERCEL_API_TOKEN || "";
  if (!storeId || !apiToken) {
    throw new Error(
      "Edge Config write unavailable: set VERCEL_API_TOKEN (and keep the EDGE_CONFIG connection string)"
    );
  }
  const itemsUrl = `${GLOBAL_CONFIG_API}/${storeId}/items`;
  const payload = JSON.stringify({ items: [{ operation: "upsert", key: ecSanitizeKey(key), value }] });
  const writeResp = await fetch(itemsUrl, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: payload,
  });
  if (!writeResp.ok) {
    const text = await writeResp.text();
    // The store lives under the project team (nadine.luxor.ly → "luxor1"). A bare
    // store lookup can 404 when the token needs team context; retry with the slug.
    if (writeResp.status === 404 && /not found/i.test(text)) {
      console.error("Edge Config write 404 (no slug):", text);
      const teamSlug = process.env.VERCEL_TEAM_SLUG || "luxor1";
      const retry = await fetch(`${itemsUrl}?slug=${encodeURIComponent(teamSlug)}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
        body: payload,
      });
      if (retry.ok) return;
      const retryText = await retry.text();
      throw new Error(`Edge Config write failed [${retry.status}] ${retry.url.replace(/[?&]slug=.*/i, "")}: ${retryText.slice(0, 300)}`);
    }
    throw new Error(`Edge Config write failed [${writeResp.status}] ${writeResp.url}: ${text.slice(0, 300)}`);
  }
}

export const sanitize = (str) => (str || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
