// ═══════════════════════════════════════════════════════════════
// Nadine Promo — SINGLE SOURCE OF TRUTH for the current promotion.
//
// The countdown, coupon validation, and every coupon banner read
// this file, so edit ONLY these values to run a new promotion:
//
//   active     true  → promotion is live
//              false → promotion fully disabled (hidden everywhere)
//   code       the coupon code customers redeem (case-insensitive)
//   type/value "percent" + 25 → 25% off
//   label      short Arabic label shown in the promo UI
//   expiresAt  fixed ISO end date-time. The countdown runs ONCE,
//              reaches zero, and stays expired until you edit this.
//
// The countdown never restarts or loops — one fixed expiration.
// ═══════════════════════════════════════════════════════════════
export const PROMO = {
  active: true,
  code: "NADINE10",
  type: "percent",
  value: 25,
  label: "خصم 25% على طلبكِ — كود NADINE10",
  expiresAt: "2026-08-23T04:35:29.000Z",
};

/** Derived, time-aware status used by the API + coupon validation. */
export function promoStatus() {
  const now = Date.now();
  const expiresAt = PROMO.expiresAt ? new Date(PROMO.expiresAt).getTime() : null;
  const ended = expiresAt !== null && expiresAt <= now;
  return {
    active: !!PROMO.active && !ended,
    disabled: !PROMO.active,
    ended: !!ended,
    code: PROMO.code,
    type: PROMO.type,
    value: PROMO.value,
    label: PROMO.label,
    expiresAt: PROMO.expiresAt,
  };
}
