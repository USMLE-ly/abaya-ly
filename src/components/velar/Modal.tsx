import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  footer,
  size = "md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  subtitle?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  children?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [open, onClose]);

  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" }[size];

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-overlay-70" onClick={onClose} style={{ background: "var(--overlay-70)" }} />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            className={cn("relative w-full bg-overlay rounded-2xl shadow-e4 border border-line-subtle overflow-hidden", widths)}
          >
            <button
              onClick={onClose}
              className="absolute top-3 end-3 p-1.5 rounded-md text-fg-tertiary hover:bg-sunken transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            {(title || subtitle) && (
              <div className="p-6 pb-3">
                {title && <h3 className="font-display text-xl font-semibold text-fg">{title}</h3>}
                {subtitle && <p className="text-sm text-fg-secondary mt-1">{subtitle}</p>}
              </div>
            )}
            {children && <div className="px-6 pb-6 text-sm text-fg-secondary">{children}</div>}
            {footer && <div className="px-6 py-4 border-t border-line-subtle bg-sunken flex justify-end gap-2">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
