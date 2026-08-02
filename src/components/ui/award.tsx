"use client";

import type React from "react";

import { Award, Star } from "lucide-react";

import { cn } from "@/lib/utils";

export interface AwardsComponentProps {
  variant?: "stamp" | "award" | "certificate" | "badge" | "sticker" | "id-card";
  title: string;
  subtitle?: string;
  description?: string;
  date?: string;
  recipient?: string;
  level?: "bronze" | "silver" | "gold" | "platinum";
  className?: string;
  showIcon?: boolean;
  customIcon?: React.ReactNode;
}

/** Brand-aligned level ramps (strawberry / gold foil instead of raw tailwind hues). */
const levelColors = {
  bronze: "from-[#c78b52] to-[#8a5a2b]",
  silver: "from-[#d9d4d0] to-[#9a938d]",
  gold: "from-[#e2c877] to-[#a9863a]",
  platinum: "from-[#f3d9e0] to-[#c42855]",
};

export function Awards({
  variant = "badge",
  title,
  subtitle,
  description,
  date,
  recipient,
  level = "gold",
  className,
  showIcon = true,
  customIcon,
}: AwardsComponentProps) {
  // ── Stamp ───────────────────────────────────────────────────────
  if (variant === "stamp") {
    const createSerratedPath = () => {
      const radius = 96;
      const teeth = 40;
      const innerRadius = radius - 8;
      const outerRadius = radius;

      let path = "";
      for (let i = 0; i < teeth; i++) {
        const angle = (i / teeth) * 2 * Math.PI;
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const x = Math.cos(angle) * r + radius;
        const y = Math.sin(angle) * r + radius;
        path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
      }
      return path + " Z";
    };

    const createTextPath = (radius: number) => {
      const centerX = 96;
      const centerY = 96;
      return `M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`;
    };

    return (
      <div
        className={cn(
          "relative mx-auto flex h-48 w-48 items-center justify-center",
          className
        )}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 192 192"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <path id="top-curve" d={createTextPath(55)} fill="none" />
            <path
              id="bottom-curve"
              d={createTextPath(60)}
              fill="none"
              transform="rotate(180 96 96)"
            />
          </defs>

          <path
            d={createSerratedPath()}
            strokeWidth="0.9"
            className="fill-[#fdfaf3] stroke-[#c9a25e]"
          />

          <circle
            cx="96"
            cy="96"
            r="80"
            className="fill-transparent stroke-[#e6d5a6]"
            strokeWidth="0.8"
            strokeDasharray="4 3"
          />

          <circle
            cx="96"
            cy="96"
            r="72"
            className="fill-transparent stroke-[#c9a25e]"
            strokeWidth="0.8"
          />

          <text className="text-[15px] font-bold">
            <textPath
              href="#top-curve"
              startOffset="50%"
              textAnchor="middle"
              className="fill-[#9c7138]"
            >
              {title}
            </textPath>
          </text>

          <text className="text-[10px] tracking-wider">
            <textPath
              href="#bottom-curve"
              startOffset="50%"
              textAnchor="middle"
              className="fill-[#b48a45]"
            >
              {subtitle}
            </textPath>
          </text>
        </svg>

        <div className="relative z-10 text-center">
          {showIcon && (
            <div className="mb-1 flex justify-center text-center text-2xl">
              {customIcon ?? <Star className="text-[#c42855] fill-[#c42855]" />}
            </div>
          )}
          {recipient && (
            <div className="mt-2 text-[14px] text-[#c42855]">{recipient}</div>
          )}
          {date && <div className="text-[10px] italic text-fg-tertiary">{date}</div>}
        </div>
      </div>
    );
  }

  // ── Award (laurel wreath) ───────────────────────────────────────
  if (variant === "award") {
    return (
      <div
        className={cn(
          "relative z-0 flex flex-col items-center justify-center overflow-hidden p-6",
          className
        )}
      >
        <div className="z-10 px-8 text-center">
          <div
            className={cn(
              "mt-2 mb-2 inline-block rounded-md px-4 py-1 tracking-wider text-white",
              `bg-gradient-to-r ${levelColors[level]}`
            )}
          >
            {level.toUpperCase()}
          </div>

          <h1 className="text-4xl font-black tracking-tight">{title}</h1>

          <div className="mx-auto my-3 h-[1px] w-40 bg-[#c42855]" />

          <h2 className="mb-4 text-xl font-light">{subtitle}</h2>

          {recipient && <p className="italic text-[#c42855]/70">{recipient}</p>}
          {description && (
            <p className="mt-2 text-xs text-fg-tertiary">{description}</p>
          )}

          <div className="text-xl font-bold">{date}</div>
        </div>
      </div>
    );
  }

  // ── Certificate ─────────────────────────────────────────────────
  if (variant === "certificate") {
    const Ribbon = () => (
      <svg
        className="-mt-12 h-16 w-full overflow-hidden fill-[#c42855]"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
      </svg>
    );

    return (
      <div
        className={cn(
          "relative z-0 flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dotted border-[#c42855]/40 p-2",
          className
        )}
      >
        <div className="z-10 rounded-sm border border-line-subtle bg-white p-6 px-8 text-center">
          <Ribbon />
          <h1 className="mt-4 grid text-3xl font-bold uppercase leading-7 tracking-tighter">
            شهادة
            <span className="text-sm font-light tracking-tight">{title}</span>
          </h1>

          <p className="mt-4 mb-1 text-xs text-fg-tertiary">تشهد هذه الوثيقة بأن</p>
          <h2 className="mb-2 border-b border-line-subtle text-xl font-semibold tracking-tight text-[#c42855]">
            {recipient}
          </h2>

          <p className="mb-1 text-xs text-fg-tertiary">{subtitle}</p>
          {description && (
            <p className="text-[11px] leading-relaxed text-fg-tertiary">{description}</p>
          )}
          <div className="mt-6 flex justify-center">
            <Award strokeWidth={1} className="h-4 w-4" />
          </div>
          <div className="mt-2 text-xs">صدرت بتاريخ: {date}</div>
        </div>
      </div>
    );
  }

  // ── Sticker ─────────────────────────────────────────────────────
  if (variant === "sticker") {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full border border-[#c42855]/30 bg-[#c42855]/8 px-4 py-2",
          className
        )}
      >
        {showIcon && (customIcon ?? <Star size={14} className="fill-[#c42855] text-[#c42855]" />)}
        <span className="text-xs font-bold text-[#c42855]">{title}</span>
        {subtitle && <span className="text-[10px] text-fg-tertiary">{subtitle}</span>}
      </div>
    );
  }

  // ── ID card ─────────────────────────────────────────────────────
  if (variant === "id-card") {
    return (
      <div
        className={cn(
          "w-64 overflow-hidden rounded-xl border border-line-subtle bg-white shadow-sm",
          className
        )}
      >
        <div className={cn("h-2 w-full bg-gradient-to-r", levelColors[level])} />
        <div className="p-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-fg-tertiary">{title}</p>
          <p className="mt-1 text-base font-bold text-fg">{recipient}</p>
          {subtitle && <p className="text-xs text-fg-tertiary">{subtitle}</p>}
          {description && <p className="mt-2 text-[11px] text-fg-tertiary">{description}</p>}
          {date && <p className="mt-3 text-[10px] text-fg-tertiary">{date}</p>}
        </div>
      </div>
    );
  }

  // ── Badge (default) ─────────────────────────────────────────────
  const BadgeMark = () => (
    <svg
      className="h-full w-14 shrink-0 overflow-hidden fill-[#c42855]"
      width="500.15"
      height="620.78"
      viewBox="0 0 500.15 620.78"
    >
      <path d="M453.85,385.1c16.99-26.81,1.62-58.47,18.76-87.24,12.03-20.19,29.82-36.18,27.29-62.46-2.84-29.52-33.04-48.63-35.87-75.13-2.33-21.77,2.23-43.54-9.49-63.51-17.52-29.86-57.27-24.53-79.03-47.97-14.71-15.84-24.1-37.76-46.27-45.73-31.05-11.17-56.45,12.73-85.44,9.44-22.25-2.52-42.24-16.43-65.98-11.43-26.93,5.68-36.44,28.9-52.83,47.17-18.28,20.39-48.97,19.08-69.44,36.56-23.39,19.97-16.36,46.88-19.55,73.45-3.37,28.13-28.95,43.88-34.69,70.31-8.97,41.31,30.51,58.13,34.69,93.72,2.55,21.68-2.27,42.21,9.85,62.15,13.67,22.49,41.07,24.3,62.09,35.93l-65.92,141.39,90.99-30,33.5,89,71.4-151.37c7.8-2.36,16.43-2.29,24.22-.03l69.89,151.41,35-89.01,90.98,30-65.92-141.4c20.6-11.4,47.98-13.54,61.74-35.28ZM431.43,373.69c-11.35,14.21-47.72,18.54-65.33,32.67-14.18,11.38-31.96,45.62-48.03,48.97-17.04,3.56-45.93-12.02-65.51-12.59-22.09-.65-52.83,16.31-70.6,12.59-14.66-3.06-30.11-30.64-40.43-41.57-19.15-20.28-38.59-19.72-60.89-31.11-25.19-12.87-17.89-36.67-19.64-60.36-2.27-30.87-18.47-40.83-31.16-64.84-16.91-32.01,19.44-52.21,27.88-81.45,5.54-19.2-.16-53.87,9.85-68.15,10.07-14.38,49.06-19.97,66.35-33.65,14.41-11.4,32.04-46.32,48.82-49.18,17.2-2.93,45.07,12.06,64.72,12.8,22.27.84,51.14-15.97,69.81-12.8,16.61,2.82,34.57,37.73,48.82,49.18,17.13,13.76,56.34,19.33,66.35,33.65,9.88,14.14,4.2,50.54,10.53,70.47,6.78,21.37,34.53,44.15,31.92,65.86-2.24,18.62-27.45,39.98-33.17,61.83-4.94,18.87.75,53.84-10.31,67.69Z" />
      <path d="M238.82,68.07C104.43,76.3,30.99,231.31,110.21,341.1c68.96,95.57,211.43,95.17,280.04-.59,84.76-118.31-7.09-281.26-151.43-272.43ZM374.44,319.7c-57.48,90.24-188.7,90.73-247.83,2-61.13-91.74-.65-219.62,109.21-228.61,122.55-10.03,205.2,122.08,138.62,226.62Z" />
      <path d="M259.84,157.96c8.2,18.06,16.68,44.63,40.38,45.97,0,0,27.28,3.19,27.28,3.19,9.06,1.06,12.7,12.26,5.99,18.45-14.64,13.38-37.29,29.66-31.24,52.61,0,0,5.39,26.93,5.39,26.93,1.79,8.94-7.74,15.87-15.69,11.4-17.24-9.79-39.73-26.3-59.69-13.45,0,0-23.94,13.45-23.94,13.45-7.95,4.47-17.48-2.46-15.69-11.4,3.98-19.43,12.74-45.91-5.65-60.92,0,0-20.19-18.61-20.19-18.61-6.71-6.18-3.07-17.39,5.99-18.45,19.71-2.21,47.6-2.07,56.19-24.2,0,0,11.46-24.96,11.46-24.96,3.81-8.29,15.59-8.29,19.39,0Z" />
    </svg>
  );

  return (
    <div className={cn("", className)}>
      <div className="flex justify-start gap-3 rounded-md border-2 border-[#c9a25e]/40 p-3">
        <BadgeMark />
        <div className="min-w-0 flex-1 text-right">
          <p className="truncate text-sm font-bold text-fg">{title}</p>
          {subtitle && (
            <p className="truncate text-[11px] text-fg-tertiary">{subtitle}</p>
          )}
          {description && (
            <p className="mt-1 text-[10px] leading-relaxed text-fg-tertiary">
              {description}
            </p>
          )}
          <div className="mt-1 flex items-center justify-between gap-2">
            {recipient && (
              <span className="truncate text-[10px] font-semibold text-[#c42855]">
                {recipient}
              </span>
            )}
            {date && <span className="text-[10px] text-fg-tertiary">{date}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
