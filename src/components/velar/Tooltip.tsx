import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Tooltip({
  content,
  children,
  side = "top",
}: {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "bottom" | "start" | "end";
}) {
  const [show, setShow] = useState(false);
  const pos: Record<string, string> = {
    top:    "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    start:  "end-full me-2 top-1/2 -translate-y-1/2",
    end:    "start-full ms-2 top-1/2 -translate-y-1/2",
  };
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          className={cn("absolute z-50 whitespace-nowrap rounded-md bg-inverse text-fg-inverse text-xs px-2 py-1 shadow-e3 pointer-events-none", pos[side])}
        >
          {content}
        </span>
      )}
    </span>
  );
}
