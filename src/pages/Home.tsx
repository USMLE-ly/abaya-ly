import LuminaHero from "@/components/LuminaHero";
import { ProductCarousel } from "@/components/ProductCarousel";
import { ComparisonTable } from "@/components/ComparisonTable";
import { IconBar } from "@/components/IconBar";
import { GlobeSection } from "@/components/GlobeSection";
import { ContactForm } from "@/components/ContactForm";

export function Home() {
  return (
    <>
      <LuminaHero />
      <ProductCarousel />
      <ComparisonTable />
      <IconBar />
      <GlobeSection />
      <ContactForm />
    </>
  );
}
