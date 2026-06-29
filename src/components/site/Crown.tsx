export function Crown({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 20" fill="none" className={className} aria-hidden>
      <path
        d="M2 18 L4 5 L10 12 L16 2 L22 12 L28 5 L30 18 Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="4" cy="5" r="1.2" fill="currentColor" />
      <circle cx="16" cy="2" r="1.4" fill="currentColor" />
      <circle cx="28" cy="5" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const text = size === "lg" ? "text-3xl" : size === "sm" ? "text-xl" : "text-2xl";
  const crown = size === "lg" ? "h-5 w-8" : "h-3.5 w-6";
  return (
    <div className="flex flex-col items-center text-gold leading-none">
      <Crown className={crown} />
      <span className={`${text} font-bold tracking-wide mt-1`}>الملكة</span>
    </div>
  );
}
