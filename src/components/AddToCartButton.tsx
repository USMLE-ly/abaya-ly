import { useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { Spinner } from "@/components/velar";

interface AddToCartButtonProps {
  price: number;
  label?: string;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}

/**
 * Shrine-style add-to-cart button: full-width, price + bullet + label,
 * loading spinner while "adding", disabled when the product is unavailable.
 * In our booking flow the click opens the booking modal instead of a cart.
 */
export function AddToCartButton({
  price,
  label = "اضيفي الى السلة",
  disabled = false,
  onClick,
  className = "",
}: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const handleClick = () => {
    if (disabled) return;
    setLoading(true);
    // Brief "adding" state, then open the booking form.
    timer.current = setTimeout(() => {
      setLoading(false);
      onClick();
    }, 450);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || loading}
      className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-brand/25 transition-all duration-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none ${className}`}
      style={{ background: "linear-gradient(135deg, #e63d6a, #c42855)" }}
    >
      {loading ? (
        <Spinner size={18} />
      ) : (
        <ShoppingBag size={18} className="transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden="true" />
      )}
      <span className="flex items-baseline gap-1.5">
        <span className="tabular-nums">{price} د.ل</span>
        <span className="opacity-70">•</span>
        <span>{label}</span>
      </span>
    </button>
  );
}
