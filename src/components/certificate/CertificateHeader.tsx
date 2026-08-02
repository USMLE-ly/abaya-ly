import { Crown, Star } from "lucide-react";

/** Certificate wordmark: NADINE LUXURY (Playfair) + شهادة أصالة (Amiri). */
export function CertificateHeader() {
  return (
    <header className="text-center">
      <div
        className="mx-auto grid h-14 w-14 place-items-center rounded-full"
        style={{
          background: "rgba(196,40,85,0.06)",
          border: "1px solid rgba(201,162,94,0.55)",
        }}
      >
        <Crown size={24} style={{ color: "#c42855" }} />
      </div>

      <p
        className="mt-4 text-[13px] font-semibold tracking-[0.45em]"
        style={{ color: "#9c7138", fontFamily: "'Playfair Display', serif" }}
      >
        NADINE LUXURY
      </p>

      <h2
        className="mt-2 text-3xl font-bold"
        style={{ color: "#110f0d", fontFamily: "'Amiri', serif" }}
      >
        شهادة أصالة
      </h2>

      <div className="mx-auto my-4 flex items-center justify-center gap-2">
        <span
          className="h-px w-16"
          style={{ background: "linear-gradient(90deg, transparent, #c9a25e)" }}
        />
        <Star size={12} className="fill-[#c42855] text-[#c42855]" />
        <span
          className="h-px w-16"
          style={{ background: "linear-gradient(90deg, #c9a25e, transparent)" }}
        />
      </div>
    </header>
  );
}
