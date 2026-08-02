import { Star } from "lucide-react";

/** Typographic wordmark — no floating icons, pure branding. */
export function CertificateHeader() {
  return (
    <header className="text-center">
      <div className="flex items-center justify-center gap-3">
        <span
          className="h-px w-10 sm:w-16"
          style={{ background: "linear-gradient(90deg, transparent, #c9a25e)" }}
        />
        <span className="block h-1.5 w-1.5 rotate-45" style={{ background: "#c42855" }} />
        <span
          className="h-px w-10 sm:w-16"
          style={{ background: "linear-gradient(90deg, #c9a25e, transparent)" }}
        />
      </div>

      <p
        className="mt-4 text-lg font-semibold tracking-[0.42em] sm:text-xl"
        style={{ color: "#9c7138", fontFamily: "'Playfair Display', serif" }}
      >
        NADINE LUXURY
      </p>

      <h2
        className="mt-3 text-4xl font-bold"
        style={{ color: "#110f0d", fontFamily: "'Amiri', serif" }}
      >
        شهادة أصالة
      </h2>

      <p
        className="mt-2.5 text-[8.5px] font-semibold tracking-[0.38em]"
        style={{ color: "#b48a45", fontFamily: "'Playfair Display', serif" }}
      >
        OFFICIAL AUTHENTICITY CERTIFICATE
      </p>

      <div className="mx-auto mt-5 flex items-center justify-center gap-2">
        <span
          className="h-px w-12"
          style={{ background: "linear-gradient(90deg, transparent, #c9a25e)" }}
        />
        <Star size={11} className="fill-[#c42855] text-[#c42855]" />
        <span
          className="h-px w-12"
          style={{ background: "linear-gradient(90deg, #c9a25e, transparent)" }}
        />
      </div>
    </header>
  );
}
