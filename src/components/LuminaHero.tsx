import { useEffect, useRef, useState } from "react";

declare const gsap: any;
declare const THREE: any;

const SLIDES = [
  {
    media: "/images/hero/abaya-gold-1.jpg",
    title: "عباية السهرة الذهبية",
    description: "مصنوعة من الجورجيت الإيطالي الفاخر مع تطريز يدوي بخيوط ذهبية أصيلة",
    accent: "#c9a84c",
    subtitle: "مجموعة السهرة الفاخرة",
  },
  {
    media: "/images/hero/abaya-gold-2.jpg",
    title: "الفخامة الليبية",
    description: "أقمشة عالمية من إيطاليا وفرنسا وتركيا — صُنعت لكل امرأة تستحق الأفضل",
    accent: "#dd1d1d",
    subtitle: "تشكيلة ٢٠٢٥",
  },
];

const vertexShader = `
varying vec2 vUv;
void main(){
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const fragmentShader = `
precision highp float;
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform vec2 uResolution;
uniform float uProgress;
uniform float uTime;
uniform float uEffectType;
uniform float uGlassRefractionStrength;
uniform float uGlassChromaticAberration;
uniform float uGlassBubbleClarity;
uniform float uGlassEdgeGlow;
uniform float uGlassLiquidFlow;
uniform float uFrostIntensity;
uniform float uFrostCrystalSize;
uniform float uFrostIceCoverage;
uniform float uFrostTemperature;
uniform float uFrostTexture;
uniform float uRippleFrequency;
uniform float uRippleAmplitude;
uniform float uRippleWaveSpeed;
uniform float uRippleRippleCount;
uniform float uRippleDecay;
uniform float uPlasmaIntensity;
uniform float uPlasmaSpeed;
uniform float uPlasmaEnergyIntensity;
uniform float uPlasmaContrastBoost;
uniform float uPlasmaTurbulence;
uniform float uTimeshiftDistortion;
uniform float uTimeshiftBlur;
uniform float uTimeshiftFlow;
uniform float uTimeshiftChromatic;
uniform float uTimeshiftTurbulence;
varying vec2 vUv;

float hash(vec2 p){
  vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973));
  p3+=dot(p3,p3.yzx+33.33);
  return fract((p3.x+p3.y)*p3.z);
}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);
  f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}

vec4 glassTransition(vec2 uv,float progress){
  vec2 center=vec2(0.5);
  vec2 toCenter=uv-center;
  float dist=length(toCenter);
  float angle=atan(toCenter.y,toCenter.x);
  float time=uTime*0.5*uGlassLiquidFlow;
  float distortion=dist*uGlassRefractionStrength;
  float bubble=sin(angle*6.28*uGlassBubbleClarity+time)*0.02*uGlassRefractionStrength;
  vec2 offset=normalize(toCenter)*(distortion*progress*0.15+bubble*progress);
  offset+=vec2(sin(uv.y*20.0+time),cos(uv.x*20.0+time))*0.005*uGlassLiquidFlow;
  vec2 uv1=uv+offset*progress;
  vec2 uv2=uv-offset*(1.0-progress);
  vec4 col1=texture2D(uTexture1,uv1);
  vec4 col2=texture2D(uTexture2,uv2);
  float edge=smoothstep(0.0,0.4,dist)*smoothstep(1.0,0.6,dist);
  float edgeGlow=edge*uGlassEdgeGlow;
  vec3 caOffset=vec3(uGlassChromaticAberration*0.003,0.0,-uGlassChromaticAberration*0.003);
  col1.r=texture2D(uTexture1,uv1+caOffset.rg).r;
  col1.b=texture2D(uTexture1,uv1+caOffset.bg).b;
  col2.r=texture2D(uTexture2,uv2+caOffset.rg).r;
  col2.b=texture2D(uTexture2,uv2+caOffset.bg).b;
  float blend=smoothstep(0.3,0.7,progress+edgeGlow*0.2);
  vec4 result=mix(col1,col2,blend);
  result.rgb+=edgeGlow*vec3(0.9,0.95,1.0)*0.15;
  return result;
}

vec4 frostTransition(vec2 uv,float progress){
  vec4 col1=texture2D(uTexture1,uv);
  vec4 col2=texture2D(uTexture2,uv);
  float t=progress;
  float crystalScale=uFrostCrystalSize*15.0;
  float n1=noise(uv*crystalScale);
  float n2=noise(uv*crystalScale*2.0+vec2(100.0));
  float n3=noise(uv*crystalScale*0.5+vec2(200.0));
  float crystalPattern=n1*0.5+n2*0.3+n3*0.2;
  float temperature=smoothstep(0.2,0.8,crystalPattern*uFrostTemperature);
  float frost=smoothstep(t-0.2*uFrostTexture,t+0.1*uFrostTexture,crystalPattern*uFrostIceCoverage);
  frost*=uFrostIntensity;
  vec4 result=mix(col1,col2,frost);
  result.rgb=mix(result.rgb,vec3(0.85,0.92,1.0),frost*0.2*temperature);
  float sparkle=step(0.98,noise(uv*100.0+uTime))*frost*0.3;
  result.rgb+=vec3(sparkle);
  return result;
}

vec4 rippleTransition(vec2 uv,float progress){
  vec2 center=vec2(0.5);
  float dist=length(uv-center)*uRippleFrequency;
  float angle=atan(uv.y-center.y,uv.x-center.x);
  float wave=sin(dist*6.28-uTime*uRippleWaveSpeed*2.0)*uRippleAmplitude;
  wave+=sin(angle*uRippleRippleCount+uTime*uRippleWaveSpeed)*uRippleAmplitude*0.5;
  float rippleMask=smoothstep(progress-0.3*uRippleDecay,progress+0.1*uRippleDecay,0.5+wave);
  vec2 uv1=uv+normalize(uv-center)*wave*progress*0.05;
  vec2 uv2=uv-normalize(uv-center)*wave*(1.0-progress)*0.05;
  vec4 col1=texture2D(uTexture1,uv1);
  vec4 col2=texture2D(uTexture2,uv2);
  vec4 result=mix(col1,col2,rippleMask);
  float foam=smoothstep(0.48,0.52,0.5+wave)*smoothstep(progress-0.2,progress,0.5+wave)*0.15;
  result.rgb+=vec3(foam);
  return result;
}

vec4 plasmaTransition(vec2 uv,float progress){
  vec4 col1=texture2D(uTexture1,uv);
  vec4 col2=texture2D(uTexture2,uv);
  float t=progress;
  float plasmaVal=0.0;
  for(float i=1.0;i<=4.0;i++){
    float freq=i*uPlasmaTurbulence;
    plasmaVal+=sin(uv.x*freq+uTime*uPlasmaSpeed)/(freq*2.0);
    plasmaVal+=cos(uv.y*freq+uTime*uPlasmaSpeed*0.7)/(freq*2.0);
  }
  plasmaVal=plasmaVal*uPlasmaIntensity*0.5+0.5;
  plasmaVal=pow(plasmaVal,1.0+uPlasmaContrastBoost);
  float energy=smoothstep(0.3,0.7,plasmaVal)*uPlasmaEnergyIntensity;
  float blend=smoothstep(0.2,0.8,t+plasmaVal*0.3);
  vec4 result=mix(col1,col2,blend);
  result.rgb+=energy*vec3(0.87,0.11,0.11)*0.3;
  float glow=smoothstep(0.45,0.55,plasmaVal)*smoothstep(t-0.15,t,0.5)*smoothstep(t+0.15,t,0.5);
  result.rgb+=glow*vec3(1.0,0.85,0.3)*0.2;
  return result;
}

vec4 timeshiftTransition(vec2 uv,float progress){
  vec4 col1=texture2D(uTexture1,uv);
  vec4 col2=texture2D(uTexture2,uv);
  float t=progress;
  vec2 flow=vec2(sin(uv.y*5.0+uTime*0.5)*uTimeshiftFlow*0.02,cos(uv.x*5.0+uTime*0.3)*uTimeshiftFlow*0.02);
  vec2 uv1=uv+flow*t;
  vec2 uv2=uv-flow*(1.0-t);
  col1=texture2D(uTexture1,uv1);
  col2=texture2D(uTexture2,uv2);
  float dist=length(uv-vec2(0.5));
  float distortion=dist*uTimeshiftDistortion;
  vec2 distortUV=uv+normalize(uv-vec2(0.5))*distortion*(sin(t*6.28)*0.1);
  col1=texture2D(uTexture1,distortUV);
  col2=texture2D(uTexture2,distortUV);
  float noiseVal=noise(uv*10.0+uTime*uTimeshiftTurbulence);
  float chromatic=uTimeshiftChromatic*0.005;
  vec3 ca=vec3(texture2D(uTexture1,uv1+vec2(chromatic,0.0)).r,col1.g,texture2D(uTexture1,uv1-vec2(chromatic,0.0)).b);
  float blend=smoothstep(0.3,0.7,t+noiseVal*0.2);
  vec4 result=mix(vec4(ca,col1.a),col2,blend);
  result.rgb+=noiseVal*0.05;
  return result;
}

void main(){
  vec2 uv=vUv;
  float p=uProgress;
  if(p<=0.001){gl_FragColor=texture2D(uTexture1,uv);return;}
  if(p>=0.999){gl_FragColor=texture2D(uTexture2,uv);return;}
  vec4 result;
  if(uEffectType<0.5){result=glassTransition(uv,p);}
  else if(uEffectType<1.5){result=frostTransition(uv,p);}
  else if(uEffectType<2.5){result=rippleTransition(uv,p);}
  else if(uEffectType<3.5){result=plasmaTransition(uv,p);}
  else{result=timeshiftTransition(uv,p);}
  result.rgb+=hash(uv+uTime)*0.01;
  gl_FragColor=result;
}`;

export default function LuminaHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const currentSlideRef = useRef(0);
  const progressRef = useRef(0);
  const goToSlideRef = useRef<(idx: number) => void>(() => {});

  useEffect(() => {
    const loadScript = (src: string, globalName: string) =>
      new Promise<void>((res, rej) => {
        if ((window as any)[globalName]) { res(); return; }
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          const check = setInterval(() => { if ((window as any)[globalName]) { clearInterval(check); res(); } }, 50);
          setTimeout(() => { clearInterval(check); rej(); }, 10000);
          return;
        }
        const s = document.createElement("script");
        s.src = src;
        s.onload = () => setTimeout(() => res(), 100);
        s.onerror = () => rej();
        document.head.appendChild(s);
      });

    let renderer: any, scene: any, camera: any, shaderMaterial: any;
    let currentSlide = 0, isTransitioning = false;
    let autoSlideTimer: ReturnType<typeof setTimeout> | null = null;
    let timeVal = 0;
    let animFrame: number;
    const SLIDE_DURATION = 6000;
    const TRANSITION_DURATION = 2500;

    const splitText = (text: string) =>
      text.split(" ").map((w) => `<span class="word"><span class="word-inner">${w}</span></span>`).join(" ");

    function goToSlide(idx: number) {
      if (isTransitioning || idx === currentSlide) return;
      isTransitioning = true;
      progressRef.current = 0;

      const tEl = document.getElementById("mainTitle");
      const dEl = document.getElementById("mainDesc");
      if (tEl && dEl) {
        gsap.to(tEl.children, { y: -20, opacity: 0, duration: 0.4, stagger: 0.02, ease: "power2.in" });
        gsap.to(dEl, { y: -10, opacity: 0, duration: 0.3, ease: "power2.in" });
        setTimeout(() => {
          tEl.innerHTML = splitText(SLIDES[idx].title);
          dEl.textContent = SLIDES[idx].description;
          gsap.fromTo(tEl.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.03, ease: "power3.out" });
          gsap.fromTo(dEl, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.2 });
        }, 400);
      }

      setActiveIdx(idx);

      const start = performance.now();
      function animateTransition(now: number) {
        const elapsed = now - start;
        progressRef.current = Math.min(elapsed / TRANSITION_DURATION, 1);
        shaderMaterial.uniforms.uProgress.value = progressRef.current;
        if (progressRef.current < 1) {
          requestAnimationFrame(animateTransition);
        } else {
          currentSlide = idx;
          currentSlideRef.current = idx;
          shaderMaterial.uniforms.uTexture1.value = shaderMaterial.uniforms.uTexture2.value;
          shaderMaterial.uniforms.uProgress.value = 0;
          progressRef.current = 0;
          isTransitioning = false;
          startAutoSlide();
        }
      }
      requestAnimationFrame(animateTransition);
    }
    goToSlideRef.current = goToSlide;

    function startAutoSlide() {
      stopAutoSlide();
      autoSlideTimer = setTimeout(() => {
        if (!isTransitioning) goToSlide((currentSlideRef.current + 1) % SLIDES.length);
      }, SLIDE_DURATION);
    }

    function stopAutoSlide() {
      if (autoSlideTimer) { clearTimeout(autoSlideTimer); autoSlideTimer = null; }
    }

    function loadImageTexture(src: string): Promise<any> {
      return new Promise((resolve, reject) => {
        new THREE.TextureLoader().load(src, (tex: any) => {
          tex.minFilter = THREE.LinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.userData = { size: new THREE.Vector2(tex.image.width, tex.image.height) };
          resolve(tex);
        }, undefined, reject);
      });
    }

    const init = async () => {
      try {
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js", "gsap");
        await loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js", "THREE");
      } catch { return; }

      const canvas = containerRef.current?.querySelector(".webgl-canvas") as HTMLCanvasElement;
      if (!canvas) return;

      renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      scene = new THREE.Scene();
      camera = new THREE.Camera();

      shaderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uTexture1: { value: null }, uTexture2: { value: null },
          uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          uProgress: { value: 0 }, uTime: { value: 0 }, uEffectType: { value: 0.0 },
          uGlassRefractionStrength: { value: 1.0 }, uGlassChromaticAberration: { value: 1.0 },
          uGlassBubbleClarity: { value: 1.0 }, uGlassEdgeGlow: { value: 1.0 }, uGlassLiquidFlow: { value: 1.0 },
          uFrostIntensity: { value: 1.5 }, uFrostCrystalSize: { value: 1.0 }, uFrostIceCoverage: { value: 1.0 },
          uFrostTemperature: { value: 1.0 }, uFrostTexture: { value: 1.0 },
          uRippleFrequency: { value: 25.0 }, uRippleAmplitude: { value: 0.08 }, uRippleWaveSpeed: { value: 1.0 },
          uRippleRippleCount: { value: 1.0 }, uRippleDecay: { value: 1.0 },
          uPlasmaIntensity: { value: 1.2 }, uPlasmaSpeed: { value: 0.8 }, uPlasmaEnergyIntensity: { value: 0.4 },
          uPlasmaContrastBoost: { value: 0.3 }, uPlasmaTurbulence: { value: 1.0 },
          uTimeshiftDistortion: { value: 1.6 }, uTimeshiftBlur: { value: 1.5 }, uTimeshiftFlow: { value: 1.4 },
          uTimeshiftChromatic: { value: 1.5 }, uTimeshiftTurbulence: { value: 1.4 },
        },
        vertexShader, fragmentShader,
      });

      scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), shaderMaterial));

      const textures = await Promise.all(SLIDES.map((s) => loadImageTexture(s.media)));
      if (textures.length >= 2) {
        shaderMaterial.uniforms.uTexture1.value = textures[0];
        shaderMaterial.uniforms.uTexture2.value = textures[1];
        containerRef.current?.classList.add("loaded");
        startAutoSlide();
      }

      const tEl = document.getElementById("mainTitle");
      const dEl = document.getElementById("mainDesc");
      if (tEl && dEl) {
        tEl.innerHTML = splitText(SLIDES[0].title);
        dEl.textContent = SLIDES[0].description;
        gsap.fromTo(tEl.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.03, ease: "power3.out", delay: 0.5 });
        gsap.fromTo(dEl, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.8 });
      }

      const render = () => {
        animFrame = requestAnimationFrame(render);
        timeVal += 0.016;
        shaderMaterial.uniforms.uTime.value = timeVal;
        renderer.render(scene, camera);
      };
      render();

      const onResize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        shaderMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
      };
      window.addEventListener("resize", onResize);

      return () => {
        window.removeEventListener("resize", onResize);
        stopAutoSlide();
        cancelAnimationFrame(animFrame);
        renderer.dispose();
      };
    };

    init();
  }, []);

  return (
    <div className="relative w-full h-[70vh] md:h-[88vh] overflow-hidden bg-black">
      {/* ── WebGL Canvas (Lumina shaders) ── */}
      <main className="slider-wrapper loaded absolute inset-0" ref={containerRef}>
        <canvas className="webgl-canvas" />
      </main>

      {/* ── Dark gradient for readability ── */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/70 via-black/10 to-black/30 pointer-events-none" />

      {/* ── ElegantCarousel overlay (glassmorphism) ── */}
      <div className="absolute inset-0 z-10 flex flex-col justify-end">
        <div className="max-w-[1400px] mx-auto w-full px-4 md:px-10 pb-8">
          <div className="flex items-end justify-between gap-6">
            {/* Left: slide info + text */}
            <div className="flex-1">
              {/* Counter */}
              <div className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl px-5 py-3 mb-4">
                <span className="text-xs font-bold tracking-wider text-white/40">
                  {String(activeIdx + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
                </span>
                <span className="w-px h-3 bg-white/15" />
                <span className="text-xs text-white/50">الملكة</span>
              </div>

              {/* Title (GSAP animated) */}
              <h1 className="slide-title !text-left !mb-2" id="mainTitle-overlay" style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }} />

              {/* Subtitle */}
              <p className="text-sm font-medium mb-2" style={{ color: SLIDES[activeIdx].accent }}>
                {SLIDES[activeIdx].subtitle}
              </p>

              {/* Description in glass card */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl px-5 py-3 max-w-md">
                <p className="slide-description !text-left !text-sm !text-white/60" id="mainDesc-overlay" />
              </div>

              {/* CTA + Nav arrows */}
              <div className="flex items-center gap-4 mt-4">
                <a href="/collections" className="px-7 py-3 rounded-full text-sm font-semibold text-white transition-all duration-300 hover:scale-105" style={{ backgroundColor: SLIDES[activeIdx].accent }}>
                  اكتشفي المجموعة
                </a>
                <div className="flex gap-1.5 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl p-1.5">
                  <button onClick={() => goToSlideRef.current((activeIdx - 1 + SLIDES.length) % SLIDES.length)} className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08] transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                  </button>
                  <button onClick={() => goToSlideRef.current((activeIdx + 1) % SLIDES.length)} className="w-9 h-9 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/[0.08] transition-all">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Right: nav dots in glass */}
            <div className="hidden md:flex flex-col gap-2 items-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl px-3 py-4">
              {SLIDES.map((slide, i) => (
                <button key={i} onClick={() => goToSlideRef.current(i)} className="group" aria-label={`Slide ${i + 1}`}>
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIdx ? "w-6" : "w-1.5 bg-white/20 group-hover:bg-white/40"}`} style={i === activeIdx ? { backgroundColor: slide.accent } : undefined} />
                </button>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-px w-full rounded-full bg-white/[0.06] overflow-hidden">
            <div className="h-full rounded-full transition-none" style={{ width: `${progressRef.current * 100}%`, backgroundColor: SLIDES[activeIdx].accent }} />
          </div>
        </div>
      </div>
    </div>
  );
}
