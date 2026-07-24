"use client"

import { PulsingBorder, MeshGradient } from "@paper-design/shaders-react"
import { motion } from "framer-motion"
import type React from "react"
import { useEffect, useRef, useState } from "react"

// ---------- types ----------
interface ShaderBackgroundProps {
  children: React.ReactNode
}

interface PhotoMarqueeProps {
  images: string[]
}

// ---------- shared animation variants ----------
const FADE_IN = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
}

// ---------- ShaderBackground ----------
export function ShaderBackground({ children }: ShaderBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const enter = () => setIsActive(true)
    const leave = () => setIsActive(false)
    el.addEventListener("mouseenter", enter)
    el.addEventListener("mouseleave", leave)
    return () => {
      el.removeEventListener("mouseenter", enter)
      el.removeEventListener("mouseleave", leave)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      id="top"
      className="min-h-screen w-full relative overflow-hidden flex flex-col"
    >
      {/* SVG filters */}
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02
                      0 1 0 0 0.02
                      0 0 1 0 0.05
                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>
          <filter id="gooey-filter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Background shader — luxury dark + gold mesh */}
      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#0a0a0a", "#c9a84c", "#f5f0e8", "#3E2723", "#1a1000"]}
        speed={0.3}
        backgroundColor="#0a0a0a"
      />
      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-60"
        colors={["#0a0a0a", "#f5f0e8", "#c9a84c", "#0a0a0a"]}
        speed={0.2}
        wireframe="true"
        backgroundColor="transparent"
      />

      {children}
    </div>
  )
}

// ---------- PulsingCircle ----------
export function PulsingCircle() {
  return (
    <div className="absolute bottom-8 right-8 z-30 hidden md:block">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <PulsingBorder
          colors={["#c9a84c", "#e8c97a", "#f5f0e8", "#8b6914", "#c9a84c", "#0a0a0a", "#c9a84c"]}
          colorBack="#00000000"
          speed={1.5}
          roundness={1}
          thickness={0.1}
          softness={0.2}
          intensity={5}
          spotsPerColor={5}
          spotSize={0.1}
          pulse={0.1}
          smoke={0.5}
          smokeSize={4}
          scale={0.65}
          rotation={0}
          frame={9161408.251009725}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
          }}
        />

        <motion.svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          animate={{ rotate: 360 }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          style={{ transform: "scale(1.6)" }}
        >
          <defs>
            <path id="circle" d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
          </defs>
          <text className="text-sm fill-white/80 font-display">
            <textPath href="#circle" startOffset="0%">
              الملكة • العبايات الفاخرة • الملكة • العبايات الفاخرة •
            </textPath>
          </text>
        </motion.svg>
      </div>
    </div>
  )
}

// ---------- HeroContent ----------
export function HeroContent() {
  return (
    <main className="absolute bottom-8 left-8 z-20 max-w-lg">
      <div className="text-left">
        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN}
          className="inline-flex items-center px-3 py-1 rounded-full bg-white/5 backdrop-blur-sm mb-4 relative"
          style={{ filter: "url(#glass-effect)" }}
        >
          <div className="absolute top-0 left-1 right-1 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent rounded-full" />
          <span className="text-gold/90 text-xs font-light relative z-10">✦ الفخامة الليبية الأصيلة ✦</span>
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.1 } },
          }}
          className="font-display text-5xl md:text-6xl md:leading-16 tracking-tight font-light text-cream mb-4"
        >
          <span className="font-medium italic">{typeof "حيث تلتقي" === "string" ? "حيث تلتقي" : ""}</span>
          <br />
          <span className="font-light tracking-tight text-gold">الأناقة بالهوية</span>
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={FADE_IN}
          transition={{ delay: 0.5 }}
          className="text-xs font-light text-white/70 mb-4 leading-relaxed max-w-md"
        >
          كل عباية نصنعها تحمل روح المرأة الليبية — قوتها، رقّتها، وتميّزها.
          من أفخر الأقمشة العالمية إلى تفاصيل التطريز اليدوي، الملكة ليست مجرد عباية، هي هوية.
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-4 flex-wrap"
        >
          <a
            href="#collections"
            className="px-8 py-3 rounded-full bg-gold text-ink font-semibold text-xs transition-all duration-200 hover:brightness-110 cursor-pointer"
          >
            اكتشفي المجموعة
          </a>
          <a
            href="#about"
            className="px-8 py-3 rounded-full bg-transparent border border-gold/30 text-gold font-normal text-xs transition-all duration-200 hover:bg-gold/10 hover:border-gold/50 cursor-pointer"
          >
            شاهدي الفيديو
          </a>
        </motion.div>
      </div>
    </main>
  )
}

// ---------- PhotoMarquee ----------
export function PhotoMarquee({ images }: PhotoMarqueeProps) {
  const duplicatedImages = [...images, ...images]

  return (
    <div className="absolute bottom-0 left-0 w-full h-1/3 md:h-2/5 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
      <motion.div
        className="flex gap-4"
        animate={{
          x: ["-100%", "0%"],
          transition: { ease: "linear", duration: 40, repeat: Infinity },
        }}
      >
        {duplicatedImages.map((src, index) => (
          <div
            key={index}
            className="relative aspect-[3/4] h-48 md:h-64 flex-shrink-0"
            style={{ rotate: `${index % 2 === 0 ? -2 : 5}deg` }}
          >
            <img
              src={src}
              alt={`عرض ${index + 1}`}
              className="w-full h-full object-cover rounded-2xl shadow-md border border-gold/10"
            />
          </div>
        ))}
      </motion.div>
    </div>
  )
}
