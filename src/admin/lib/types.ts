// ══════════════════════════════════════════════════════════════════
// Admin domain types + status system
// Mirrors the production API contract exactly (api/order.mjs)
// ══════════════════════════════════════════════════════════════════

export type OrderStatus =
  | "pending"
  | "processing"
  | "waiting_shipping"
  | "shipped"
  | "delivered";

export interface Order {
  orderId: string;
  code: string;
  name: string;
  /** Customer's own name, collected at checkout (optional on legacy orders). */
  customerName?: string;

  color: string;
  size: string;
  location: string;
  phone: string;
  status: OrderStatus;
  statusLabel: string;
  createdAt: string;
  updatedAt: string;
  paymentMethod?: "cod" | "transfer" | "card";
  whatsappConsent?: boolean;
  couponCode?: string;
}

export interface AdminCoupon {
  code: string;
  type: "percent" | "fixed";
  value: number;
  label?: string;
  maxUses?: number;
  usedCount?: number;
  expiresAt?: string;
  active?: boolean;
  createdAt?: string;
}

export type CouponCheckStatus = "valid" | "expired" | "exhausted" | "disabled" | "missing";

export interface CouponCheck {
  code: string;
  status: CouponCheckStatus;
}

export const COUPON_STATUS_META: Record<CouponCheckStatus, { label: string; color: string; bg: string }> = {
  valid: { label: "مطبق ✓", color: "#4F8A16", bg: "#EBF3EA" },
  expired: { label: "منتهي الصلاحية", color: "#B26A00", bg: "#FFF6E5" },
  exhausted: { label: "مستنفد", color: "#DC2626", bg: "#FEE2E2" },
  disabled: { label: "معطل", color: "#6B7280", bg: "#F3F4F6" },
  missing: { label: "غير موجود", color: "#DC2626", bg: "#FEE2E2" },
};

/** Validates an order's coupon against the current coupon list. */
export function checkCoupon(
  code: string | undefined,
  map: Record<string, AdminCoupon>
): CouponCheck | null {
  if (!code) return null;
  const coupon = map[code.toLowerCase()];
  if (!coupon) return { code, status: "missing" };
  if (coupon.active === false) return { code, status: "disabled" };
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() < Date.now()) {
    return { code, status: "expired" };
  }
  if (coupon.maxUses && (coupon.usedCount || 0) >= coupon.maxUses) {
    return { code, status: "exhausted" };
  }
  return { code, status: "valid" };
}

export interface StatusMeta {
  id: OrderStatus;
  label: string;
  color: string;
  bg: string;
  order: number;
}

// Colors sourced from the MasterPOS Figma palette,
// green accent replaced by Nadine strawberry pink.
export const STATUSES: Record<OrderStatus, StatusMeta> = {
  pending: {
    id: "pending",
    label: "انتظار التأكيد",
    color: "#B26A00",
    bg: "#FFF6E5",
    order: 0,
  },
  processing: {
    id: "processing",
    label: "جاري التجهيز",
    color: "#2C6FD1",
    bg: "#EAF2FE",
    order: 1,
  },
  waiting_shipping: {
    id: "waiting_shipping",
    label: "في انتظار الشحن",
    color: "#5E5E6B",
    bg: "#F1F1F3",
    order: 2,
  },
  shipped: {
    id: "shipped",
    label: "جاري الشحن",
    color: "#4F56D3",
    bg: "#EDEEFF",
    order: 3,
  },
  delivered: {
    id: "delivered",
    label: "تم التوصيل",
    color: "#4F8A16",
    bg: "#EBF3EA",
    order: 4,
  },
};

export const STATUS_LIST: StatusMeta[] = Object.values(STATUSES).sort(
  (a, b) => a.order - b.order
);

export function statusMeta(status: string): StatusMeta {
  return STATUSES[status as OrderStatus] ?? STATUSES.pending;
}

export const AR_DATE = new Intl.DateTimeFormat("ar-LY", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export const AR_DATETIME = new Intl.DateTimeFormat("ar-LY", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : AR_DATE.format(d);
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : AR_DATETIME.format(d);
}

export function hoursSince(iso: string): number {
  const d = new Date(iso).getTime();
  if (isNaN(d)) return 0;
  return (Date.now() - d) / 36e5;
}

export function relativeAr(iso: string): string {
  const h = hoursSince(iso);
  if (h < 1) return `منذ ${Math.max(1, Math.round(h * 60))} دقيقة`;
  if (h < 24) return `منذ ${Math.round(h)} ساعة`;
  return `منذ ${Math.round(h / 24)} يوم`;
}
