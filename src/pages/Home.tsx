import { SlideshowHero } from "@/components/SlideshowHero";
import { ProductCarousel } from "@/components/ProductCarousel";
import { ComparisonTable } from "@/components/ComparisonTable";
import { IconBar } from "@/components/IconBar";
import { ResultsStats } from "@/components/ResultsStats";
import { ContactForm } from "@/components/ContactForm";

export function Home() {
  return (
    <>
      <SlideshowHero />
      <ProductCarousel />
      <ComparisonTable />
      <IconBar />
      <ResultsStats />
      <ContactForm />
    </>
  );
}
