import type { OutfitSealItem } from "./OutfitSeal";

/** One luxury card per ordered outfit: name + SKU + collection + color + edition. */
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
          <div
            key={i}
            className="rounded-xl px-4 py-3"
            style={{
              border: "1px solid rgba(201,162,94,0.5)",
              background: "rgba(255,255,255,0.6)",
            }}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-fg">{item.name || "—"}</p>
              <span
                className="rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                style={{ background: "linear-gradient(135deg, #e63d6a, #c42855)" }}
              >
                قطعة {i + 1}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
              {fields.map((field) => (
                <div
                  key={field.label}
                  className="flex items-baseline justify-between gap-2 border-b pb-1"
                  style={{ borderColor: "rgba(201,162,94,0.2)" }}
                >
                  <span className="text-[10px] text-fg-tertiary">{field.label}</span>
                  <span className="text-[11px] font-semibold text-fg">
                    {field.value || "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
