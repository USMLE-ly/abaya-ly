import { useEffect, useState } from "react";
import { Sun, Moon, Contrast } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "hc";
const KEY = "velar-theme";

function apply(t: Theme) {
  const el = document.documentElement;
  if (t === "light") el.removeAttribute("data-theme");
  else el.setAttribute("data-theme", t);
}

export function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    const stored = (localStorage.getItem(KEY) as Theme | null) ?? "light";
    setTheme(stored);
    apply(stored);
  }, []);
  const set = (t: Theme) => { setTheme(t); apply(t); localStorage.setItem(KEY, t); };
  const btn = (active: boolean) => cn("p-1.5 rounded-md transition-colors", active ? "bg-raised text-brand shadow-e1" : "text-fg-tertiary hover:text-fg");
  return (
    <div className={cn("inline-flex items-center gap-0.5 bg-sunken rounded-lg p-0.5 border border-line-subtle", className)}>
      <button aria-label="Light" onClick={() => set("light")} className={btn(theme === "light")}><Sun size={14} /></button>
      <button aria-label="Dark"  onClick={() => set("dark")}  className={btn(theme === "dark")}><Moon size={14} /></button>
      <button aria-label="High Contrast" onClick={() => set("hc")} className={btn(theme === "hc")}><Contrast size={14} /></button>
    </div>
  );
}
