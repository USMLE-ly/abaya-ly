// Read-only listing endpoint for the admin dashboard.
// Reads the same Edge Config store written by /api/order — it does not
// modify or replace any existing production endpoint.

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "nadine2026";
  const provided = req.headers["x-admin-password"];
  if (provided !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ orders: [] });

  try {
    const resp = await fetch(EC_URL);
    if (!resp.ok) return res.status(200).json({ orders: [] });

    const allData = await resp.json();
    const items = allData.items || {};

    const orders = Object.entries(items)
      .filter(([key]) => key.startsWith("order:"))
      .map(([, value]) => value)
      .filter((o) => o && typeof o === "object" && o.orderId)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

    return res.status(200).json({ orders });
  } catch (err) {
    console.error("Admin orders error:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
