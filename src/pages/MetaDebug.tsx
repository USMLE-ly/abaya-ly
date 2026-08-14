import { useEffect, useState } from "react";
import { PageTransition } from "@/components/PageTransition";
import { usePageMeta } from "@/lib/usePageMeta";
import {
  getMetaDebugEvents,
  isMetaDebug,
  setMetaDebug,
  pixelTrack,
  PIXEL_IDS,
  PIXEL_CURRENCY,
  type MetaDebugEvent,
} from "@/lib/meta-pixel";
import { trackLead, trackPurchase } from "@/lib/analytics";

interface CapiStatus {
  configured: boolean;
  pixels: string[];
  events: string[];
  dedupWindowHours: number;
}

export function MetaDebug() {
  usePageMeta("Meta QA", "فحص أحداث Meta Pixel و Conversions API");
  return (
    <PageTransition>
      <MetaDebugContent />
    </PageTransition>
  );
}

function MetaDebugContent() {
  const [events, setEvents] = useState<MetaDebugEvent[]>(() => getMetaDebugEvents());
  const [debugOn, setDebugOn] = useState(() => isMetaDebug());
  const [capi, setCapi] = useState<CapiStatus | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const refresh = () => setEvents(getMetaDebugEvents());
    refresh();
    const timer = window.setInterval(refresh, 1000);
    window.addEventListener("meta-debug-event", refresh);
    fetch("/api/meta/capi")
      .then((r) => r.json().catch(() => null))
      .then((data) => data && setCapi(data))
      .catch(() => {});
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("meta-debug-event", refresh);
    };
  }, []);

  const toggleDebug = () => {
    const next = !debugOn;
    setMetaDebug(next);
    setDebugOn(next);
  };

  const fireTests = () => {
    pixelTrack("ViewContent", { content_ids: ["qa-test-dress"], content_type: "product", value: 100 });
    trackLead("QA Test Button", { ph: "218920060299" });
    trackPurchase(`QA-${Date.now()}`, 75, [{ id: "qa-test-dress", name: "QA Test Dress", price: 100 }], [1], { ph: "218920060299" });
  };

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(events, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <div className="min-h-screen">
      <section className="pt-24 pb-8 md:pt-28">
        <div className="max-w-[900px] mx-auto px-4 sm:px-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-fg mb-2">
            Meta <span className="text-accent-brand">QA</span>
          </h1>
          <p className="text-sm text-fg-tertiary mb-6">فحص أحداث Facebook Pixel + Conversions API (بالتزامن مع لوحة Events Manager في Meta)</p>

          {/* Config */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="glass-card p-4">
              <p className="text-xs text-fg-tertiary mb-1">Pixels</p>
              <p className="text-sm font-semibold text-fg break-all" dir="ltr">{PIXEL_IDS.join(", ")}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs text-fg-tertiary mb-1">Currency</p>
              <p className="text-sm font-semibold text-fg" dir="ltr">{PIXEL_CURRENCY}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-xs text-fg-tertiary mb-1">Conversions API</p>
              {capi ? (
                <>
                  <p className={`text-sm font-semibold ${capi.configured ? "text-status-success" : "text-status-danger"}`}>
                    {capi.configured ? "مفعّل ✅" : "غير مضبوط ❌"}
                  </p>
                  <p className="text-xs text-fg-tertiary mt-1" dir="ltr">
                    {capi.pixels.length ? capi.pixels.join(", ") : "META_PIXEL_ID + META_CAPI_ACCESS_TOKEN"}
                  </p>
                  <p className="text-xs text-fg-tertiary">نافذة إلغاء التكرار: {capi.dedupWindowHours}h</p>
                </>
              ) : (
                <p className="text-sm text-fg-tertiary">جارٍ الفحص…</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={toggleDebug}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${debugOn ? "bg-status-success text-white" : "bg-fg/10 text-fg"}`}
            >
              {debugOn ? "سجل الكونسول: مفعّل" : "سجل الكونسول: متوقف"}
            </button>
            <button
              onClick={fireTests}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-accent-brand text-white hover:opacity-90 transition"
            >
              🔥 Fire test events
            </button>
            <button
              onClick={copyJson}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-fg/10 text-fg hover:bg-fg/20 transition"
            >
              {copied ? "✓ تم النسخ" : "نسخ JSON"}
            </button>
            <span className="px-4 py-2 rounded-full text-sm bg-fg/5 text-fg-tertiary self-center">
              {events.length} حدث في الجلسة — راجع أيضاً <code className="text-xs" dir="ltr">window.__META_EVENTS__</code>
            </span>
          </div>

          {/* Event table */}
          {events.length === 0 ? (
            <div className="glass-card p-8 text-center text-sm text-fg-tertiary">
              لا أحداث بعد — تصفح الموقع أو اضغط «Fire test events» لملء القائمة.
            </div>
          ) : (
            <div className="space-y-3">
              {[...events].reverse().map((e, i) => (
                <details key={`${e.ts}-${i}`} className="glass-card p-4" open={i < 3}>
                  <summary className="cursor-pointer flex flex-wrap items-center gap-2 text-sm">
                    <span className={`w-2 h-2 rounded-full ${e.source === "pixel" ? "bg-[#1877F2]" : "bg-[#00A400]"}`} />
                    <span className="font-semibold text-fg" dir="ltr">{e.event}</span>
                    <span className="text-xs text-fg-tertiary" dir="ltr">{e.eventId}</span>
                    <span className="text-xs text-fg-tertiary">{new Date(e.ts).toLocaleTimeString()}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${e.source === "pixel" ? "bg-[#1877F2]/10 text-[#1877F2]" : "bg-[#00A400]/10 text-[#00A400]"}`}>
                      {e.source === "pixel" ? "PIXEL" : "CAPI"}
                    </span>
                  </summary>
                  <pre className="mt-3 text-xs bg-black/5 dark:bg-white/5 rounded-lg p-3 overflow-x-auto text-fg" dir="ltr">
                    {JSON.stringify(e.params, null, 2)}
                  </pre>
                </details>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
