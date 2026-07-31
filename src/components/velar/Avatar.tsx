import type { HTMLAttributes } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  size?: 24 | 32 | 40 | 48 | 56 | 64;
  src?: string;
  alt?: string;
  initials?: string;
  status?: "online" | "offline" | "busy" | "away";
}

const STATUS_COLORS: Record<NonNullable<AvatarProps["status"]>, string> = {
  online: "bg-success",
  offline: "bg-cotton-400",
  busy: "bg-danger",
  away: "bg-warning",
};

export function Avatar({ size = 40, src, alt = "", initials, status, className, ...rest }: AvatarProps) {
  const dot = size <= 32 ? "w-2 h-2" : size <= 48 ? "w-2.5 h-2.5" : "w-3 h-3";
  return (
    <div
      className={cn("relative inline-flex shrink-0 items-center justify-center rounded-full overflow-hidden bg-brand-subtle text-brand font-semibold ring-2 ring-raised", className)}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      {...rest}
    >
      {src ? (
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      ) : initials ? (
        <span>{initials}</span>
      ) : (
        <User size={size * 0.55} />
      )}
      {status && (
        <span className={cn("absolute bottom-0 end-0 rounded-full ring-2 ring-raised", dot, STATUS_COLORS[status])} />
      )}
    </div>
  );
}
