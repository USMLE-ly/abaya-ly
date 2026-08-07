import { useEffect, useRef, useState } from "react"
import createGlobe from "cobe"

const LIBYA: [number, number] = [32.9022, 13.1800]

const fabricCountries = [
  { name: "إيطاليا", clothes: "فساتين سهرة", flag: "🇮🇹", detail: "فساتين سهرة فاخرة بالجورجيت الإيطالي", lat: 45.4642, lng: 9.19 },
  { name: "فرنسا", clothes: "فساتين حرير", flag: "🇫🇷", detail: "فساتين حرير طبيعي فاخرة", lat: 48.8566, lng: 2.3522 },
  { name: "تركيا", clothes: "فساتين كريب", flag: "🇹🇷", detail: "فساتين كريب مزدوج عالية الجودة", lat: 41.0082, lng: 28.9784 },
  { name: "الصين", clothes: "فساتين شيفون", flag: "🇨🇳", detail: "فساتين شيفون متعدد الطبقات", lat: 31.2304, lng: 121.4737 },
  { name: "الإمارات", clothes: "فساتين ستان", flag: "🇦🇪", detail: "فساتين ستان ملكية أنيقة", lat: 25.2048, lng: 55.2708 },
  { name: "الهند", clothes: "فساتين قطن", flag: "🇮🇳", detail: "فساتين قطن مصري ناعمة", lat: 19.076, lng: 72.8777 },
  { name: "كوريا", clothes: "فساتين مختارة", flag: "🇰🇷", detail: "فساتين صينية مختارة بعناية", lat: 37.5665, lng: 126.978 },
]

function GlobeCanvas() {
  const mountRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // Clean previous cobe wrapper divs
    while (mount.firstChild) {
      mount.removeChild(mount.firstChild)
    }

    const canvas = document.createElement("canvas")
    canvas.style.cursor = "grab"
    canvas.style.display = "block"
    canvas.style.margin = "0 auto"
    mount.appendChild(canvas)

    const size = Math.min(420, mount.clientWidth || 420)
    const dpr = Math.min(window.devicePixelRatio, 2)

    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`

    let destroyed = false
    let phi = 0
    let autoRotateSpeed = 0.004
    let mouseX = 0
    let mouseY = 0
    let isHovering = false
    let targetTheta = 0.15
    let currentTheta = 0.15

    // Smooth mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    }

    const handleMouseEnter = () => { isHovering = true }
    const handleMouseLeave = () => {
      isHovering = false
      mouseX = 0
      mouseY = 0
    }

    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseenter", handleMouseEnter)
    canvas.addEventListener("mouseleave", handleMouseLeave)

    try {
      const globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: size * dpr,
        height: size * dpr,
        phi: 0,
        theta: 0.15,
        dark: 1,
        diffuse: 1.4,
        mapSamples: 28000,
        mapBrightness: 8,
        baseColor: [0.06, 0.12, 0.22],
        markerColor: [0.88, 0.11, 0.39],
        glowColor: [0.88, 0.11, 0.39],
        opacity: 1,
        markers: fabricCountries.map((c, i) => ({
          location: [c.lat, c.lng] as [number, number],
          size: 0.04,
          id: `country-${i}`,
        })),
        arcs: fabricCountries.map((c, i) => ({
          from: [c.lat, c.lng] as [number, number],
          to: LIBYA,
          id: `arc-${i}`,
        })),
        arcColor: [0.88, 0.11, 0.39] as [number, number, number],
        arcWidth: 0.5,
        arcHeight: 0.4,
      })

      if (!destroyed) setReady(true)

      const animate = () => {
        if (destroyed) return

        // Smooth auto-rotation
        phi += autoRotateSpeed

        // Smooth mouse-follow theta
        if (isHovering) {
          targetTheta = 0.15 + mouseY * 0.15
        } else {
          targetTheta = 0.15
        }
        currentTheta += (targetTheta - currentTheta) * 0.04

        globe.update({
          phi,
          theta: currentTheta,
          // Slow down rotation on hover for premium feel
          ...(isHovering ? { mapBrightness: 10 } : { mapBrightness: 8 }),
        })

        requestAnimationFrame(animate)
      }
      animate()

      return () => {
        destroyed = true
        globe.destroy()
        canvas.removeEventListener("mousemove", handleMouseMove)
        canvas.removeEventListener("mouseenter", handleMouseEnter)
        canvas.removeEventListener("mouseleave", handleMouseLeave)
      }
    } catch (e) {
      console.error("Globe error:", e)
    }

    return () => {
      destroyed = true
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseenter", handleMouseEnter)
      canvas.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{
        width: "100%",
        maxWidth: 420,
        aspectRatio: "1 / 1",
        opacity: ready ? 1 : 0,
        transition: "opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    />
  )
}

export function GlobeSection() {
  return (
    <section className="py-16 md:py-24 relative">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-fg mb-3">
            ملابسنا من <span className="text-accent-brand">كل أنحاء العالم</span>
          </h2>
          <p className="text-sm text-fg/50 max-w-2xl mx-auto leading-relaxed">
            جورجيت إيطالي. حرير فرنسي. كريب تركي. نختار الخامة من مصدرها، ونفصّلها عندنا.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center" style={{ direction: "rtl" }}>
          <div className="flex justify-center lg:justify-end">
            <GlobeCanvas />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {fabricCountries.map((c, i) => (
              <div key={i} className="glass-card p-4 rounded-2xl hover:bg-surface-inverse/5 transition-all duration-300 group">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{c.flag}</span>
                  <div>
                    <h3 className="text-sm font-bold text-fg">{c.name}</h3>
                    <p className="text-[10px] text-accent-brand font-medium">{c.clothes}</p>
                  </div>
                </div>
                <p className="text-[10px] text-fg/40 leading-relaxed">{c.detail}</p>
                <div className="mt-2 flex items-center gap-1 text-[9px] text-fg/30 group-hover:text-accent-brand transition-colors">
                  <span>تصل إلى ليبيا</span>
                  <span>←</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 glass-card px-6 py-3 rounded-full">
            <span className="text-xs text-fg/40">من</span>
            <span className="text-xs font-bold text-fg">٧ دول</span>
            <span className="text-xs text-fg/40">إلى</span>
            <span className="text-xs font-bold text-accent-brand">ليبيا</span>
          </div>
        </div>
      </div>
    </section>
  )
}
