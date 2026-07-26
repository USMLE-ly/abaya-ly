import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ShoppingBag } from "lucide-react";
import { Button, ThemeToggle } from "@/components/velar";

const navLinks = [
  { label: "الرئيسية", href: "/" },
  { label: "المجموعات", href: "/collections" },
  { label: "عن الملكة", href: "/about" },
  { label: "تواصلي معنا", href: "/contact" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 glass-strong">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold text-ring">الملكة</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-fg-secondary hover:text-fg px-4 py-2 rounded-full hover:bg-sunken transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden md:inline-flex" />
          <Button variant="ghost" iconOnly size="sm" aria-label="بحث">
            <Search size={18} />
          </Button>
          <Link to="/cart">
            <Button variant="ghost" iconOnly size="sm" aria-label="سلة التسوق">
              <ShoppingBag size={18} />
            </Button>
          </Link>
          <Button
            variant="ghost"
            iconOnly
            size="sm"
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden glass-strong border-t border-line-subtle"
          >
            <nav className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-fg-secondary hover:text-fg hover:bg-sunken px-4 py-3 rounded-xl transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
