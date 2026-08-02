/** Official credential rows: name / certificate number / date. */
export function CustomerInformation({
  name,
  orderId,
  date,
}: {
  name: string;
  orderId: string;
  date: string;
}) {
  const rows = [
    { label: "الاسم الكريم", value: name || "—" },
    { label: "رقم الشهادة", value: orderId || "—" },
    { label: "التاريخ", value: date || "—" },
  ];

  return (
    <div
      className="rounded-xl px-4 py-2"
      style={{
        border: "1px solid rgba(201,162,94,0.5)",
        background: "rgba(244,234,208,0.35)",
      }}
    >
      {rows.map((row, i) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-4 py-2"
          style={
            i > 0
              ? { borderTop: "1px solid rgba(201,162,94,0.25)" }
              : undefined
          }
        >
          <span className="text-[10px] font-semibold tracking-wide" style={{ color: "#9c7138" }}>
            {row.label}
          </span>
          <span className="text-sm font-bold tabular-nums text-fg">{row.value}</span>
        </div>
      ))}
    </div>
  );
}
