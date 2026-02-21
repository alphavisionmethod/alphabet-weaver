import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import CoreEngineSection from "@/components/CoreEngineSection";
import TrustSystemSection from "@/components/TrustSystemSection";
import ThreeDesksSection from "@/components/ThreeDesksSection";
import BoardOfAdvisorsSection from "@/components/BoardOfAdvisorsSection";
import AutonomyLadderSection from "@/components/AutonomyLadderSection";
import MultiPlatformSection from "@/components/MultiPlatformSection";
import FAQSection from "@/components/FAQSection";
import SovereignBackerSection from "@/components/SovereignBackerSection";
import DemoVideoSection from "@/components/DemoVideoSection";
import InvestorDataRoom from "@/components/InvestorDataRoom";
import LiveReceiptMarquee from "@/components/LiveReceiptMarquee";
import SocialProofSection from "@/components/SocialProofSection";
import FooterSection from "@/components/FooterSection";
import FloatingNav from "@/components/FloatingNav";

function TryToBreakItCTA() {
  return (
    <section className="py-16 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Think you can break it?</h2>
        <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
          Our system refuses unsafe actions, catches attacks, and proves every decision. Try it yourself.
        </p>
        <Link
          to="/investor?k=INVESTOR_DEMO_2026&phase=attack"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Shield className="w-5 h-5" />
          Try to Break It
        </Link>
      </div>
    </section>
  );
}

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <FloatingNav />
      <HeroSection />
      <SocialProofSection />
      <CoreEngineSection />
      <TrustSystemSection />
      <TryToBreakItCTA />
      <ThreeDesksSection />
      <BoardOfAdvisorsSection />
      <AutonomyLadderSection />
      <MultiPlatformSection />
      <SovereignBackerSection />
      <DemoVideoSection />
      <InvestorDataRoom />
      <FAQSection />
      <LiveReceiptMarquee />
      <FooterSection />
    </div>
  );
};

export default Index;
