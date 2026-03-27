import Sidebar from "@/components/Sidebar";
import HeroSection from "@/components/HeroSection";
import UseCasesGrid from "@/components/UseCasesGrid";
import KnowledgeMoat from "@/components/KnowledgeMoat";
import InteractiveDemo from "@/components/InteractiveDemo";
import CommandCenter from "@/components/CommandCenter";
import RolePaths from "@/components/RolePaths";
import IntegrationsGrid from "@/components/IntegrationsGrid";
import StatsBar from "@/components/StatsBar";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import BlogSection from "@/components/BlogSection";
import FooterCTA from "@/components/FooterCTA";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";

export default function Home() {
  return (
    <>
      <Sidebar />
      <MobileNav />
      <main className="lg:ml-[180px] overflow-x-hidden">
        <div className="pt-16 lg:pt-0">
          <HeroSection />
          <UseCasesGrid />
          <KnowledgeMoat />
          <InteractiveDemo />
          <CommandCenter />
          <RolePaths />
          <IntegrationsGrid />
          <StatsBar />
          <TestimonialsCarousel />
          <BlogSection />
          <FooterCTA />
          <Footer />
        </div>
      </main>
    </>
  );
}
