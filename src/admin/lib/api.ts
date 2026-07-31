import type { Order, OrderStatus } from "./types";

const PASSWORD_KEY = "nadine_admin_pw";

export function getPassword(): string | null {
  try {
    return sessionStorage.getItem(PASSWORD_KEY);
  } catch {
    return null;
  }
}

export function setPassword(pw: string) {
  sessionStorage.setItem(PASSWORD_KEY, pw);
}

export function clearPassword() {
  sessionStorage.removeItem(PASSWORD_KEY);
}

export function isAuthed(): boolean {
  return !!getPassword();
}

async function jsonOrThrow(res: Response) {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`[${res.status}] ${text || res.statusText}`);
  }
  return res.json();
}

/** GET /api/admin/orders — read-only listing added for the dashboard. */
export async function fetchOrders(): Promise<Order[]> {
  const pw = getPassword();
  const res = await fetch("/api/admin/orders", {
    headers: { "x-admin-password": pw ?? "" },
  });
  if (res.status === 401) {
    clearPassword();
    throw new Error("كلمة المرور غير صحيحة أو انتهت الجلسة");
  }
  const data = await jsonOrThrow(res);
  return (data.orders ?? []) as Order[];
}

/** POST /api/update-status — existing production endpoint, payload unchanged. */
export async function updateStatus(orderId: string, status: OrderStatus) {
  const res = await fetch("/api/update-status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, status }),
  });
  return jsonOrThrow(res);
}

/** Verifies the password against the listing endpoint. */
export async function verifyPassword(pw: string): Promise<boolean> {
  const res = await fetch("/api/admin/orders", {
    headers: { "x-admin-password": pw },
  });
  return res.ok;
}

/** GET /api/admin/notes — fetch notes for an order. */
export async function fetchNotes(orderId: string): Promise<Note[]> {
  const pw = getPassword();
  const res = await fetch(`/api/admin/notes?orderId=${encodeURIComponent(orderId)}`, {
    headers: { "x-admin-password": pw ?? "" },
  });
  if (res.status === 401) { clearPassword(); throw new Error("كلمة المرور غير صحيحة"); }
  const data = await jsonOrThrow(res);
  return (data.notes ?? []) as Note[];
}

/** POST /api/admin/notes — add a note to an order. */
export async function addNote(orderId: string, text: string): Promise<Note> {
  const pw = getPassword();
  const res = await fetch("/api/admin/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-password": pw ?? "" },
    body: JSON.stringify({ orderId, text }),
  });
  if (res.status === 401) { clearPassword(); throw new Error("كلمة المرور غير صحيحة"); }
  const data = await jsonOrThrow(res);
  return data.note as Note;
}


/** GET /api/admin/settings — fetch store settings. */
export async function fetchSettings(): Promise<any> {
  const pw = getPassword();
  const res = await fetch("/api/admin/settings", {
    headers: { "x-admin-password": pw ?? "" },
  });
  if (res.status === 401) { clearPassword(); throw new Error("كلمة المرور غير صحيحة"); }
  const data = await res.json();
  return data.settings ?? {};
}

/** PUT /api/admin/settings — save store settings. */
export async function saveSettings(settings: any): Promise<void> {
  const pw = getPassword();
  const res = await fetch("/api/admin/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json", "x-admin-password": pw ?? "" },
    body: JSON.stringify({ settings }),
  });
  if (res.status === 401) { clearPassword(); throw new Error("كلمة المرور غير صحيحة"); }
  if (!res.ok) throw new Error("فشل حفظ الإعدادات");
}

export interface Note {
  id: string;
  text: string;
  createdAt: string;
}


/** ── Product CRUD ──────────────────────────────────────────────── */

export interface AdminProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  collection: string;
  model: string;
  fabric: string;
  category: string;
  images: string[];
  colors: { name: string; hex: string }[];
  sizes: string[];
  badge?: string;
  description: string;
  details: string[];
  highlights: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  stock?: number;
  inStock: boolean;
  createdAt?: string;
  updatedAt?: string;
}

async function apiCall(path: string, options: RequestInit = {}) {
  const pw = getPassword();
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-password": pw ?? "",
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) { clearPassword(); throw new Error("Unauthorized"); }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  const data = await apiCall("/api/admin/products");
  return data.products ?? [];
}

export async function createProduct(product: Partial<AdminProduct>): Promise<any> {
  return apiCall("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(product),
  });
}

export async function updateProduct(id: string, updates: Partial<AdminProduct>): Promise<any> {
  return apiCall("/api/admin/products", {
    method: "PUT",
    body: JSON.stringify({ id, ...updates }),
  });
}

export async function deleteProduct(id: string): Promise<any> {
  return apiCall("/api/admin/products", {
    method: "DELETE",
    body: JSON.stringify({ id }),
  });
}

/** ── Product Reviews (admin) ─────────────────────────────────── */

export interface AdminReview {
  id: string;
  productId: string;
  rating: number;
  name: string;
  comment: string;
  createdAt: string;
}

/** GET /api/reviews?all=1 — list every review across all products. */
export async function fetchAllReviews(): Promise<AdminReview[]> {
  const data = await apiCall("/api/reviews?all=1");
  return data.reviews ?? [];
}

/** PUT /api/reviews — edit a review (rating / name / comment). */
export async function updateReview(
  productId: string,
  reviewId: string,
  patch: { rating?: number; name?: string; comment?: string }
): Promise<any> {
  return apiCall("/api/reviews", {
    method: "PUT",
    body: JSON.stringify({ productId, reviewId, ...patch }),
  });
}

/** DELETE /api/reviews — remove a review. */
export async function deleteReview(productId: string, reviewId: string): Promise<any> {
  return apiCall("/api/reviews", {
    method: "DELETE",
    body: JSON.stringify({ productId, reviewId }),
  });
}

/** ── Stock levels (admin) ──────────────────────────────────────── */

/** GET /api/admin/stock — full stock map (productId → units). */
export async function fetchStockLevels(): Promise<Record<string, number>> {
  const data = await apiCall("/api/admin/stock");
  return data.stock ?? {};
}

/** PUT /api/admin/stock — set a product's stock (0-9999). */
export async function updateStock(productId: string, stock: number): Promise<any> {
  return apiCall("/api/admin/stock", {
    method: "PUT",
    body: JSON.stringify({ productId, stock }),
  });
}

/** DELETE /api/admin/stock — clear the override (back to default). */
export async function clearStock(productId: string): Promise<any> {
  return apiCall("/api/admin/stock", {
    method: "DELETE",
    body: JSON.stringify({ productId }),
  });
}

/** ── Storefront analytics (admin) ──────────────────────────────── */

/** GET /api/admin/analytics — aggregated storefront event stats. */
export async function fetchStorefrontAnalytics(): Promise<any> {
  return apiCall("/api/admin/analytics");
}
