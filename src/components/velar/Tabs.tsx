import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface TabItem { id: string; label: ReactNode; content: ReactNode }

export function Tabs({
  items,
  defaultId,
  variant = "underline",
  className,
}: {
  items: TabItem[];
  defaultId?: string;
  variant?: "underline" | "pill";
  className?: string;
}) {
  const [active, setActive] = useState(defaultId ?? items[0]?.id);
  const current = items.find((i) => i.id === active);
  return (
    <div className={className}>
      <div className={cn("flex gap-1", variant === "underline" ? "border-b border-line" : "p-1 bg-sunken rounded-lg w-fit")}>
        {items.map((it) => {
          const isActive = it.id === active;
          return (
            <button
              key={it.id}
              onClick={() => setActive(it.id)}
              className={cn(
                "px-4 py-2 text-sm font-medium transition-colors",
                variant === "underline"
                  ? cn("border-b-2 -mb-px", isActive ? "border-brand text-brand" : "border-transparent text-fg-secondary hover:text-fg")
                  : cn("rounded-md", isActive ? "bg-raised text-fg shadow-e1" : "text-fg-secondary hover:text-fg")
              )}
            >
              {it.label}
            </button>
          );
        })}
      </div>
      <div className="mt-4">{current?.content}</div>
    </div>
  );
}
