import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";

interface SlideTabsProps {
  tabs: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

export function SlideTabs({ tabs, selectedIndex, onSelect }: SlideTabsProps) {
  const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 });
  const tabsRef = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const selectedTab = tabsRef.current[selectedIndex];
    if (selectedTab) {
      const { width } = selectedTab.getBoundingClientRect();
      setPosition({ left: selectedTab.offsetLeft, width, opacity: 1 });
    }
  }, [selectedIndex]);

  const onMouseLeave = () => {
    const selectedTab = tabsRef.current[selectedIndex];
    if (selectedTab) {
      const { width } = selectedTab.getBoundingClientRect();
      setPosition({ left: selectedTab.offsetLeft, width, opacity: 1 });
    }
  };

  return (
    <ul
      onMouseLeave={onMouseLeave}
      className="relative mx-auto flex w-fit rounded-full border border-black/10 bg-white/60 backdrop-blur-xl p-1"
    >
      {tabs.map((tab, i) => (
        <Tab
          key={tab}
          ref={(el) => { tabsRef.current[i] = el; }}
          setPosition={setPosition}
          onClick={() => onSelect(i)}
        >
          {tab}
        </Tab>
      ))}
      <Cursor position={position} />
    </ul>
  );
}

const Tab = React.forwardRef<
  HTMLLIElement,
  { children: React.ReactNode; setPosition: (p: { left: number; width: number; opacity: number }) => void; onClick: () => void }
>(({ children, setPosition, onClick }, ref) => {
  return (
    <li
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => {
        const el = ref as React.RefObject<HTMLLIElement>;
        if (!el?.current) return;
        const { width } = el.current.getBoundingClientRect();
        setPosition({ left: el.current.offsetLeft, width, opacity: 1 });
      }}
      className="relative z-10 block cursor-pointer px-4 py-2 text-xs font-medium text-foreground/50 hover:text-foreground transition-colors duration-200 md:px-6 md:py-3 md:text-sm"
    >
      {children}
    </li>
  );
});
Tab.displayName = "Tab";

const Cursor = ({ position }: { position: { left: number; width: number; opacity: number } }) => {
  return (
    <motion.li
      animate={{ ...position }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute z-0 h-7 rounded-full bg-primary/20 border border-primary/30 md:h-10"
    />
  );
};
