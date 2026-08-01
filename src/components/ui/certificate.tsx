import { Awards, type AwardsComponentProps } from "@/components/ui/award";

/** Thin wrapper: always renders the certificate variant. */
export function Certificate(props: Omit<AwardsComponentProps, "variant">) {
  return <Awards {...props} variant="certificate" />;
}
