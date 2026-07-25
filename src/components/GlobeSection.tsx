import { useEffect, useRef, useState, useCallback } from "react"
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

function latLngToVector3(lat: number, lng: number, radius: number): [number, number, number] {
  const latRad = (lat * Math.PI) / 180
  const lngRad = (lng * Math.PI) / 180
  return [
    radius * Math.cos(latRad) * Math.cos(lngRad),
    radius * Math.cos(latRad) * Math.sin(lngRad),
    radius * Math.sin(latRad),
  ]
}

function project(
  x: number, y: number, z: number,
  phi: number, theta: number,
  width: number, height: number
): { x: number; y: number; visible: boolean } {
  const cosPhi = Math.cos(phi)
  const sinPhi = Math.sin(phi)
  let rx = x * cosPhi - z * sinPhi
  let rz = x * sinPhi + z * cosPhi
  let ry = y

  const cosTheta = Math.cos(theta)
  const sinTheta = Math.sin(theta)
  let ry2 = ry * cosTheta - rz * sinTheta
  let rz2 = ry * sinTheta + rz * cosTheta

  const visible = rz2 > 0
  const perspective = 2.5
  const scale = perspective / (perspective + rz2 / 500)

  return {
    x: width / 2 + rx * scale * 0.4,
    y: height / 2 - ry2 * scale * 0.4,
    visible,
  }
}

const SIZE = 400

function GlobeCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phiRef = useRef(0)
  const [ready, setReady] = useState(false)
  const [labelPositions, setLabelPositions] = useState(
    fabricCountries.map(() => ({ x: 50, y: 50, visible: false }))
  )

  const theta = 0.15

  const updateLabels = useCallback(() => {
    const phi = phiRef.current
    const positions = fabricCountries.map((c) => {
      const [x, y, z] = latLngToVector3(c.lat, c.lng, 195)
      const projected = project(x, y, z, phi, theta, SIZE, SIZE)
      return {
        x: (projected.x / SIZE) * 100,
        y: (projected.y / SIZE) * 100,
        visible: projected.visible,
      }
    })
    setLabelPositions(positions)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return

    const dpr = Math.min(window.devicePixelRatio, 2)
    canvas.width = SIZE * dpr
    canvas.height = SIZE * dpr
    canvas.style.width = `${SIZE}px`
    canvas.style.height = `${SIZE}px`

    let destroyed = false

    try {
      const globe = createGlobe(canvas, {
        devicePixelRatio: dpr,
        width: SIZE * dpr,
        height: SIZE * dpr,
        phi: 0,
        theta: theta,
        dark: 1,
        diffuse: 1.2,
        mapSamples: 16000,
        mapBrightness: 6,
        baseColor: [0.1, 0.1, 0.12],
        opacity: 0.6,
        arcs: fabricCountries.map((c, i) => ({
          from: [c.lat, c.lng] as [number, number],
          to: LIBYA,
          id: `arc-${i}`,
        })),
        arcColor: [0.79, 0.39, 0.26],
        arcWidth: 0.6,
        arcHeight: 0.3,
      })

      setReady(true)

      const animate = () => {
        if (destroyed) return
        phiRef.current += 0.003
        globe.update({ phi: phiRef.current })
        updateLabels()
        requestAnimationFrame(animate)
      }
      animate()

      return () => { destroyed = true; globe.destroy() }
    } catch {
      return () => { destroyed = true }
    }
  }, [updateLabels])

  return (
    <div ref={wrapRef} className="flex justify-center items-center" style={{ width: Math.min(SIZE, 400), height: Math.min(SIZE, 400), maxWidth: "100%", aspectRatio: "1/1", position: "relative" }}>
      <canvas
        ref={canvasRef}
        style={{ cursor: "grab", opacity: ready ? 1 : 0, transition: "opacity 0.5s ease" }}
      />
      <div className="absolute inset-0 pointer-events-none" style={{ overflow: "hidden" }}>
        {fabricCountries.map((c, i) => (
          <div
            key={i}
            data-label
            className="absolute whitespace-nowrap text-[10px] font-bold text-foreground/80 px-2 py-0.5 rounded-full bg-white/80 backdrop-blur-sm border border-black/10"
            style={{
              left: `${labelPositions[i].x}%`,
              top: `${labelPositions[i].y}%`,
              transform: "translate(-50%, -100%)",
              opacity: labelPositions[i].visible ? 1 : 0,
              transition: "opacity 0.3s ease",
              textShadow: "0 1px 4px rgba(0,0,0,0.15)",
              zIndex: 20,
            }}
          >
            {c.flag} {c.name}
          </div>
        ))}
      </div>
    </div>
  )
}

export function GlobeSection() {
  return (
    <section className="py-16 md:py-24 relative">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            ملابسنا من <span className="text-primary">كل أنحاء العالم</span>
          </h2>
          <p className="text-sm text-foreground/50 max-w-2xl mx-auto leading-relaxed">
            نستقبل أجود الملابس العالمية من ٧ دول لتصنع لكِ عباية تجمع بين الفخامة والأصالة
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="flex justify-center lg:justify-start">
            <GlobeCanvas />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {fabricCountries.map((c, i) => (
              <div key={i} className="glass-card p-4 rounded-2xl hover:bg-black/5 transition-all duration-300 group">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{c.flag}</span>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{c.name}</h3>
                    <p className="text-[10px] text-primary font-medium">{c.clothes}</p>
                  </div>
                </div>
                <p className="text-[10px] text-foreground/40 leading-relaxed">{c.detail}</p>
                <div className="mt-2 flex items-center gap-1 text-[9px] text-foreground/30 group-hover:text-primary transition-colors">
                  <span>←</span>
                  <span>تصل إلى ليبيا</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 glass-card px-6 py-3 rounded-full">
            <span className="text-xs text-foreground/40">من</span>
            <span className="text-xs font-bold text-foreground">٧ دول</span>
            <span className="text-xs text-foreground/40">إلى</span>
            <span className="text-xs font-bold text-primary">ليبيا</span>
          </div>
        </div>
      </div>
    </section>
  )
}
