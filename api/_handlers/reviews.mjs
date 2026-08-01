import { cors, createRateLimiter, clientIp, readItems, writeItem, isAdmin, sanitize } from "./shared.mjs";
import uploadReviewPhoto, { isBlobUrl, deleteReviewPhoto } from "./review-upload.mjs";

const VALID_RATINGS = [1, 2, 3, 4, 5];

// Reads: generous so product pages never throttle while browsing.
// Writes: strict so a single visitor can't flood the reviews.
const rlRead = createRateLimiter({ windowMs: 60_000, max: 120 });
const rlWrite = createRateLimiter({ windowMs: 15 * 60_000, max: 5 });

function sanitizeImage(url) {
  const clean = sanitize(String(url || "")).trim().slice(0, 600_000);
  if (/^https?:\/\//i.test(clean)) return clean;
  // Client-side compressed photos (canvas → JPEG/PNG data URL), capped at ~500KB text
  if (/^data:image\/(jpeg|png);base64,[A-Za-z0-9+/=]+$/i.test(clean) && clean.length <= 500_000) return clean;
  return "";
}

export default async function handler(req, res) {
  cors(req, res, { methods: "GET, POST, PUT, DELETE, OPTIONS", headers: "Content-Type, x-admin-password" });
  if (req.method === "OPTIONS") return res.status(200).end();

  // POST /api/reviews/upload → move the compressed photo to Vercel Blob storage.
  if (req.method === "POST" && /\/upload$/.test((req.url || "").split("?")[0].replace(/\/+$/, ""))) {
    return uploadReviewPhoto(req, res);
  }

  const r = req.method === "GET" ? rlRead(clientIp(req)) : rlWrite(clientIp(req));
  if (!r.allowed) return res.status(429).json({ error: "Too many requests", retryAfter: r.retryAfter });

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ reviews: [] });

  try {
    if (req.method === "GET" && req.query?.all === "1") {
      if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
      const items = await readItems(EC_URL);
      const reviews = [];
      for (const [key, list] of Object.entries(items)) {
        if (!key.startsWith("reviews:")) continue;
        const productId = key.slice("reviews:".length);
        for (const r of list || []) {
          reviews.push({
            productId,
            id: r.id,
            rating: r.rating,
            name: r.name,
            comment: r.comment,
            image: r.image || "",
            verified: r.verified === true,
            createdAt: r.createdAt,
          });
        }
      }
      reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return res.status(200).json({ reviews });
    }

    const productId = req.query?.productId || req.body?.productId;
    if (!productId) return res.status(400).json({ error: "productId required" });

    const REVIEW_KEY = `reviews:${productId}`;
    const items = await readItems(EC_URL);
    const reviews = items[REVIEW_KEY] || [];

    if (req.method === "GET") {
      return res.status(200).json({ reviews, productId });
    }

    if (req.method === "POST") {
      const { rating, name, comment, image } = req.body || {};
      if (!rating || !VALID_RATINGS.includes(Number(rating))) {
        return res.status(400).json({ error: "Rating must be 1-5" });
      }
      if (!comment || comment.trim().length < 3) {
        return res.status(400).json({ error: "Comment too short" });
      }

      const review = {
        id: `rv-${Date.now()}`,
        rating: Number(rating),
        name: sanitize(name || "عميلة نادين"),
        comment: sanitize(comment.trim()),
        image: sanitizeImage(image),
        verified: false,
        createdAt: new Date().toISOString(),
      };

      reviews.unshift(review);
      await writeItem(EC_URL, REVIEW_KEY, reviews);
      return res.status(201).json({ success: true, review });
    }

    if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

    if (req.method === "PUT") {
      const { reviewId, rating, name, comment, image, verified } = req.body || {};
      const idx = reviews.findIndex((r) => r.id === reviewId);
      if (idx < 0) return res.status(404).json({ error: "Review not found" });
      if (rating !== undefined && !VALID_RATINGS.includes(Number(rating))) {
        return res.status(400).json({ error: "Rating must be 1-5" });
      }
      if (comment !== undefined && comment.trim().length < 3) {
        return res.status(400).json({ error: "Comment too short" });
      }
      if (rating !== undefined) reviews[idx].rating = Number(rating);
      if (name !== undefined) reviews[idx].name = sanitize(name);
      if (comment !== undefined) reviews[idx].comment = sanitize(comment.trim());
      if (image !== undefined) {
        const nextImage = sanitizeImage(image);
        if (reviews[idx].image && reviews[idx].image !== nextImage && isBlobUrl(reviews[idx].image)) {
          await deleteReviewPhoto(reviews[idx].image);
        }
        reviews[idx].image = nextImage;
      }
      if (verified !== undefined) reviews[idx].verified = verified === true;
      reviews[idx].updatedAt = new Date().toISOString();
      await writeItem(EC_URL, REVIEW_KEY, reviews);
      return res.status(200).json({ success: true, review: reviews[idx] });
    }

    if (req.method === "DELETE") {
      const { reviewId } = req.body || {};
      const idx = reviews.findIndex((r) => r.id === reviewId);
      if (idx < 0) return res.status(404).json({ error: "Review not found" });
      const [removed] = reviews.splice(idx, 1);
      await writeItem(EC_URL, REVIEW_KEY, reviews);
      if (removed?.image && isBlobUrl(removed.image)) {
        await deleteReviewPhoto(removed.image);
      }
      return res.status(200).json({ success: true, removed });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Reviews API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
