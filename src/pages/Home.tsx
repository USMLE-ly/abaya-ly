import { SlideshowHero } from "@/components/SlideshowHero";
import { ComparisonTable } from "@/components/ComparisonTable";
import { IconBar } from "@/components/IconBar";
import { ResultsStats } from "@/components/ResultsStats";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { ContactForm } from "@/components/ContactForm";

export function Home() {
  return (
    <>
      <SlideshowHero />
      <IconBar />
      <FeaturedProducts />
      <ComparisonTable />
      <ResultsStats />
      <ContactForm />
    </>
  );
}
