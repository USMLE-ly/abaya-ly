import { useEffect, useState } from "react";

export interface PromoStatus {
  active: boolean;
  disabled: boolean;
  ended: boolean;
  code: string;
  type: "percent" | "fixed";
  value: number;
  label: string;
  expiresAt: string | null;
}

let cache: { at: number; data: PromoStatus | null } | null = null;
const TTL = 60_000;

/** Fetch the current promotion status from /api/promo (cached 60s). */
export async function fetchPromo(): Promise<PromoStatus | null> {
  if (cache && Date.now() - cache.at < TTL) return cache.data;
  try {
    const res = await fetch("/api/promo", { cache: "no-store" });
    if (!res.ok) {
      cache = { at: Date.now(), data: null };
      return null;
    }
    const data = await res.json();
    const promo = data?.promo as PromoStatus | undefined;
    if (!promo) {
      cache = { at: Date.now(), data: null };
      return null;
    }
    cache = { at: Date.now(), data: promo };
    return promo;
  } catch {
    cache = { at: Date.now(), data: null };
    return null;
  }
}

/** React hook — loading=true until the status resolves. */
export function usePromo(): { promo: PromoStatus | null; loading: boolean } {
  const [state, setState] = useState<{ promo: PromoStatus | null; loading: boolean }>({
    promo: null,
    loading: true,
  });

  useEffect(() => {
    let alive = true;
    fetchPromo().then((promo) => {
      if (alive) setState({ promo, loading: false });
    });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
