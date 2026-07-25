import { cn } from '@/lib/utils';
import React from 'react';
import { motion } from 'framer-motion';

type FeatureType = {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
  stat?: string;
};

type FeatureCardProps = React.ComponentProps<'div'> & {
  feature: FeatureType;
  index?: number;
};

export function FeatureCard({ feature, className, index = 0, ...props }: FeatureCardProps) {
  const p = genRandomPattern();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: "easeOut" }}
      className={cn(
        'group relative overflow-hidden p-8 transition-all duration-500',
        'hover:bg-white/[0.03]',
        className
      )}
      {...props}
    >
      {/* Subtle gradient glow on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern background */}
      <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
        <div className="from-white/[0.03] to-transparent absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
          <GridPattern
            width={20}
            height={20}
            x="-12"
            y="4"
            squares={p}
            className="fill-white/[0.02] stroke-white/[0.06] absolute inset-0 h-full w-full mix-blend-overlay"
          />
        </div>
      </div>

      {/* Icon */}
      <div className="relative z-10 w-12 h-12 rounded-2xl bg-gradient-to-br from-brand/15 to-brand/5 border border-brand/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:border-brand/25 transition-all duration-500">
        <feature.icon className="text-brand size-5" strokeWidth={1.5} aria-hidden />
      </div>

      {/* Stat number */}
      {feature.stat && (
        <span className="relative z-10 text-3xl font-bold text-brand/20 block mb-2 font-display">{feature.stat}</span>
      )}

      {/* Title */}
      <h3 className="relative z-10 text-base md:text-lg font-bold text-white mb-2 group-hover:text-white transition-colors duration-300">{feature.title}</h3>

      {/* Description */}
      <p className="relative z-10 text-xs md:text-sm font-light text-white/35 leading-relaxed group-hover:text-white/50 transition-colors duration-300">{feature.description}</p>

      {/* Bottom accent line on hover */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}

function GridPattern({
  width, height, x, y, squares, ...props
}: React.ComponentProps<'svg'> & { width: number; height: number; x: string; y: string; squares?: number[][] }) {
  const patternId = React.useId();
  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern id={patternId} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([x, y], index) => (
            <rect strokeWidth="0" key={index} width={width + 1} height={height + 1} x={x * width} y={y * height} />
          ))}
        </svg>
      )}
    </svg>
  );
}

function genRandomPattern(length?: number): number[][] {
  length = length ?? 5;
  return Array.from({ length }, () => [
    Math.floor(Math.random() * 4) + 7,
    Math.floor(Math.random() * 6) + 1,
  ]);
}
