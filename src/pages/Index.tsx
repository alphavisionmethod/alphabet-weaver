import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
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
import ScrollProgress from "@/components/ScrollProgress";
import ComparisonSection from "@/components/ComparisonSection";
import LogoBar from "@/components/LogoBar";
import TeamSection from "@/components/TeamSection";

/* ─── Glitch "Try to Break It" CTA ─── */
function TryToBreakItCTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [threats, setThreats] = useState(2_847);

  useEffect(() => {
    const id = setInterval(() => setThreats((t) => t + Math.floor(Math.random() * 3) + 1), 3000);
    return () => clearInterval(id);
  }, []);

  return (
    <section ref={ref} className="py-20 px-6 relative overflow-hidden">
      {/* scan lines */}
      <div className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(0 0% 100% / 0.03) 2px, hsl(0 0% 100% / 0.03) 4px)",
        }}
      />
      {/* red glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 50% 60% at 50% 50%, hsl(0 84% 60% / 0.08), transparent 70%)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto text-center relative z-10"
      >
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-destructive/10 border border-destructive/30 text-xs font-mono text-destructive mb-6"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
          {threats.toLocaleString()} threats neutralized
        </motion.div>

        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">Think you can break it?</h2>
        <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
          Our system refuses unsafe actions, catches attacks, and proves every decision. Try it yourself.
        </p>
        <Link
          to="/investor?k=INVESTOR_DEMO_2026&phase=attack"
          className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
        >
          <span className="absolute inset-0 rounded-2xl animate-pulse" style={{ boxShadow: "0 0 30px hsl(0 84% 60% / 0.4), inset 0 0 20px hsl(0 84% 60% / 0.1)" }} />
          <Shield className="w-5 h-5 relative z-10" />
          <span className="relative z-10">Try to Break It</span>
        </Link>
      </motion.div>
    </section>
  );
}

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <ScrollProgress />
      <FloatingNav />
      <HeroSection />
      <LogoBar />
      <SocialProofSection />
      <CoreEngineSection />
      <TrustSystemSection />
      <ComparisonSection />
      <TryToBreakItCTA />
      <ThreeDesksSection />
      <BoardOfAdvisorsSection />
      <TeamSection />
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
