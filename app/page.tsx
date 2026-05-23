import Navbar from "./components/Navbar";
import HeroSection from "./sections/HeroSection";
import dynamic from "next/dynamic";

const BrainSynapsesSection = dynamic(() => import("./sections/BrainSynapsesSection"));
const WhyTutorAISection = dynamic(() => import("./sections/WhyTutorAISection"));
const PricingSection = dynamic(() => import("./sections/PricingSection"));
const CTASection = dynamic(() => import("./sections/CTASection"));
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col">
        <HeroSection />
        <BrainSynapsesSection />
        <WhyTutorAISection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
