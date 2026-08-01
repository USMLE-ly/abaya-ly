import { Awards } from "@/components/ui/award";

/** Fixed authenticity seal — identical on every order. */
export function StoreSeal({ date, className }: { date?: string; className?: string }) {
  return (
    <Awards
      variant="stamp"
      title="NADINE LUXURY"
      subtitle="دار الأزياء المعتمدة"
      recipient="أصلي"
      date={date}
      className={className}
    />
  );
}
