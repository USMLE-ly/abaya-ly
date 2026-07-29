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

export interface Note {
  id: string;
  text: string;
  createdAt: string;
}

