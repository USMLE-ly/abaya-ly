import { createRateLimiter, clientIp, readItems, isAdmin, ecKeyStartsWith, ecSanitizeKey, writeItem, deleteKeys } from "./shared.mjs";

const rl = createRateLimiter();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "https://nadine.luxor.ly");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-admin-password");
  res.setHeader("Access-Control-Allow-Methods", "GET, DELETE, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "DELETE") {
    if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
    const EC_URL = process.env.EDGE_CONFIG;
    if (!EC_URL) return res.status(200).json({ success: true });

    // Single-order delete: ?orderId=NAD-XXXX — removes the order and its
    // entry in the phone index (deletes the index key when it empties).
    const orderId = req.query?.orderId;
    if (orderId) {
      try {
        const items = await readItems(EC_URL);
        const entry = Object.entries(items).find(
          ([k, v]) =>
            k === `order:${orderId}` ||
            k === ecSanitizeKey(`order:${orderId}`) ||
            (ecKeyStartsWith(k, "order:") && v && typeof v === "object" && v.orderId === orderId)
        );
        if (!entry) return res.status(404).json({ error: "Order not found" });
        const [orderKey, order] = entry;

        const phone = order?.phone;
        if (phone) {
          const phoneKey = Object.keys(items).find((k) => ecKeyStartsWith(k, `phone:${phone}`));
          if (phoneKey) {
            const ids = Array.isArray(items[phoneKey]) ? items[phoneKey] : [];
            const remaining = ids.filter((id) => id !== orderId);
            if (remaining.length) {
              await writeItem(EC_URL, `phone:${phone}`, remaining);
              // Writes are sanitized (colons → _); drop a legacy colon key so no
              // stale index with the deleted orderId survives.
              if (phoneKey !== ecSanitizeKey(`phone:${phone}`)) {
                await deleteKeys(EC_URL, [phoneKey]);
              }
            } else {
              await deleteKeys(EC_URL, [phoneKey]);
            }
          }
        }

        await deleteKeys(EC_URL, [orderKey]);
        return res.status(200).json({ success: true, deleted: orderId });
      } catch (err) {
        console.error("Admin delete order error:", err);
        return res.status(500).json({ error: "Server error" });
      }
    }

    // Destructive: wipes every order + its phone index. Guarded by an explicit
    // confirmation token AND admin auth, so it can never fire by accident.
    if (req.query?.confirm !== "CLEAR_ALL_ORDERS") {
      return res.status(400).json({ error: "confirm=CLEAR_ALL_ORDERS required" });
    }
    try {
      const items = await readItems(EC_URL);
      const keys = Object.keys(items).filter(
        (k) => ecKeyStartsWith(k, "order:") || ecKeyStartsWith(k, "phone:")
      );
      await deleteKeys(EC_URL, keys);
      return res.status(200).json({ success: true, cleared: keys.length });
    } catch (err) {
      console.error("Admin clear orders error:", err);
      return res.status(500).json({ error: "Server error" });
    }
  }

  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const r = rl(clientIp(req));
  if (!r.allowed) return res.status(429).json({ error: "Too many requests", retryAfter: r.retryAfter });

  if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });

  const EC_URL = process.env.EDGE_CONFIG;
  if (!EC_URL) return res.status(200).json({ orders: [] });

  try {
    const items = await readItems(EC_URL);
    const orders = Object.entries(items)
      .filter(([key]) => ecKeyStartsWith(key, "order:"))
      .map(([, value]) => value)
      .filter((o) => o && typeof o === "object" && o.orderId)
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

    return res.status(200).json({ orders });
  } catch (err) {
    console.error("Admin orders error:", err);
    return res.status(200).json({ orders: [] });
  }
}
