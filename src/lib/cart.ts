// ─────────────────────────────────────────────────────────────
// Single source of truth for the cart (localStorage "nadine-cart")
// ─────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  name: string;
  fabric: string;
  price: number;
  image: string;
  color: string;
  size: string;
  quantity: number;
}

const KEY = "nadine-cart";
export const CART_EVENT = "nadine-cart";

/** Free shipping is already free everywhere — this is the free-gift/priority threshold. */
export const FREE_SHIPPING_THRESHOLD = 900;

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]): CartItem[] {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* storage full or unavailable */
  }
  window.dispatchEvent(new Event(CART_EVENT));
  return items;
}

export function addToCart(item: CartItem): CartItem[] {
  const cart = getCart();
  const match = cart.find((i) => i.id === item.id && i.size === item.size && i.color === item.color);
  if (match) {
    match.quantity += item.quantity;
    return setCart([...cart]);
  }
  return setCart([...cart, item]);
}

export function removeFromCart(id: string): CartItem[] {
  return setCart(getCart().filter((i) => i.id !== id));
}

export const cartCount = (items = getCart()) =>
  items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0);

export const cartSubtotal = (items = getCart()) =>
  items.reduce((sum, i) => sum + i.price * (Number(i.quantity) || 1), 0);

export function subscribeToCart(cb: () => void) {
  window.addEventListener(CART_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CART_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

// ── Coupons (validated against /api/coupons) ─────────────────
export interface Coupon {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minOrder?: number;
}

export async function validateCoupon(code: string): Promise<Coupon | null> {
  const clean = code.trim();
  if (!clean || clean.length > 40) return null;
  try {
    const res = await fetch(`/api/coupons?code=${encodeURIComponent(clean)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const c = data.coupon ?? data;
    if (!c || !c.code) return null;
    return {
      code: String(c.code),
      type: c.type === "fixed" ? "fixed" : "percent",
      value: Number(c.value) || 0,
      minOrder: c.minOrder ? Number(c.minOrder) : undefined,
    };
  } catch {
    return null;
  }
}

export function discountAmount(coupon: Coupon | null, subtotal: number) {
  if (!coupon) return 0;
  if (coupon.minOrder && subtotal < coupon.minOrder) return 0;
  const raw = coupon.type === "fixed" ? coupon.value : (subtotal * coupon.value) / 100;
  return Math.min(Math.round(raw), subtotal);
}
