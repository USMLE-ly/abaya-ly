import { Awards } from "@/components/ui/award";

export interface OutfitSealItem {
  name: string;
  code: string;
  collection?: string;
  color?: string;
  size?: string;
  edition?: string;
}

/** Per-outfit seal, generated from the ordered item. */
export function OutfitSeal({
  item,
  orderId,
  className,
}: {
  item: OutfitSealItem;
  orderId: string;
  className?: string;
}) {
  const meta = [item.collection, item.edition].filter(Boolean).join(" • ");
  const spec = [item.color && `اللون: ${item.color}`, item.size && `المقاس: ${item.size}`]
    .filter(Boolean)
    .join(" — ");

  return (
    <Awards
      variant="badge"
      title={item.name}
      subtitle={meta || item.code}
      description={spec || undefined}
      recipient={item.code}
      date={orderId}
      className={className}
    />
  );
}
