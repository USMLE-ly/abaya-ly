// Notes API for admin dashboard
// Stores per-order notes in Edge Config alongside order data

export default async function handler(req, res) {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "nadine2026";
  const provided = req.headers["x-admin-password"];
  if (provided !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ notes: [] });

  try {
    // GET: fetch notes for an order
    if (req.method === "GET") {
      const { orderId } = req.query;
      if (!orderId) return res.status(400).json({ error: "orderId required" });

      const resp = await fetch(EC_URL);
      if (!resp.ok) return res.status(200).json({ notes: [] });

      const allData = await resp.json();
      const items = allData.items || {};
      const notesKey = `notes:${orderId.trim()}`;
      const notes = items[notesKey] || [];
      return res.status(200).json({ notes });
    }

    // POST: add a note
    if (req.method === "POST") {
      const { orderId, text } = req.body || {};
      if (!orderId || !text?.trim()) {
        return res.status(400).json({ error: "orderId and text required" });
      }

      // Read existing notes
      const readResp = await fetch(EC_URL);
      const allData = readResp.ok ? await readResp.json() : { items: {} };
      const items = allData.items || {};
      const notesKey = `notes:${orderId.trim()}`;
      const existingNotes = items[notesKey] || [];

      // Add new note
      const note = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        text: text.trim(),
        createdAt: new Date().toISOString(),
      };
      const updatedNotes = [...existingNotes, note];

      // Save to Edge Config
      const writeResp = await fetch(`${EC_URL}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ operation: "upsert", key: notesKey, value: updatedNotes }],
        }),
      });

      if (!writeResp.ok) {
        return res.status(500).json({ error: "Failed to save note" });
      }

      return res.status(200).json({ success: true, note });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Notes API error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
