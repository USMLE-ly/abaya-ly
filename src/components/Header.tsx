import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ShoppingBag } from "lucide-react";

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-2xl font-bold text-ring">الملكة</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-medium text-foreground/70 hover:text-foreground px-4 py-2 rounded-full hover:bg-black/5 transition-all duration-200"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button className="p-2 text-foreground/60 hover:text-foreground hover:bg-black/5 rounded-full transition-all">
            <Search size={20} />
          </button>
          <Link to="/cart" className="p-2 text-foreground/60 hover:text-foreground hover:bg-black/5 rounded-full transition-all relative">
            <ShoppingBag size={20} />
          </Link>
          <button
            className="md:hidden p-2 text-foreground/60 hover:text-foreground hover:bg-black/5 rounded-full transition-all"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden glass-strong border-t border-black/5"
          >
            <nav className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-black/5 px-4 py-3 rounded-xl transition-all"
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
