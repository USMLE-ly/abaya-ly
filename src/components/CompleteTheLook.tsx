import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/velar";
import { OptimizedImage } from "@/components/OptimizedImage";
import { addToCart } from "@/lib/cart";
import { trackAddToCart, trackCta } from "@/lib/analytics";
import type { Product } from "@/data/products";

const shortName = (name: string) => name.split(" • ").slice(2).join(" • ") || name;

const toCartItem = (p: Product) => ({
  id: p.id,
  name: p.name,
  fabric: p.fabric,
  price: p.price,
  image: p.images[0],
  color: p.colors[0]?.name ?? "",
  size: p.sizes[0] ?? "M",
  quantity: 1,
});

/** Frequently bought together — the current piece plus its closest companion. */
export function FrequentlyBoughtTogether({ product, partner }: { product: Product; partner?: Product }) {
  const [added, setAdded] = useState(false);
  if (!partner) return null;

  const total = product.price + partner.price;

  const addBoth = () => {
    addToCart(toCartItem(product));
    addToCart(toCartItem(partner));
    trackAddToCart(product);
    trackAddToCart(partner);
    trackCta("add_bundle", "product_fbt");
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <section className="py-10" aria-labelledby="fbt-heading">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <h2 id="fbt-heading" className="font-display text-xl md:text-2xl font-bold text-fg mb-5">
          يُشترى <span className="text-accent-brand">معاً</span>
        </h2>
        <div className="rounded-2xl border border-line-subtle bg-raised p-4 md:p-6 flex flex-col md:flex-row md:items-center gap-5">
          <div className="flex items-center gap-3">
            {[product, partner].map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                {i > 0 && <Plus size={16} className="text-fg-tertiary flex-shrink-0" aria-hidden="true" />}
                <Link to={`/product/${p.id}`} className="block w-20 h-26 rounded-xl overflow-hidden bg-sunken flex-shrink-0">
                  <OptimizedImage src={p.images[0]} alt={shortName(p.name)} className="w-full h-full" />
                </Link>
              </div>
            ))}
          </div>

          <ul className="flex-1 space-y-1.5 list-none p-0 m-0">
            {[product, partner].map((p) => (
              <li key={p.id} className="text-xs text-fg-secondary flex items-baseline justify-between gap-3">
                <Link to={`/product/${p.id}`} className="truncate hover:text-accent-brand">{shortName(p.name)}</Link>
                <span className="font-semibold text-fg whitespace-nowrap">{p.price} د.ل</span>
              </li>
            ))}
            <li className="pt-2 mt-2 border-t border-line-subtle flex items-baseline justify-between text-sm">
              <span className="font-semibold text-fg">إجمالي القطعتين</span>
              <span className="font-bold text-accent-brand">{total} د.ل</span>
            </li>
          </ul>

          <Button variant="primary" onClick={addBoth} className="md:w-auto w-full">
            {added ? <><Check size={16} /> أُضيفتا للسلة</> : <><ShoppingBag size={16} /> أضيفي القطعتين</>}
          </Button>
        </div>
      </div>
    </section>
  );
}

/** Complete the look — styling companions from other collections. */
export function CompleteTheLook({ items }: { items: Product[] }) {
  if (items.length === 0) return null;

  return (
    <section className="py-10" aria-labelledby="ctl-heading">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <h2 id="ctl-heading" className="font-display text-xl md:text-2xl font-bold text-fg mb-1">
          أكملي <span className="text-accent-brand">الإطلالة</span>
        </h2>
        <p className="text-xs text-fg-tertiary mb-5">قطع تنسجم مع هذا التصميم في اللون والقصّة</p>
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 list-none p-0 m-0">
          {items.map((p) => (
            <li key={p.id}>
              <Link
                to={`/product/${p.id}`}
                onClick={() => trackCta("complete_the_look", "product_ctl")}
                className="group block rounded-2xl overflow-hidden border border-line-subtle bg-raised"
              >
                <div className="aspect-[3/4] overflow-hidden bg-sunken">
                  <OptimizedImage
                    src={p.images[0]}
                    alt={shortName(p.name)}
                    className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="text-[10px] uppercase tracking-[0.15em] text-fg-tertiary font-semibold">{p.collection}</p>
                  <p className="text-xs font-semibold text-fg truncate mt-0.5">{shortName(p.name)}</p>
                  <p className="text-sm font-bold text-accent-brand mt-1">{p.price} د.ل</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
