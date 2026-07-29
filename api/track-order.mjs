export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { phone } = req.query;

  if (!phone) {
    return res.status(400).json({ error: "رقم الهاتف مطلوب" });
  }

  const cleanPhone = phone.trim();

  try {
    const { kv } = await import("@vercel/kv");
    if (typeof kv?.smembers !== "function") {
      return res.status(200).json({ orders: [], note: "KV not configured" });
    }

    // Get all order IDs for this phone number
    const orderIds = await kv.smembers(`phone:${cleanPhone}`);

    if (!orderIds || orderIds.length === 0) {
      return res.status(200).json({ orders: [] });
    }

    // Fetch each order
    const orderKeys = orderIds.map((id) => `order:${id}`);
    const orders = await kv.mget(...orderKeys);

    // Filter out nulls and sort by date (newest first)
    const validOrders = orders
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({ orders: validOrders });
  } catch (err) {
    console.error("Track error:", err);
    return res.status(200).json({ orders: [], note: "KV not available" });
  }
}
