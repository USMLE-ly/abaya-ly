import { Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist";

interface Props {
  productId: string;
  size?: number;
  className?: string;
}

export function WishlistButton({ productId, size = 16, className = "" }: Props) {
  const { isIn, toggle } = useWishlist();
  const active = isIn(productId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      className={`flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 ${className}`}
      style={{
        background: active ? "rgba(196,40,85,0.15)" : "rgba(255,255,255,0.8)",
        backdropFilter: "blur(8px)",
        border: active ? "1px solid rgba(196,40,85,0.3)" : "1px solid rgba(255,255,255,0.5)",
        width: size + 16,
        height: size + 16,
      }}
      aria-label={active ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
    >
      <Heart
        size={size}
        className="transition-all duration-300"
        style={{
          fill: active ? "#c42855" : "transparent",
          color: active ? "#c42855" : "rgba(0,0,0,0.4)",
        }}
      />
    </button>
  );
}
