import { Guilloche } from "./Guilloche";
import { GOLD_DEEP, GOLD_MID, MUTED } from "./tokens";

/** Fixed authenticity statement + certificate reference — every certificate ends here. */
export function CertificateFooter({ serial }: { serial: string }) {
  return (
    <footer className="mt-10 border-t pt-6 text-center" style={{ borderColor: "rgba(201,162,94,0.35)" }}>
      <Guilloche className="mx-auto h-3.5 w-60 max-w-full" />
      <p className="mx-auto mt-5 max-w-md text-[10px] leading-relaxed" style={{ color: MUTED }}>
        تُصدَر هذه الشهادة إلكترونياً من دار نادين للأزياء وتُعدّ وثيقة أصالة رسمية لكل قطعة موثّقة.
      </p>
      <p className="mt-4 text-[8px] font-semibold tracking-[0.28em]" style={{ color: GOLD_MID, fontFamily: "'Playfair Display', serif" }}>
        NADINE LUXURY · HOUSE CERTIFIED
      </p>
      <p className="mt-2 text-[8px] font-semibold tabular-nums tracking-[0.2em]" style={{ color: GOLD_DEEP }}>
        {serial}
      </p>
    </footer>
  );
}
