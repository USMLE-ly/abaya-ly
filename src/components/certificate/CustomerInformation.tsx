import { CHARCOAL, GOLD_DEEP, GOLD_LINE } from "./tokens";

/** Official authentication registry: name / serial / issue date / order reference. */
export function CustomerInformation({
  name,
  orderId,
  date,
  serial,
}: {
  name: string;
  orderId: string;
  date: string;
  serial: string;
}) {
  const rows = [
    { label: "الاسم الكريم", value: name || "—" },
    { label: "رقم الشهادة", value: serial || "—" },
    { label: "تاريخ الإصدار", value: date || "—" },
    { label: "مرجع الطلب", value: orderId || "—" },
  ];

  return (
    <div className="overflow-hidden rounded-xl border" style={{ borderColor: GOLD_LINE }}>
      <div
        className="flex items-center justify-center px-4 py-2.5"
        style={{
          background: "rgba(244,234,208,0.4)",
          borderBottom: "1px solid rgba(201,162,94,0.35)",
        }}
      >
        <p className="text-[10px] font-bold tracking-[0.18em]" style={{ color: GOLD_DEEP }}>
          سجل التوثيق الرسمي
        </p>
      </div>
      <div className="grid grid-cols-1 gap-px sm:grid-cols-2" style={{ background: GOLD_LINE }}>
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 px-4 py-3"
            style={{ background: "rgba(253,250,243,0.92)" }}
          >
            <span className="text-[10px] font-semibold tracking-wide" style={{ color: GOLD_DEEP }}>
              {row.label}
            </span>
            <span className="text-sm font-bold tabular-nums" style={{ color: CHARCOAL }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
