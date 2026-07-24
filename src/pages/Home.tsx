import ElegantCarousel from "@/components/ElegantCarousel";
import { ProductCarousel } from "@/components/ProductCarousel";
import { ComparisonTable } from "@/components/ComparisonTable";
import { IconBar } from "@/components/IconBar";
import { ResultsStats } from "@/components/ResultsStats";
import { ContactForm } from "@/components/ContactForm";

export function Home() {
  return (
    <>
      <ElegantCarousel />
      <ProductCarousel />
      <ComparisonTable />
      <IconBar />
      <ResultsStats />
      <ContactForm />
    </>
  );
}
