import { StoreSeal } from "./StoreSeal";
import { OutfitSeal, type OutfitSealItem } from "./OutfitSeal";

const MAX_SEALS = 4;

/** Bottom seal band: store seal + per-outfit medallions (max 4, then +N). */
export function CertificateFooter({
  items,
  orderId,
  date,
}: {
  items: OutfitSealItem[];
  orderId: string;
  date?: string;
}) {
  const shown = items.slice(0, MAX_SEALS);
  const extra = items.length - shown.length;

  return (
    <footer>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-6 sm:gap-8">
        <StoreSeal date={date} className="mx-0 h-32 w-32 sm:h-36 sm:w-36" />

        <div className="flex max-w-[60%] flex-wrap items-center justify-center gap-3">
          {shown.map((item, i) => (
            <OutfitSeal key={i} item={item} orderId={orderId} />
          ))}
          {extra > 0 && (
            <div
              className="grid h-20 w-20 place-items-center rounded-full border-2 border-dashed text-xs font-bold"
              style={{ borderColor: "#c9a25e", color: "#9c7138", background: "rgba(244,234,208,0.4)" }}
            >
              +{extra}
            </div>
          )}
        </div>
      </div>

      <p className="mt-5 text-center text-[10px] leading-relaxed" style={{ color: "#8c8276" }}>
        هذه الشهادة صادرة إلكترونياً من دار نادين للأزياء — رقم الشهادة: {orderId}
      </p>
    </footer>
  );
}
