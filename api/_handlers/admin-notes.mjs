import { createRateLimiter, clientIp, readItems, writeItem, isAdmin, sanitize } from "./shared.mjs";

const rl = createRateLimiter();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://nadine.luxor.ly");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");

  if (req.method === "OPTIONS") return res.status(200).end();

  const r = rl(clientIp(req));
  if (!r.allowed) return res.status(429).json({ error: "Too many requests", retryAfter: r.retryAfter });

  if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ notes: [] });

  try {
    if (req.method === "GET") {
      const { orderId } = req.query;
      if (!orderId) return res.status(400).json({ error: "orderId required" });
      const items = await readItems(EC_URL);
      const notes = items[`notes:${orderId.trim()}`] || [];
      return res.status(200).json({ notes });
    }

    if (req.method === "POST") {
      const { orderId, text } = req.body || {};
      if (!orderId || !text?.trim()) return res.status(400).json({ error: "orderId and text required" });

      const sanitizedText = text.trim()
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

      const note = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        text: sanitizedText,
        createdAt: new Date().toISOString(),
      };

      const items = await readItems(EC_URL);
      const notesKey = `notes:${orderId.trim()}`;
      const existing = items[notesKey] || [];
      await writeItem(EC_URL, notesKey, [...existing, note]);
      return res.status(200).json({ note });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Notes API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
