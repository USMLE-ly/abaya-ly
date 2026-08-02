import { useEffect, useState } from "react";
import { products as staticProducts, type Product } from "@/data/products";

// Single-flight cache: static catalog first, then admin overrides from Edge
// Config (same pattern as src/lib/useStock.ts).
let cache: Product[] | null = null;
let inflight: Promise<Product[]> | null = null;

/** Merge admin catalog entries over the static catalog. Undefined fields fall
 *  back to the static product; explicitly empty values (e.g. cleared images)
 *  win so the storefront matches exactly what the admin saved. */
export function mergeCatalogOverrides(overrides: any[]): Product[] {
  const map = new Map<string, Product>(staticProducts.map((p) => [p.id, p]));
  for (const o of overrides || []) {
    if (!o || !o.id) continue;
    const base = map.get(o.id) ?? ({} as Product);
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(o)) {
      if (v !== undefined) clean[k] = v;
    }
    map.set(o.id, { ...base, ...(clean as unknown as Product) });
  }
  return [...map.values()];
}

export function loadCatalog(): Promise<Product[]> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch("/api/catalog")
      .then((r) => (r.ok ? r.json() : { products: [] }))
      .then((d) => {
        const merged = mergeCatalogOverrides(d.products || []);
        cache = merged;
        return merged;
      })
      .catch(() => {
        cache = staticProducts;
        return cache;
      });
  }
  return inflight;
}

/**
 * Live product catalog for the storefront. Returns the static catalog
 * immediately and re-renders once admin image/text edits arrive.
 */
export function useCatalogProducts(): Product[] {
  const [list, setList] = useState<Product[]>(staticProducts);

  useEffect(() => {
    let alive = true;
    loadCatalog().then((merged) => {
      if (alive) setList(merged);
    });
    return () => {
      alive = false;
    };
  }, []);

  return list;
}
