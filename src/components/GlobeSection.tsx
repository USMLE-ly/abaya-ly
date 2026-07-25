"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import createGlobe from "cobe"

interface Marker {
  id: string
  location: [number, number]
  label: string
}

interface Arc {
  id: string
  from: [number, number]
  to: [number, number]
}

// Libya (Tripoli) as the destination
const LIBYA: [number, number] = [32.9022, 13.1800]

const markers: Marker[] = [
  { id: "libya", location: LIBYA, label: "ليبيا 🇱🇾" },
  { id: "italy", location: [45.4642, 9.19], label: "إيطاليا 🇮🇹" },
  { id: "france", location: [48.8566, 2.3522], label: "فرنسا 🇫🇷" },
  { id: "turkey", location: [41.0082, 28.9784], label: "تركيا 🇹🇷" },
  { id: "china", location: [31.2304, 121.4737], label: "الصين 🇨🇳" },
  { id: "uae", location: [25.2048, 55.2708], label: "الإمارات 🇦🇪" },
  { id: "india", location: [19.076, 72.8777], label: "الهند 🇮🇳" },
  { id: "korea", location: [37.5665, 126.978], label: "كوريا 🇰🇷" },
]

const arcs: Arc[] = [
  { id: "it-ly", from: [45.4642, 9.19], to: LIBYA },
  { id: "fr-ly", from: [48.8566, 2.3522], to: LIBYA },
  { id: "tr-ly", from: [41.0082, 28.9784], to: LIBYA },
  { id: "cn-ly", from: [31.2304, 121.4737], to: LIBYA },
  { id: "ae-ly", from: [25.2048, 55.2708], to: LIBYA },
  { id: "in-ly", from: [19.076, 72.8777], to: LIBYA },
  { id: "kr-ly", from: [37.5665, 126.978], to: LIBYA },
]

function GlobeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef<{ x: number; y: number } | null>(null)
  const lastPointer = useRef<{ x: number; y: number; t: number } | null>(null)
  const dragOffset = useRef({ phi: 0, theta: 0 })
  const velocity = useRef({ phi: 0, theta: 0 })
  const phiOffsetRef = useRef(0)
  const thetaOffsetRef = useRef(0)
  const isPausedRef = useRef(false)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerInteracting.current = { x: e.clientX, y: e.clientY }
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing"
    isPausedRef.current = true
  }, [])

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (pointerInteracting.current !== null) {
      const deltaX = e.clientX - pointerInteracting.current.x
      const deltaY = e.clientY - pointerInteracting.current.y
      dragOffset.current = { phi: deltaX / 300, theta: deltaY / 1000 }
      const now = Date.now()
      if (lastPointer.current) {
        const dt = Math.max(now - lastPointer.current.t, 1)
        const maxVelocity = 0.15
        velocity.current = {
          phi: Math.max(-maxVelocity, Math.min(maxVelocity, ((e.clientX - lastPointer.current.x) / dt) * 0.3)),
          theta: Math.max(-maxVelocity, Math.min(maxVelocity, ((e.clientY - lastPointer.current.y) / dt) * 0.08)),
        }
      }
      lastPointer.current = { x: e.clientX, y: e.clientY, t: now }
    }
  }, [])

  const handlePointerUp = useCallback(() => {
    if (pointerInteracting.current !== null) {
      phiOffsetRef.current += dragOffset.current.phi
      thetaOffsetRef.current += dragOffset.current.theta
      dragOffset.current = { phi: 0, theta: 0 }
      lastPointer.current = null
    }
    pointerInteracting.current = null
    if (canvasRef.current) canvasRef.current.style.cursor = "grab"
    isPausedRef.current = false
  }, [])

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove, { passive: true })
    window.addEventListener("pointerup", handlePointerUp, { passive: true })
    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }
  }, [handlePointerMove, handlePointerUp])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    let globe: ReturnType<typeof createGlobe> | null = null
    let animationId: number
    let phi = 0

    function init() {
      const width = canvas.offsetWidth
      if (width === 0 || globe) return

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width,
        height: width,
        phi: 0,
        theta: 0.15,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [0.1, 0.1, 0.12],
        markerColor: [0.87, 0.11, 0.11],
        glowColor: [0.87, 0.11, 0.11],
        markerElevation: 0.015,
        markers: markers.map((m) => ({ location: m.location, size: 0.03, id: m.id })),
        arcs: arcs.map((a) => ({ from: a.from, to: a.to, id: a.id })),
        arcColor: [0.87, 0.11, 0.11] as [number, number, number],
        arcWidth: 0.6,
        arcHeight: 0.3,
        opacity: 0.6,
      })

      function animate() {
        if (!isPausedRef.current) {
          phi += 0.003
          dragOffset.current = {
            phi: dragOffset.current.phi * 0.9,
            theta: dragOffset.current.theta * 0.9,
          }
        }
        if (globe) {
          globe.update({ phi: phi + phiOffsetRef.current + dragOffset.current.phi, theta: 0.15 + thetaOffsetRef.current + dragOffset.current.theta })
        }
        animationId = requestAnimationFrame(animate)
      }
      animate()
    }

    const timeout = setTimeout(init, 100)

    return () => {
      clearTimeout(timeout)
      if (animationId) cancelAnimationFrame(animationId)
      if (globe) globe.destroy()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      style={{ width: "100%", aspectRatio: "1/1", cursor: "grab", contain: "layout paint" }}
    />
  )
}

export function GlobeSection() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const countries = [
    { name: "إيطاليا", fabric: "جورجيت", flag: "🇮🇹", detail: "أجود أنواع الجورجيت الإيطالي" },
    { name: "فرنسا", fabric: "حرير", flag: "🇫🇷", detail: "حرير طبيعي فاخر" },
    { name: "تركيا", fabric: "كريب", flag: "🇹🇷", detail: "كريب مزدوج عالي الجودة" },
    { name: "الصين", fabric: "شيفون", flag: "🇨🇳", detail: "شيفون متعدد الطبقات" },
    { name: "الإمارات", fabric: "ستان", flag: "🇦🇪", detail: "ستان ملكي أنيق" },
    { name: "الهند", fabric: "قطن", flag: "🇮🇳", detail: "قطن مصري ناعم" },
    { name: "كوريا", fabric: "صيني", flag: "🇰🇷", detail: "أقمشة صينية مختارة" },
  ]

  return (
    <section className="py-16 md:py-24 relative">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            أقمشتنا من <span className="text-brand">كل أنحاء العالم</span>
          </h2>
          <p className="text-sm text-white/50 max-w-2xl mx-auto leading-relaxed">
            نستورد أجود الأقمشة العالمية من ٧ دول لتصنع لكِ عباية تجمع بين الفخامة والأصالة
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Globe */}
          <div className="flex justify-center">
            {mounted && (
              <div className="w-full max-w-[400px]">
                <GlobeCanvas />
              </div>
            )}
          </div>

          {/* Countries list */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {countries.map((c, i) => (
              <div
                key={i}
                className="glass-card p-4 rounded-2xl hover:bg-white/[0.06] transition-all duration-300 group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{c.flag}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{c.name}</h3>
                    <p className="text-[10px] text-brand font-medium">{c.fabric}</p>
                  </div>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">{c.detail}</p>
                <div className="mt-2 flex items-center gap-1 text-[9px] text-white/30 group-hover:text-brand transition-colors">
                  <span>←</span>
                  <span>يصل إلى ليبيا</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 glass-card px-6 py-3 rounded-full">
            <span className="text-xs text-white/40">من</span>
            <span className="text-xs font-bold text-white">٧ دول</span>
            <span className="text-xs text-white/40">إلى</span>
            <span className="text-xs font-bold text-brand">ليبيا</span>
            <span className="text-xs text-white/40">—</span>
            <span className="text-xs text-white/50">صُنعت بكل حب</span>
          </div>
        </div>
      </div>
    </section>
  )
}
