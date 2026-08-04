import { cors, createRateLimiter, clientIp, readItem, writeItem, sanitize } from "./shared.mjs";
import { DELIVERY } from "./delivery-config.mjs";

const rl = createRateLimiter();

export default async function handler(req, res) {
  cors(req, res, { methods: "POST, OPTIONS", headers: "Content-Type" });
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const r = rl(clientIp(req));
  if (!r.allowed) return res.status(429).json({ error: "Too many requests", retryAfter: r.retryAfter });

  const { code, name, customerName, color, size, location, phone, whatsappConsent, couponCode, couponDiscount, deliveryFee, baseTotal, finalTotal, items, preOrder } = req.body || {};

  if (!code || !phone) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Validate Libyan phone number (091, 092, 093, 094 + 7 digits = 10 total)
  const phoneClean = phone.trim().replace(/[^0-9]/g, "");
  const libyanPattern = /^(091|092|093|094)\d{7}$/;
  if (!libyanPattern.test(phoneClean)) {
    return res.status(400).json({
      error: "رقم الهاتف يجب أن يبدأ بـ 091 أو 092 أو 093 أو 094 ويتكون من 10 أرقام",
    });
  }

  const cleanDiscount = Math.max(0, Number(couponDiscount) || 0);
  const cleanDeliveryFee = Math.max(0, Number(deliveryFee) || 0);
  const cleanBaseTotal = Math.max(0, Number(baseTotal) || 0);
  const orderFinalTotal = Math.max(0, Number(finalTotal) || 0);

  const sanitized = {
    code: sanitize(code),
    name: sanitize(name),
    customerName: sanitize(customerName) || "—",
    color: sanitize(color),
    paymentMethod: "cod",
    couponCode: sanitize(couponCode).toUpperCase(),
    couponDiscount: cleanDiscount,
    finalTotal: orderFinalTotal,
    whatsappConsent: !!whatsappConsent,
    size: sanitize(size),
    location: sanitize(location),
  };

  const isPreOrder = !!preOrder;

  // Optional multi-item payload (per-item color/size chosen at booking time).
  const orderItems = Array.isArray(items)
    ? items
        .filter((i) => i && typeof i === "object" && i.id)
        .map((i) => ({
          id: sanitize(i.id),
          name: sanitize(i.name || ""),
          color: sanitize(i.color || ""),
          size: sanitize(i.size || ""),
          quantity: Math.max(1, Number(i.quantity) || 1),
          price: Math.max(0, Number(i.price) || 0),
        }))
    : [];

  const EC_URL = process.env.EDGE_CONFIG;
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  const orderId = "NAD-" + Date.now().toString(36).slice(-4).toUpperCase() + Math.random().toString(36).slice(2, 4).toUpperCase();
  const now = new Date().toISOString();

  const order = {
    orderId,
    code: sanitized.code,
    name: sanitized.name,
    customerName: sanitized.customerName,
    color: sanitized.color,
    size: sanitized.size,
    items: orderItems,
    couponDiscount: sanitized.couponDiscount,
    deliveryFee: cleanDeliveryFee,
    baseTotal: cleanBaseTotal,
    finalTotal: sanitized.finalTotal,
    preOrder: isPreOrder,
    location: sanitized.location,
    phone: phoneClean,
    whatsappConsent: sanitized.whatsappConsent,
    status: "pending",
    statusLabel: "انتظار التأكيد",
    createdAt: now,
    updatedAt: now,
  };

  let stored = false;
  if (EC_URL) {
    try {
      await writeItem(EC_URL, `order:${orderId}`, order);

      // Sanity-check the write through the same CDN read path customers use.
      // Never fail on read propagation lag (writes can take ~10s to appear) —
      // the PATCH ACK above is authoritative for storage.
      try {
        const check = await readItem(EC_URL, `order:${orderId}`);
        if (!check || check.orderId !== orderId) {
          console.error("Order stored but not visible via CDN read yet:", orderId);
        }
      } catch (verifyErr) {
        console.error("Order verify read error:", verifyErr?.message || verifyErr);
      }

      const ids = await readItem(EC_URL, `phone:${phoneClean}`);
      await writeItem(EC_URL, `phone:${phoneClean}`, Array.isArray(ids) ? [...ids, orderId] : [orderId]);
      stored = true;
    } catch (e) {
      console.error("Edge Config write error:", e);
    }
  }

  // Never return success for an order that was not persisted — otherwise the
  // customer gets an order number that can never be tracked.
  if (EC_URL && !stored) {
    return res.status(503).json({
      success: false,
      error: "تعذر حفظ الطلب الآن، يرجى المحاولة مرة أخرى",
    });
  }

  if (BOT_TOKEN && CHAT_ID && stored) {
    const consentEmoji = sanitized.whatsappConsent ? "✅" : "❌";
    const productLines = orderItems.length > 0
      ? orderItems.map((it, idx) => `${idx + 1}. ${it.name || "—"} ×${it.quantity} — ${it.color || "—"} / ${it.size || "—"} — ${it.price * it.quantity} د.ل`)
      : [`👗 الفستان: ${sanitized.name || "—"}`, `🎨 اللون: ${sanitized.color || "—"}`, `📏 المقاس: ${sanitized.size || "—"}`];
    const message = [
      isPreOrder ? `⏳ حجز مسبق (نفدت الكمية) ${orderId}` : `🛒 طلب جديد ${orderId}`,
      "━━━━━━━━━━━━━━━",
      `🆔 الكود: ${sanitized.code}`,
      `👤 الاسم: ${sanitized.customerName}`,
      ...productLines,
      `📍 الموقع: ${sanitized.location || "—"}`,
      `📞 الهاتف: ${phoneClean}`,
      `💬 تواصل واتساب: ${consentEmoji}`,
      `💳 طريقة الدفع: عند الاستلام 💵`,
      `🚚 التوصيل: ${cleanDeliveryFee > 0 ? cleanDeliveryFee + " د.ل" : "مجاني (" + DELIVERY.freeCity + ")"}`,
      sanitized.couponCode ? `🏷️ كود الخصم: ${sanitized.couponCode}` : null,
      sanitized.couponDiscount > 0
        ? `🏷️ الخصم: ${sanitized.couponDiscount} د.ل${sanitized.finalTotal ? ` — الإجمالي بعد الخصم: ${sanitized.finalTotal} د.ل` : ""}`
        : null,
      "━━━━━━━━━━━━━━━",
      `📅 ${new Date().toLocaleDateString("ar-LY", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit"
      })}`,
    ].filter(Boolean).join("\n");
    try {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text: message }),
      });
    } catch (e) { /* ignore */ }
  }

  if (sanitized.couponCode && stored) {
    try {
      const items = await readItems(EC_URL);
      const coupons = items.coupons || [];
      const idx = coupons.findIndex((c) => c.code === sanitized.couponCode);
      if (idx >= 0) {
        coupons[idx] = { ...coupons[idx], usedCount: (coupons[idx].usedCount || 0) + 1 };
        await writeItem(EC_URL, "coupons", coupons);
      }
    } catch (e) { /* ignore */ }
  }

  return res.status(200).json({
    success: true,
    orderId,
    message: "سيتم الاتصال بسادتكم خلال 24 ساعه لتاكيد الطلب",
  });
}
