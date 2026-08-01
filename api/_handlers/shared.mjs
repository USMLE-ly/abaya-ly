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

/**
 * Append a path segment to the Edge Config connection string without corrupting
 * the query string. Connection strings look like
 *   https://edge-config.vercel.com/ecfg_xxx?token=yyy
 * so a naive `EC_URL + "/items"` puts "/items" inside the token value and the
 * store API rejects every write (401). Appending to the URL pathname preserves
 * the token and makes PATCH /items reach the store.
 */
function ecUrlFor(EC_URL, suffix) {
  try {
    const u = new URL(EC_URL);
    u.pathname = u.pathname.replace(/\/+$/, "") + suffix;
    return u.toString();
  } catch {
    return `${EC_URL}${suffix}`;
  }
}

/** Upsert one key in Edge Config. */
export async function writeItem(EC_URL, key, value) {
  const writeResp = await fetch(ecUrlFor(EC_URL, "/items"), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: [{ operation: "upsert", key, value }] }),
  });
  if (!writeResp.ok) {
    const text = await writeResp.text();
    const safeUrl = String(writeResp.url || "").replace(/(token=)[^&]+/i, "$1***");
    throw new Error(`Edge Config write failed [${writeResp.status}] ${safeUrl}: ${text.slice(0, 300)}`);
  }
}

export const sanitize = (str) => (str || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");
