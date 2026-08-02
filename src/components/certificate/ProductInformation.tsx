import type { OutfitSealItem } from "./OutfitSeal";
import { CHARCOAL, GOLD_DEEP, GOLD_LINE, MUTED, STRAWBERRY } from "./tokens";

/** One product-passport card per ordered outfit: garment + fields + verification status. */
export function ProductInformation({ items }: { items: OutfitSealItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const fields = [
          { label: "الكود", value: item.code },
          { label: "المجموعة", value: item.collection },
          { label: "اللون", value: item.color },
          { label: "الإصدار", value: item.edition },
        ];
        return (
          <div key={i} className="overflow-hidden rounded-xl border" style={{ borderColor: GOLD_LINE }}>
            <div
              className="flex items-center justify-between gap-3 px-4 py-2.5"
              style={{
                background: "rgba(244,234,208,0.4)",
                borderBottom: "1px solid rgba(201,162,94,0.35)",
              }}
            >
              <p className="text-sm font-bold" style={{ color: CHARCOAL, fontFamily: "'Playfair Display', serif" }}>
                {item.name || "—"}
              </p>
              <span
                className="whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[9px] font-bold"
                style={{ borderColor: "rgba(201,162,94,0.65)", color: GOLD_DEEP }}
              >
                {i + 1} قطعة
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-4 py-3" style={{ background: "rgba(255,255,255,0.55)" }}>
              {fields.map((field) => (
                <div
                  key={field.label}
                  className="flex items-baseline justify-between gap-2 border-b pb-1"
                  style={{ borderColor: "rgba(201,162,94,0.2)" }}
                >
                  <span className="text-[10px]" style={{ color: MUTED }}>
                    {field.label}
                  </span>
                  <span className="text-[11px] font-semibold" style={{ color: CHARCOAL }}>
                    {field.value || "—"}
                  </span>
                </div>
              ))}
            </div>
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{
                borderTop: "1px solid rgba(201,162,94,0.35)",
                background: "rgba(244,234,208,0.25)",
              }}
            >
              <span className="text-[10px]" style={{ color: MUTED }}>
                حالة التوثيق
              </span>
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold"
                style={{
                  background: "rgba(196,40,85,0.08)",
                  border: "1px solid rgba(196,40,85,0.35)",
                  color: STRAWBERRY,
                }}
              >
                ✓ موثّقة
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
