/** Clean luxury closing: legal line, house line, certificate reference.
 *  The final visual signature of the certificate — nothing competes with it. */
export function CertificateFooter({ serial }: { serial: string }) {
  return (
    <footer className="text-center">
      <p
        className="mt-5 text-[15px] font-medium leading-[1.8]"
        style={{ color: "#6B6B6B" }}
      >
        تُصدر هذه الشهادة إلكترونياً من دار نادين للأزياء
        <br />
        وتُعد وثيقة أصالة رسمية لكل قطعة موثّقة.
      </p>
      <div
        className="mx-auto mt-4 h-px w-40 max-w-full"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(201,162,94,0.85), transparent)",
        }}
        aria-hidden="true"
      />
      <p
        className="mt-4 text-xs font-semibold uppercase tracking-[0.4em]"
        style={{ color: "#B68A3A", fontFamily: "'Playfair Display', serif" }}
      >
        NADINE LUXURY · HOUSE CERTIFIED
      </p>
      <p
        className="mb-3 mt-2.5 text-xs font-semibold tabular-nums tracking-[0.25em]"
        style={{ color: "#8A8A8A" }}
      >
        {serial}
      </p>
    </footer>
  );
}
