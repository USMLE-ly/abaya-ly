import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
}

export function Accordion({
  items,
  defaultOpen,
  allowMultiple = false,
  className,
}: {
  items: AccordionItem[];
  defaultOpen?: string[];
  allowMultiple?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState<string[]>(defaultOpen ?? []);
  const toggle = (id: string) => {
    setOpen((o) =>
      o.includes(id) ? o.filter((x) => x !== id) : allowMultiple ? [...o, id] : [id]
    );
  };
  return (
    <div className={cn("divide-y divide-line rounded-xl border border-line bg-raised", className)}>
      {items.map((it) => {
        const isOpen = open.includes(it.id);
        return (
          <div key={it.id}>
            <button
              type="button"
              onClick={() => toggle(it.id)}
              className="w-full flex items-center justify-between gap-4 px-4 py-4 text-start hover:bg-sunken transition-colors"
              aria-expanded={isOpen}
            >
              <span className="font-medium text-fg">{it.title}</span>
              <ChevronDown
                size={18}
                className={cn("shrink-0 text-fg-tertiary transition-transform", isOpen && "rotate-180")}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 text-sm text-fg-secondary">{it.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
