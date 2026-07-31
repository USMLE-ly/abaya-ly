// Product Reviews API — GET (list), POST (create)
// Stored in Edge Config under key "reviews:{productId}"

const VALID_RATINGS = [1, 2, 3, 4, 5];

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
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ reviews: [] });

  const productId = req.query?.productId || req.body?.productId;
  if (!productId) return res.status(400).json({ error: "productId required" });

  const REVIEW_KEY = `reviews:${productId}`;

  try {
    const readResp = await fetch(EC_URL);
    const allData = readResp.ok ? await readResp.json() : { items: {} };
    const items = allData.items || {};
    const reviews = items[REVIEW_KEY] || [];

    // GET — list reviews for product
    if (req.method === "GET") {
      return res.status(200).json({ reviews, productId });
    }

    // POST — add a review
    if (req.method === "POST") {
      const { rating, name, comment } = req.body || {};
      if (!rating || !VALID_RATINGS.includes(Number(rating))) {
        return res.status(400).json({ error: "Rating must be 1-5" });
      }
      if (!comment || comment.trim().length < 3) {
        return res.status(400).json({ error: "Comment too short" });
      }

      const sanitize = (str) => (str || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");

      const review = {
        id: `rv-${Date.now()}`,
        rating: Number(rating),
        name: sanitize(name || "عميلة نادين"),
        comment: sanitize(comment.trim()),
        createdAt: new Date().toISOString(),
      };

      reviews.unshift(review); // newest first

      const writeResp = await fetch(`${EC_URL}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ operation: "upsert", key: REVIEW_KEY, value: reviews }],
        }),
      });

      if (!writeResp.ok) {
        const text = await writeResp.text();
        console.error("Edge Config write error:", text);
        return res.status(500).json({ error: "Failed to save review" });
      }

      return res.status(201).json({ success: true, review });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Reviews API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
