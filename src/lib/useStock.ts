import { useEffect, useState } from "react";
import { stockLevels as staticStock } from "@/data/products";

// Single-flight cache: static defaults first, then Edge Config overrides.
let cache: Record<string, number> | null = null;
let inflight: Promise<Record<string, number>> | null = null;

function loadStock(): Promise<Record<string, number>> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch("/api/stock")
      .then((r) => (r.ok ? r.json() : { stock: {} }))
      .then((d) => {
        const merged: Record<string, number> = { ...staticStock, ...(d.stock || {}) };
        cache = merged;
        return merged;
      })
      .catch(() => ({ ...staticStock }));
  }
  return inflight;
}

/**
 * Live stock levels for the storefront. Returns static defaults immediately
 * and re-renders once admin overrides arrive from the Edge Config.
 */
export function useStock(): Record<string, number> {
  const [stock, setStock] = useState<Record<string, number>>(staticStock);

  useEffect(() => {
    let alive = true;
    loadStock().then((m) => { if (alive) setStock(m); });
    return () => { alive = false; };
  }, []);

  return stock;
}
