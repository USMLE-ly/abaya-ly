import { createRateLimiter, clientIp, isAdmin, ecStoreId } from "./shared.mjs";

const rl = createRateLimiter();

/** Store metadata from the Vercel REST API (sizeInBytes/itemCount). */
async function restMeta(EC_URL) {
  const storeId = ecStoreId(EC_URL);
  const apiToken = process.env.VERCEL_API_TOKEN || "";
  if (!storeId || !apiToken) return null;
  const url = `https://api.vercel.com/v1/global-config/${storeId}`;
  const tryFetch = (u) =>
    fetch(u, { headers: { Authorization: `Bearer ${apiToken}` } }).then(async (r) => {
      const body = await r.json().catch(() => null);
      if (r.ok) return { sizeInBytes: body?.sizeInBytes, itemCount: body?.itemCount };
      if (r.status === 404 && body?.error?.code === "not_found") return { retrySlug: true };
      return { error: `${r.status} ${body?.error?.message || ""}`.trim() };
    });
  const first = await tryFetch(url);
  if (first?.retrySlug) {
    const teamSlug = process.env.VERCEL_TEAM_SLUG || "luxor1";
    return tryFetch(`${url}?slug=${encodeURIComponent(teamSlug)}`);
  }
  return first;
}

export default async function handler(req, res) {
  const r = rl(clientIp(req));
  if (!r.allowed) return res.status(429).json({ error: "Too many requests", retryAfter: r.retryAfter });

  const summaryOnly = req.query?.summary === "1";
  if (!summaryOnly && !isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ error: "No EC_URL" });

  const summary = { read: "pending" };
  try {
    const resp = await fetch(EC_URL);
    if (!resp.ok) {
      summary.read = `failed ${resp.status}`;
    } else {
      const data = await resp.json();
      const items = data?.items || {};
      const keys = Object.keys(items);
      const prefixCounts = {};
      for (const k of keys) {
        const p = k.split(/[_:-]/)[0];
        prefixCounts[p] = (prefixCounts[p] || 0) + 1;
      }
      summary.read = "ok";
      summary.keyCount = keys.length;
      summary.bytes = Buffer.byteLength(JSON.stringify(items), "utf8");
      summary.orderCount = prefixCounts.order || 0;
      summary.prefixCounts = prefixCounts;
      summary.rest = await restMeta(EC_URL);
      if (!summaryOnly) summary.keys = keys;
    }
  } catch (err) {
    summary.read = `error: ${err.message}`;
  }

  return res.status(200).json(summary);
}
