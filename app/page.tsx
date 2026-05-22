import Navbar from "./components/Navbar";
import HeroSection from "./sections/HeroSection";
import BrainSynapsesSection from "./sections/BrainSynapsesSection";
import WhyTutorAISection from "./sections/WhyTutorAISection";
import CTASection from "./sections/CTASection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col">
        <HeroSection />
        <BrainSynapsesSection />
        <WhyTutorAISection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
