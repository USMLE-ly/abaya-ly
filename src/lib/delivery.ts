// ─────────────────────────────────────────────────────────────
// Delivery policy — single source of truth for the storefront.
// Free delivery inside Benghazi; a flat fee for every other city.
// (Mirrored server-side in api/_handlers/delivery-config.mjs)
// ─────────────────────────────────────────────────────────────
export const DELIVERY = {
  freeCity: "بنغازي",
  fee: 15, // د.ل — applied to all cities except the free city
};

export function deliveryFeeFor(city: string): number {
  if (!city) return 0;
  return city === DELIVERY.freeCity ? 0 : DELIVERY.fee;
}
