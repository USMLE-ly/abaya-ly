import { checkRateLimit } from "../_ratelimit.mjs";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://nadine.luxor.ly");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");

  if (req.method === "OPTIONS") return res.status(200).end();

  // Rate limiting
  const ip = req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || "unknown";
  const rl = checkRateLimit(ip);
  if (!rl.allowed) return res.status(429).json({ error: "Too many requests", retryAfter: rl.retryAfter });

  // Auth
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
  if (!ADMIN_PASSWORD) return res.status(500).json({ error: "Server configuration error" });
  if (req.headers["x-admin-password"] !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ notes: [] });

  try {
    if (req.method === "GET") {
      const { orderId } = req.query;
      if (!orderId) return res.status(400).json({ error: "orderId required" });
      const resp = await fetch(EC_URL);
      if (!resp.ok) return res.status(200).json({ notes: [] });
      const allData = await resp.json();
      const items = allData.items || {};
      const notes = items[`notes:${orderId.trim()}`] || [];
      return res.status(200).json({ notes });
    }

    if (req.method === "POST") {
      const { orderId, text } = req.body || {};
      if (!orderId || !text?.trim()) return res.status(400).json({ error: "orderId and text required" });

      // Sanitize note text (prevent XSS)
      const sanitized = text.trim()
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

      const note = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        text: sanitized,
        createdAt: new Date().toISOString(),
      };

      const resp = await fetch(EC_URL);
      const allData = resp.ok ? await resp.json() : { items: {} };
      const items = allData.items || {};
      const notesKey = `notes:${orderId.trim()}`;
      const existing = items[notesKey] || [];

      const writeResp = await fetch(`${EC_URL}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ operation: "upsert", key: notesKey, value: [...existing, note] }],
        }),
      });

      if (!writeResp.ok) return res.status(500).json({ error: "Failed to save note" });
      return res.status(200).json({ note });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Notes API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
