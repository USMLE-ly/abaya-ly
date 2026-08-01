// POST /api/reviews/upload — stores customer review photos in Vercel Blob
// instead of saving large base64 data URLs inside Edge Config.
//
// Implements the same HTTP contract as the official @vercel/blob SDK (put()
// and del()) so no extra dependency is required. When BLOB_READ_WRITE_TOKEN
// is not configured (local dev / before the store is linked), the original
// data-URL payload is returned unchanged so the review flow never breaks.
import { cors, createRateLimiter, clientIp, sanitize } from "./shared.mjs";

const rlUpload = createRateLimiter({ windowMs: 15 * 60_000, max: 5 });

const BLOB_API = process.env.VERCEL_BLOB_API_URL || "https://vercel.com/api/blob";
const BLOB_API_VERSION = "12";

function blobToken() {
  return (process.env.BLOB_READ_WRITE_TOKEN || "").trim();
}

function blobStoreId(token) {
  const i = token.indexOf("_");
  return i > 0 ? token.slice(0, i) : "";
}

function isDataImage(value) {
  const clean = sanitize(String(value || "")).trim();
  return /^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=]+$/i.test(clean) && clean.length <= 500_000;
}

function dataUrlToBuffer(dataUrl) {
  return Buffer.from(dataUrl.split(",")[1], "base64");
}

/** PUT raw bytes to Vercel Blob (mirrors @vercel/blob put()). Returns null when no store is configured. */
export async function putReviewPhoto({ pathname, body, contentType }) {
  const token = blobToken();
  if (!token) return null;
  const storeId = blobStoreId(token);
  const res = await fetch(`${BLOB_API}/?pathname=${encodeURIComponent(pathname)}`, {
    method: "PUT",
    headers: {
      authorization: `Bearer ${token}`,
      "x-api-blob-request-id": `${storeId}:${Date.now()}:${Math.random().toString(16).slice(2)}`,
      "x-vercel-blob-store-id": storeId,
      "x-api-blob-request-attempt": "0",
      "x-api-version": BLOB_API_VERSION,
      "x-content-length": String(body.byteLength),
      "x-vercel-blob-access": "public",
      "x-content-type": contentType,
      "x-add-random-suffix": "0",
      "x-cache-control-max-age": "31536000",
    },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Blob upload failed (${res.status}): ${text.slice(0, 160)}`);
  }
  return res.json();
}

/** Best-effort removal of a previously uploaded photo (never throws). */
export async function deleteReviewPhoto(url) {
  const token = blobToken();
  if (!token) return;
  const storeId = blobStoreId(token);
  try {
    const res = await fetch(`${BLOB_API}/delete`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
        "x-api-blob-request-id": `${storeId}:${Date.now()}:${Math.random().toString(16).slice(2)}`,
        "x-vercel-blob-store-id": storeId,
        "x-api-blob-request-attempt": "0",
        "x-api-version": BLOB_API_VERSION,
      },
      body: JSON.stringify({ urls: [url] }),
    });
    if (!res.ok) console.error("Blob delete failed:", res.status, (await res.text()).slice(0, 160));
  } catch (err) {
    console.error("Blob delete error:", err);
  }
}

/** True when the value is a public Vercel Blob URL. */
export function isBlobUrl(url) {
  try {
    return new URL(String(url)).hostname.endsWith(".vercel-storage.com");
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  cors(req, res, { methods: "POST, OPTIONS", headers: "Content-Type" });
  if (req.method === "OPTIONS") return res.status(200).end();

  const r = rlUpload(clientIp(req));
  if (!r.allowed) return res.status(429).json({ error: "Too many requests", retryAfter: r.retryAfter });

  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { image } = req.body || {};
  if (!isDataImage(image)) return res.status(400).json({ error: "صورة غير صالحة" });

  if (!blobToken()) {
    // Blob store not linked yet → keep the legacy data-URL payload.
    return res.status(200).json({ url: image, storedIn: "data-url" });
  }

  const productId = sanitize(String(req.body?.productId || "product"))
    .slice(0, 80)
    .replace(/[^a-zA-Z0-9_-]+/g, "-");
  const pathname = `reviews/${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.jpg`;
  const contentType = image.includes("data:image/png") ? "image/png" : "image/jpeg";

  try {
    const blob = await putReviewPhoto({ pathname, body: dataUrlToBuffer(image), contentType });
    return res.status(200).json({ url: blob.url, storedIn: "blob" });
  } catch (err) {
    console.error("Review photo upload error:", err);
    return res.status(502).json({ error: "تعذّر رفع الصورة، يرجى المحاولة لاحقاً" });
  }
}
