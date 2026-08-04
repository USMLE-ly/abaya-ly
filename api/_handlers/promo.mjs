import { cors, createRateLimiter, clientIp } from "./shared.mjs";
import { promoStatus } from "./promo-config.mjs";

const rl = createRateLimiter({ windowMs: 60_000, max: 120 });

/** GET /api/promo — public status of the current promotion. */
export default async function handler(req, res) {
  cors(req, res, { methods: "GET, OPTIONS" });
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const r = rl(clientIp(req));
  if (!r.allowed) return res.status(429).json({ error: "Too many requests", retryAfter: r.retryAfter });

  const p = promoStatus();
  return res.status(200).json({
    success: true,
    promo: {
      active: p.active,
      disabled: p.disabled,
      ended: p.ended,
      code: p.code,
      type: p.type,
      value: p.value,
      label: p.label,
      expiresAt: p.expiresAt,
    },
  });
}
