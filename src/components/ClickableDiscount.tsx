import { useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { ticketPath, useIsRTL, useTicketScale, type TicketGeom } from "./ticket";

interface Props {
  code: string;
  label?: string;
  onReveal?: (code: string) => void;
}

/** Small admit-one coupon ticket: tap to reveal + copy the code. */
const GEO: TicketGeom = { w: 420, h: 150, corner: 14, notch: 12, dividerX: 318.5 };

export function ClickableDiscount({ code, label = "كوبون خصم خاص بكِ", onReveal }: Props) {
  const [copied, setCopied] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rtl = useIsRTL();
  const scale = useTicketScale(wrapRef, GEO.w);
  const clip = ticketPath(GEO, rtl);
  const dividerLeft = rtl ? GEO.w - GEO.dividerX - 0.8 : GEO.dividerX - 0.8;
  const stubLeft = rtl ? 0 : GEO.dividerX;
  const stubWidth = GEO.w - GEO.dividerX;

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* clipboard unavailable — still show success state */
    }
    setCopied(true);
    onReveal?.(code);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div ref={wrapRef} className="relative mx-auto w-full" style={{ maxWidth: GEO.w, aspectRatio: `${GEO.w} / ${GEO.h}` }}>
      <div
        className="absolute"
        style={{
          left: "50%",
          top: 0,
          marginLeft: -GEO.w / 2,
          width: GEO.w,
          height: GEO.h,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
      >
        <div className="relative h-full w-full" style={{ filter: "drop-shadow(0 16px 28px rgba(196,40,85,0.18))" }}>
          <button
            type="button"
            data-debug="clickable-discount-real"
            onClick={handleClick}
            aria-label={label}
            className={`group relative block w-full cursor-pointer text-start transition-transform duration-200 active:scale-[0.99] ${
              copied ? "cursor-default" : ""
            }`}
            style={{ width: GEO.w, height: GEO.h, clipPath: `path("${clip}")` }}
          >
            {/* ticket body */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, #ffffff 0%, #fff5f7 45%, #ffe4eb 100%)" }}
            />

            {/* perforation — dashed tear line exactly on the divider */}
            <div
              aria-hidden="true"
              className="absolute top-0 bottom-0"
              style={{
                left: dividerLeft,
                width: 1.4,
                backgroundImage:
                  "repeating-linear-gradient(rgba(196,40,85,0.35) 0px, rgba(196,40,85,0.35) 7.5px, transparent 7.5px, transparent 15px)",
              }}
            />

            {/* stub watermark */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute grid place-items-center font-bold tabular-nums"
              style={{
                left: stubLeft,
                top: 0,
                width: stubWidth,
                height: GEO.h,
                color: "rgba(196,40,85,0.10)",
              }}
            >
              <span style={{ writingMode: "vertical-rl", fontSize: 46, lineHeight: 1, letterSpacing: "-0.04em" }}>
                10%
              </span>
            </div>

            {/* stub — vertical code + copy action */}
            <span
              className={`absolute flex flex-col items-center justify-center gap-2 ${copied ? "text-success" : "text-brand"}`}
              style={{ left: stubLeft, top: 0, width: stubWidth, height: GEO.h }}
            >
              <span dir="ltr" style={{ writingMode: "vertical-rl", fontSize: 15, fontWeight: 700, letterSpacing: "0.1em" }}>
                {code}
              </span>
              {copied ? (
                <Check size={13} strokeWidth={2.5} aria-hidden="true" />
              ) : (
                <Copy size={12} strokeWidth={2.25} aria-hidden="true" />
              )}
            </span>

            {/* main body — label + helper */}
            <span
              className="absolute inset-y-0 flex flex-col justify-center gap-0.5"
              style={{ insetInlineStart: 40, insetInlineEnd: stubWidth + 34, textAlign: "start" }}
            >
              <span className={`block truncate text-[13px] font-bold ${copied ? "text-success" : "text-fg"}`}>
                {copied ? "تم نسخ الكود!" : label}
              </span>
              <span className={`block text-[11px] ${copied ? "text-success" : "text-fg-tertiary"}`}>
                {copied ? "انسخيه واستخدميه في الحجز" : "اضغطي للكشف عن الكود ونسخه"}
              </span>
            </span>

            {/* edge highlight — follows the same outline */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
              style={{
                clipPath: `path("${clip}")`,
                boxShadow: copied
                  ? "inset 0 0 0 1.5px rgba(22,163,74,0.4)"
                  : "inset 0 0 0 1.5px rgba(196,40,85,0.2)",
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
