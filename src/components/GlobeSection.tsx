import { useEffect, useRef, useState } from "react"
import createGlobe from "cobe"

const LIBYA: [number, number] = [32.9022, 13.1800]

const fabricCountries = [
  { name: "إيطاليا", fabric: "جورجيت", flag: "🇮🇹", detail: "أجود أنواع الجورجيت الإيطالي", lat: 45.4642, lng: 9.19 },
  { name: "فرنسا", fabric: "حرير", flag: "🇫🇷", detail: "حرير طبيعي فاخر", lat: 48.8566, lng: 2.3522 },
  { name: "تركيا", fabric: "كريب", flag: "🇹🇷", detail: "كريب مزدوج عالي الجودة", lat: 41.0082, lng: 28.9784 },
  { name: "الصين", fabric: "شيفون", flag: "🇨🇳", detail: "شيفون متعدد الطبقات", lat: 31.2304, lng: 121.4737 },
  { name: "الإمارات", fabric: "ستان", flag: "🇦🇪", detail: "ستان ملكي أنيق", lat: 25.2048, lng: 55.2708 },
  { name: "الهند", fabric: "قطن", flag: "🇮🇳", detail: "قطن مصري ناعم", lat: 19.076, lng: 72.8777 },
  { name: "كوريا", fabric: "صيني", flag: "🇰🇷", detail: "أقمشة صينية مختارة", lat: 37.5665, lng: 126.978 },
]

const GLOBE_SIZE = 400

function GlobeCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 2
    canvas.width = GLOBE_SIZE * dpr
    canvas.height = GLOBE_SIZE * dpr
    canvas.style.width = `${GLOBE_SIZE}px`
    canvas.style.height = `${GLOBE_SIZE}px`

    let phi = 0
    let destroyed = false

    try {
      const globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: GLOBE_SIZE * dpr,
        height: GLOBE_SIZE * dpr,
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
        opacity: 0.6,
        markers: fabricCountries.map((c) => ({
          location: [c.lat, c.lng] as [number, number],
          size: 0.03,
        })),
        arcs: fabricCountries.map((c, i) => ({
          from: [c.lat, c.lng] as [number, number],
          to: LIBYA,
          id: `arc-${i}`,
        })),
        arcColor: [0.87, 0.11, 0.11],
        arcWidth: 0.6,
        arcHeight: 0.3,
      })

      setIsReady(true)

      const animate = () => {
        if (destroyed) return
        phi += 0.003
        globe.update({ phi })
        requestAnimationFrame(animate)
      }
      animate()

      return () => {
        destroyed = true
        globe.destroy()
      }
    } catch {
      setError(true)
      return () => { destroyed = true }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="flex justify-center items-center"
      style={{ width: GLOBE_SIZE, height: GLOBE_SIZE, maxWidth: "100%" }}
    >
      {error ? (
        <div className="text-center text-white/40 text-sm">
          <p>كرة الأرض غير متاحة</p>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          style={{
            cursor: "grab",
            opacity: isReady ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        />
      )}
    </div>
  )
}

export function GlobeSection() {
  return (
    <section className="py-16 md:py-24 relative">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            أقمشتنا من <span className="text-brand">كل أنحاء العالم</span>
          </h2>
          <p className="text-sm text-white/50 max-w-2xl mx-auto leading-relaxed">
            نستورد أجود الأقمشة العالمية من ٧ دول لتصنع لكِ عباية تجمع بين الفخامة والأصالة
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <GlobeCanvas />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {fabricCountries.map((c, i) => (
              <div key={i} className="glass-card p-4 rounded-2xl hover:bg-white/[0.06] transition-all duration-300 group">
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
