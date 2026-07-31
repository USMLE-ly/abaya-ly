// Product Reviews API
// Public: GET ?productId=... (list) | POST (create)
// Admin (x-admin-password): GET ?all=1 (list all) | PUT (edit) | DELETE (remove)
// Stored in Edge Config under key "reviews:{productId}"

const VALID_RATINGS = [1, 2, 3, 4, 5];

function cors(req, res) {
  const origin = req.headers.origin || "";
  const allowedOrigins = [
    "https://nadine.luxor.ly",
    "https://abaya-ly.vercel.app",
    "http://localhost:5173",
  ];
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");
}

function isAdmin(req) {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  return !!ADMIN_PASSWORD && req.headers["x-admin-password"] === ADMIN_PASSWORD;
}

async function readItems(EC_URL) {
  const readResp = await fetch(EC_URL);
  const allData = readResp.ok ? await readResp.json() : { items: {} };
  return allData.items || {};
}

async function writeReviews(EC_URL, key, reviews) {
  const writeResp = await fetch(`${EC_URL}/items`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: [{ operation: "upsert", key, value: reviews }],
    }),
  });
  if (!writeResp.ok) {
    const text = await writeResp.text();
    console.error("Edge Config write error:", text);
    throw new Error("Failed to save reviews");
  }
}

export default async function handler(req, res) {
  cors(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ reviews: [] });

  const sanitize = (str) => (str || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  try {
    // Admin: list all reviews across every product
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

    // Public: list reviews for a product
    if (req.method === "GET") {
      return res.status(200).json({ reviews, productId });
    }

    // Public: add a review
    if (req.method === "POST") {
      const { rating, name, comment } = req.body || {};
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
        createdAt: new Date().toISOString(),
      };

      reviews.unshift(review); // newest first

      await writeReviews(EC_URL, REVIEW_KEY, reviews);
      return res.status(201).json({ success: true, review });
    }

    // Everything below requires admin auth
    if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

    // Admin: edit a review
    if (req.method === "PUT") {
      const { reviewId, rating, name, comment } = req.body || {};
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
      reviews[idx].updatedAt = new Date().toISOString();
      await writeReviews(EC_URL, REVIEW_KEY, reviews);
      return res.status(200).json({ success: true, review: reviews[idx] });
    }

    // Admin: delete a review
    if (req.method === "DELETE") {
      const { reviewId } = req.body || {};
      const idx = reviews.findIndex((r) => r.id === reviewId);
      if (idx < 0) return res.status(404).json({ error: "Review not found" });
      const [removed] = reviews.splice(idx, 1);
      await writeReviews(EC_URL, REVIEW_KEY, reviews);
      return res.status(200).json({ success: true, removed });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Reviews API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
