import { useState } from "react";

interface Props {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
  decoding?: "async" | "sync" | "auto";
  fallback?: string;
  onLoad?: () => void;
  style?: React.CSSProperties;
}

/**
 * OptimizedImage — renders <picture> with WebP + original fallback.
 * Converts e.g. /images/hero/abaya-gold-1.jpg → /images/hero/abaya-gold-1.webp
 * Falls back to the original .jpg/.png if WebP is not supported.
 */
export function OptimizedImage({
  src,
  alt,
  className = "",
  loading = "lazy",
  decoding = "async",
  fallback,
  onLoad,
  style,
}: Props) {
  const [loaded, setLoaded] = useState(false);

  // Derive WebP path from original
  const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, ".webp");
  const actualFallback = fallback || src;

  return (
    <picture className={className} style={style}>
      <source srcSet={webpSrc} type="image/webp" />
      <img
        src={actualFallback}
        alt={alt}
        loading={loading}
        decoding={decoding}
        onLoad={() => {
          setLoaded(true);
          onLoad?.();
        }}
        className={`transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-95"}`}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </picture>
  );
}
