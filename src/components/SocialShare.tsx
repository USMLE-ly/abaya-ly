import { useState } from "react";
import { Share2, MessageCircle, Facebook, Copy, Check } from "lucide-react";

interface Props {
  productName: string;
  productUrl: string;
  compact?: boolean;
}

export function SocialShare({ productName, productUrl, compact = false }: Props) {
  const [copied, setCopied] = useState(false);
  const fullUrl = typeof window !== "undefined" ? window.location.origin + productUrl : `https://nadine.luxor.ly${productUrl}`;
  const encodedUrl = encodeURIComponent(fullUrl);
  const text = encodeURIComponent(`👗 شاهدوا هذا الفستان الجميل من نادين: ${productName}`);

  const shareLinks = [
    {
      name: "واتساب",
      icon: MessageCircle,
      href: `https://wa.me/?text=${text}%20${encodedUrl}`,
      bg: "linear-gradient(135deg, #25D366, #128C7E)",
    },
    {
      name: "فيسبوك",
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bg: "linear-gradient(135deg, #1877F2, #0d5fc4)",
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch { /* ignore */ }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
            style={{ background: link.bg }}
            aria-label={`مشاركة عبر ${link.name}`}
          >
            <link.icon size={15} />
          </a>
        ))}
        <button
          onClick={copyLink}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
          style={{
            background: copied ? "rgba(34,197,94,0.15)" : "rgba(17,15,13,0.05)",
            color: copied ? "#16a34a" : "var(--text-secondary, #3a352f)",
            border: "1px solid rgba(17,15,13,0.1)",
          }}
          aria-label="نسخ الرابط"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-fg-tertiary flex items-center gap-1.5">
        <Share2 size={12} />
        شاركي هذا الفستان:
      </span>
      <div className="flex items-center gap-2">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 shadow-sm"
            style={{ background: link.bg }}
            aria-label={`مشاركة عبر ${link.name}`}
          >
            <link.icon size={15} />
          </a>
        ))}
        <button
          onClick={copyLink}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-sm"
          style={{
            background: copied ? "rgba(34,197,94,0.15)" : "rgba(17,15,13,0.05)",
            color: copied ? "#16a34a" : "var(--text-secondary, #3a352f)",
            border: "1px solid rgba(17,15,13,0.1)",
          }}
          aria-label="نسخ الرابط"
        >
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
      </div>
    </div>
  );
}
