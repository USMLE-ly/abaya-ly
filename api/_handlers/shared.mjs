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

export function ecStoreId(EC_URL) {
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
 * Parse a connection string into { baseUrl, token } for key-based reads.
 * Supports both legacy (edge-config.vercel.com/<id>?token=...) and current
 * (global-config.vercel.com/<id>?token=...) formats — same routes on both.
 */
export function ecConnection(EC_URL) {
  if (!EC_URL) return null;
  try {
    const url = new URL(EC_URL);
    const token = url.searchParams.get("token");
    const id = url.pathname.split("/")[1] || "";
    if (!id || !token) return null;
    url.search = "";
    return { baseUrl: url.toString().replace(/\/$/, ""), token };
  } catch {
    return null;
  }
}

/**
 * Read a single key without downloading the whole store.
 * Uses the optimized CDN route (<base>/item/<key>?version=1) with the read
 * token. Falls back to the full-store read on transport/parse errors so
 * behavior is never worse than the legacy path.
 */
export async function readItem(EC_URL, key) {
  if (!EC_URL) return undefined;
  const conn = ecConnection(EC_URL);
  if (conn) {
    // Writes are sanitized (colons → _), so try the sanitized key first.
    for (const k of [ecSanitizeKey(key), key]) {
      try {
        const res = await fetch(
          `${conn.baseUrl}/item/${encodeURIComponent(k)}?version=1`,
          { headers: { Authorization: `Bearer ${conn.token}` } }
        );
        if (res.ok) return await res.json();
        if (res.status === 404) return undefined;
      } catch {
        // fall through to the full read
      }
    }
  }
  const items = await readItems(EC_URL);
  return ecGetItem(items, key);
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
/** Apply one batch operation (upsert or remove) through the Vercel REST API. */
async function patchItem(EC_URL, operation, key, value) {
  const storeId = ecStoreId(EC_URL);
  const apiToken = process.env.VERCEL_API_TOKEN || "";
  if (!storeId || !apiToken) {
    throw new Error(
      "Edge Config write unavailable: set VERCEL_API_TOKEN (and keep the EDGE_CONFIG connection string)"
    );
  }
  const itemsUrl = `${GLOBAL_CONFIG_API}/${storeId}/items`;
  const item = { operation, key: ecSanitizeKey(key) };
  if (value !== undefined) item.value = value;
  const payload = JSON.stringify({ items: [item] });
  const writeResp = await fetch(itemsUrl, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`,
    },
    body: payload,
  });
  if (writeResp.ok) return;
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
  return patchItem(EC_URL, "upsert", key, value);
}

/**
 * Read one key through the Vercel REST API (always the latest version, unlike
 * the CDN connection-string endpoint which lags writes by up to ~10s). Used to
 * verify writes immediately after they land.
 */
export async function restReadItem(EC_URL, key) {
  const storeId = ecStoreId(EC_URL);
  const apiToken = process.env.VERCEL_API_TOKEN || "";
  if (!storeId || !apiToken) return undefined;
  const url = `${GLOBAL_CONFIG_API}/${storeId}/items`;
  const tryFetch = async (u) => {
    const r = await fetch(u, { headers: { Authorization: `Bearer ${apiToken}` } });
    if (r.ok) {
      const body = await r.json();
      const items = body?.items || body || {};
      return items[ecSanitizeKey(key)] ?? items[key];
    }
    if (r.status === 404) return { __rest404: true };
    return undefined;
  };
  const direct = await tryFetch(url);
  if (direct && direct.__rest404) {
    const teamSlug = process.env.VERCEL_TEAM_SLUG || "luxor1";
    return tryFetch(`${url}?slug=${encodeURIComponent(teamSlug)}`);
  }
  return direct;
}

/** Remove one key from the store (REST delete). No-op safe if the key is absent. */
export async function deleteItem(EC_URL, key) {
  try {
    await patchItem(EC_URL, "remove", key);
  } catch (err) {
    // Older API revisions spell it "delete"; retry once before giving up.
    if (/operation|remove/i.test(String(err.message))) {
      await patchItem(EC_URL, "delete", key);
    } else {
      throw err;
    }
  }
}

export const sanitize = (str) => (str || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
