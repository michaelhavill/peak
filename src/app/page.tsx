import HeroSection from "@/components/HeroSection";
import UseCasesGrid from "@/components/UseCasesGrid";
import KnowledgeMoat from "@/components/KnowledgeMoat";
import InteractiveDemo from "@/components/InteractiveDemo";
import CommandCenter from "@/components/CommandCenter";
import RolePaths from "@/components/RolePaths";
import IntegrationsGrid from "@/components/IntegrationsGrid";
import StatsBar from "@/components/StatsBar";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import LearnPaths from "@/components/LearnPaths";
import FooterCTA from "@/components/FooterCTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <div>
        <HeroSection />
        <LearnPaths />
        <UseCasesGrid />
        <KnowledgeMoat />
        <InteractiveDemo />
        <CommandCenter />
        <RolePaths />
        <IntegrationsGrid />
        <StatsBar />
        <TestimonialsCarousel />
        <FooterCTA />
        <Footer />
      </div>
    </main>
  );
}
