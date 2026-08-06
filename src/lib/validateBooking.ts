/**
 * Strict BookingModal payload validation.
 *
 * Every rule runs BEFORE the /api/order fetch so a missing or invalid field
 * (name, phone, city, per-item data, totals…) is caught client-side and the
 * user sees a clear Arabic message instead of a failed API call.
 */

export interface BookingItemPayload {
  id: string;
  name: string;
  color: string;
  size: string;
  quantity: number;
  price: number;
}

export interface BookingPayload {
  code: string;
  name: string;
  customerName: string;
  color: string;
  size: string;
  items?: BookingItemPayload[];
  location: string;
  phone: string;
  whatsappConsent: boolean;
  couponCode: string;
  couponDiscount: number;
  deliveryFee: number;
  baseTotal: number;
  finalTotal: number;
  preOrder: boolean;
}

export type RawBookingInput = Partial<BookingPayload> & {
  customerName?: string;
  phone?: string;
  location?: string;
  code?: string;
  name?: string;
};

export type BookingValidationResult =
  | { ok: true; payload: BookingPayload }
  | { ok: false; errors: string[]; fieldErrors: Record<string, string> };

const LIBYAN_PHONE = /^(091|092|093|094)\d{7}$/;

function cleanNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

export function validateBookingPayload(input: RawBookingInput): BookingValidationResult {
  const errors: string[] = [];
  const fieldErrors: Record<string, string> = {};

  const addError = (field: string, message: string) => {
    if (!fieldErrors[field]) fieldErrors[field] = message;
    errors.push(message);
  };

  // ── Customer identity ─────────────────────────────────────────────
  const customerName = (input.customerName ?? "").trim();
  if (customerName.length < 2 || customerName.length > 60) {
    addError("customerName", "يرجى كتابة الاسم الكريم (من حرفين إلى 60 حرفاً)");
  }

  // ── Phone (Libyan mobile, 10 digits starting 091/092/093/094) ─────
  const phoneDigits = (input.phone ?? "").replace(/\s/g, "");
  if (!/^\d{10}$/.test(phoneDigits)) {
    addError("phone", "رقم الهاتف يجب أن يتكون من 10 أرقام");
  } else if (!/^(091|092|093|094)/.test(phoneDigits)) {
    addError("phone", "رقم الهاتف يجب أن يبدأ بـ 091 أو 092 أو 093 أو 094");
  }

  // ── Order references ──────────────────────────────────────────────
  const code = (input.code ?? "").trim();
  if (!code) addError("code", "كود المنتج مطلوب");

  const name = (input.name ?? "").trim();
  if (!name) addError("name", "اسم المنتج مطلوب");

  // ── Delivery location ─────────────────────────────────────────────
  const location = (input.location ?? "").trim();
  if (!location) addError("location", "يرجى اختيار المدينة أو المنطقة");

  // ── Per-item lines (cart mode) ────────────────────────────────────
  const items: BookingItemPayload[] = [];
  if (input.items !== undefined) {
    if (!Array.isArray(input.items) || input.items.length === 0) {
      addError("items", "الطلب لا يحتوي على أي قطع");
    } else {
      input.items.forEach((raw, i) => {
        const it = (raw ?? {}) as Partial<BookingItemPayload>;
        const itemId = (it.id ?? "").trim();
        const quantity = cleanNumber(it.quantity);
        const price = cleanNumber(it.price);
        if (!itemId) addError(`items.${i}.id`, "معرّف القطعة مفقود");
        if (!Number.isFinite(quantity) || quantity < 1) {
          addError(`items.${i}.quantity`, "الكمية يجب أن تكون 1 على الأقل");
        }
        if (!Number.isFinite(price) || price < 0) {
          addError(`items.${i}.price`, "سعر القطعة غير صالح");
        }
        items.push({
          id: itemId,
          name: (it.name ?? "").trim(),
          color: (it.color ?? "").trim(),
          size: (it.size ?? "").trim(),
          quantity: Number.isFinite(quantity) ? Math.floor(quantity) : 1,
          price: Number.isFinite(price) ? price : 0,
        });
      });
    }
  }

  // ── Money math ────────────────────────────────────────────────────
  const couponDiscount = cleanNumber(input.couponDiscount);
  const deliveryFee = cleanNumber(input.deliveryFee);
  const baseTotal = cleanNumber(input.baseTotal);
  const finalTotal = cleanNumber(input.finalTotal);

  if (!Number.isFinite(couponDiscount) || couponDiscount < 0) {
    addError("couponDiscount", "قيمة الخصم غير صالحة");
  }
  if (!Number.isFinite(deliveryFee) || deliveryFee < 0) {
    addError("deliveryFee", "رسوم التوصيل غير صالحة");
  }
  if (!Number.isFinite(baseTotal) || baseTotal < 0) {
    addError("baseTotal", "إجمالي الطلب غير صالح");
  }
  if (!Number.isFinite(finalTotal) || finalTotal < 0) {
    addError("finalTotal", "الإجمالي النهائي غير صالح");
  }

  // Cross-field invariants (integer LYD math — no floating point drift).
  if (
    Number.isFinite(couponDiscount) &&
    Number.isFinite(baseTotal) &&
    couponDiscount > baseTotal
  ) {
    addError("couponDiscount", "الخصم أكبر من إجمالي الطلب");
  }
  if (
    Number.isFinite(couponDiscount) &&
    Number.isFinite(deliveryFee) &&
    Number.isFinite(baseTotal) &&
    Number.isFinite(finalTotal) &&
    finalTotal !== Math.max(0, baseTotal - couponDiscount + deliveryFee)
  ) {
    addError("finalTotal", "الإجمالي النهائي لا يتطابق مع تفاصيل الطلب");
  }

  if (errors.length > 0) {
    return { ok: false, errors, fieldErrors };
  }

  return {
    ok: true,
    payload: {
      code,
      name,
      customerName,
      color: (input.color ?? "").trim(),
      size: (input.size ?? "").trim(),
      items: items.length > 0 ? items : undefined,
      location,
      phone: phoneDigits,
      whatsappConsent: Boolean(input.whatsappConsent),
      couponCode: (input.couponCode ?? "").trim(),
      couponDiscount: Number.isFinite(couponDiscount) ? couponDiscount : 0,
      deliveryFee: Number.isFinite(deliveryFee) ? deliveryFee : 0,
      baseTotal: Number.isFinite(baseTotal) ? baseTotal : 0,
      finalTotal: Number.isFinite(finalTotal) ? finalTotal : 0,
      preOrder: Boolean(input.preOrder),
    },
  };
}
