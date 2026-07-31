import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { products } from "@/data/products";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, ShoppingBag, Heart } from "lucide-react";
import { useWishlist } from "@/lib/wishlist";
import { getAnnounceState, subscribeAnnounceState } from "@/lib/announcement";
import { openCartDrawer } from "@/components/CartDrawer";
import { Button, ThemeToggle } from "@/components/velar";

const navLinks = [
  { label: "الرئيسية", href: "/" },
  { label: "المجموعات", href: "/collections" },
  { label: "تتبع الطلب", href: "/track-order" },
  { label: "عن نادين", href: "/about" },
  { label: "تواصلي معنا", href: "/contact" },
];

function WishlistCountWrapper() {
  const { ids } = useWishlist();
  return (
    <Link to="/wishlist" className="relative">
      <Button variant="ghost" iconOnly size="sm" aria-label="المفضلة">
        <Heart size={18} />
      </Button>
      {ids.length > 0 && (
        <span
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
          style={{ background: "#c42855" }}
        >
          {ids.length > 9 ? "9+" : ids.length}
        </span>
      )}
    </Link>
  );
}

function WishlistMenuLink({ onNavigate }: { onNavigate: () => void }) {
  const { ids } = useWishlist();
  return (
    <Link
      to="/wishlist"
      onClick={onNavigate}
      className="flex items-center justify-between text-sm font-medium text-fg-secondary hover:text-fg hover:bg-sunken px-5 py-3 transition-all"
    >
      <span className="flex items-center gap-2">
        <Heart size={16} />
        المفضلة
      </span>
      {ids.length > 0 && (
        <span
          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
          style={{ background: "#c42855" }}
        >
          {ids.length > 9 ? "9+" : ids.length}
        </span>
      )}
    </Link>
  );
}

function CartCountWrapper() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const read = () => {
      try {
        const saved = localStorage.getItem("nadine-cart");
        const items = saved ? JSON.parse(saved) : [];
        setCount(Array.isArray(items) ? items.reduce((s: number, i: any) => s + (Number(i.quantity) || 1), 0) : 0);
      } catch {
        setCount(0);
      }
    };
    read();
    window.addEventListener("nadine-cart", read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener("nadine-cart", read);
      window.removeEventListener("storage", read);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={openCartDrawer}
      aria-label="سلة التسوق"
      className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-fg transition-all duration-150 hover:bg-sunken active:bg-cotton-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
    >
      <ShoppingBag size={18} />
      {count > 0 && (
        <span
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
          style={{ background: "#c42855" }}
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [announce, setAnnounce] = useState(getAnnounceState);
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => subscribeAnnounceState(setAnnounce), []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // While the announcement bar is on screen the header sits directly
  // below it; once the bar scrolls away the header rests at the top.
  const headerTop = announce.visible ? Math.max(0, announce.height - scrollY) : 0;

  const searchResults = searchQuery.trim()
    ? products.filter(p =>
        p.name.includes(searchQuery) ||
        p.collection.includes(searchQuery) ||
        p.model.includes(searchQuery) ||
        p.tags.some(t => t.includes(searchQuery))
      ).slice(0, 6)
    : [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      navigate(`/product/${searchResults[0].id}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <header className="fixed left-0 right-0 z-50" style={{
    top: `${headerTop}px`,
    background: "rgba(255,255,255,0.88)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderBottom: "1px solid rgba(196,40,85,0.08)",
    boxShadow: "0 1px 3px rgba(17,15,13,0.04)"
  }}>
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 h-16 grid grid-cols-[auto_1fr_auto] items-center">
        {/* Hamburger — right (col 1) */}
        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            iconOnly
            size="sm"
            onClick={() => setOpen(!open)}
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </Button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full right-0 mt-2 w-56 rounded-2xl overflow-hidden z-50"
                style={{
                  background: "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid rgba(196,40,85,0.12)",
                  boxShadow: "0 8px 24px rgba(17,15,13,0.08)",
                }}
              >
                <nav className="py-2 flex flex-col">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setOpen(false)}
                      className="text-sm font-medium text-fg-secondary hover:text-fg hover:bg-sunken px-5 py-3 transition-all"
                    >
                      {link.label}
                    </Link>
                  ))}
                  <div className="my-1 border-t" style={{ borderColor: "rgba(196,40,85,0.08)" }} />
                  <WishlistMenuLink onNavigate={() => setOpen(false)} />
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Logo — center (col 2) */}
        <Link to="/" className="flex items-center justify-center">
          <span className="font-display text-2xl font-bold text-ring">نادين</span>
        </Link>

        {/* Icons — left (col 3) */}
        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden md:inline-flex" />
          <Button variant="ghost" iconOnly size="sm" aria-label="بحث" onClick={() => setSearchOpen(true)}>
            <Search size={18} />
          </Button>
          <WishlistCountWrapper />
          <CartCountWrapper />
        </div>
      </div>
      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4"
            style={{ background: "rgba(17,15,13,0.70)", backdropFilter: "blur(8px)" }}
            onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "blur(24px)", border: "1px solid rgba(196,40,85,0.12)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSearch} className="relative">
                <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-fg-tertiary" />
                <input
                  autoFocus
                  type="text"
                  placeholder="ابحثي عن فستان..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-12 py-4 text-sm bg-transparent border-b border-line-subtle outline-none text-fg placeholder:text-fg-tertiary"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-fg-tertiary hover:text-fg"
                  >
                    <X size={16} />
                  </button>
                )}
              </form>
              {searchQuery && (
                <div className="max-h-80 overflow-y-auto p-2">
                  {searchResults.length === 0 ? (
                    <p className="text-center text-sm text-fg-tertiary py-8">لا توجد نتائج</p>
                  ) : (
                    searchResults.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => { navigate(`/product/${p.id}`); setSearchOpen(false); setSearchQuery(""); }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-sunken transition-colors text-start"
                      >
                        <div className="w-10 h-13 rounded-lg overflow-hidden flex-shrink-0 bg-sunken">
                          <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-fg truncate">{p.name.split(" • ").slice(2).join(" • ")}</p>
                          <p className="text-[10px] text-fg-tertiary">{p.price} د.ل</p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
