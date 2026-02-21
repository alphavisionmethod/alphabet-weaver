import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PitchDeckViewer from "@/components/PitchDeckViewer";

interface FundingRound {
  id: string;
  phase_name: string;
  target_amount: number;
  current_amount: number;
  status: string;
  description: string | null;
  fund_allocation: Record<string, number> | null;
  display_order: number;
}

const allocationColors: Record<string, string> = {
  Engineering: "hsl(270 91% 55%)",
  Product: "hsl(300 70% 50%)",
  "Go-to-Market": "hsl(38 95% 54%)",
  Operations: "hsl(160 60% 45%)",
};

const Pitch = () => {
  const navigate = useNavigate();
  const [rounds, setRounds] = useState<FundingRound[]>([]);
  const [loading, setLoading] = useState(true);
  const timelineRef = useRef(null);
  const timelineInView = useInView(timelineRef, { once: true, margin: "-50px" });
  const fundsRef = useRef(null);
  const fundsInView = useInView(fundsRef, { once: true, margin: "-50px" });

  useEffect(() => {
    const fetchRounds = async () => {
      const { data } = await supabase
        .from("funding_rounds" as any)
        .select("*")
        .order("display_order" as any);
      if (data) setRounds(data as unknown as FundingRound[]);
      setLoading(false);
    };
    fetchRounds();
  }, []);

  const activeRound = rounds.find((r) => r.status === "active");
  const formatAmount = (n: number) => n >= 1000000 ? `$${(n / 1000000).toFixed(1)}M` : `$${(n / 1000).toFixed(0)}K`;

  return (
    <div className="min-h-screen" style={{ background: "#0B0812" }}>
      {/* Glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[700px] h-[700px]" style={{ background: "radial-gradient(ellipse, hsl(270 60% 40% / 0.07), transparent 70%)" }} />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px]" style={{ background: "radial-gradient(ellipse, hsl(38 95% 54% / 0.05), transparent 70%)" }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-24">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </motion.button>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4" style={{ background: "hsl(270 91% 55% / 0.1)", color: "hsl(270 91% 55%)", border: "1px solid hsl(270 91% 55% / 0.2)" }}>
            INVESTOR BRIEF
          </span>
          <h1 className="font-bold text-white mb-5" style={{ fontSize: "clamp(36px, 5vw, 60px)", lineHeight: 1.1 }}>
            SITA OS —{" "}
            <span style={{ background: "linear-gradient(135deg, hsl(270 91% 55%), hsl(38 95% 54%))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Investor Brief
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-white/50" style={{ fontSize: 17 }}>
            The autonomous operating system for modern businesses. Here's where we are, where we're going, and how you can be part of the journey
          </p>
        </motion.div>

        {/* Pitch Deck */}
        <PitchDeckViewer />

        {/* Funding Phases Timeline */}
        <div ref={timelineRef} className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={timelineInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-12"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4" style={{ background: "hsl(38 95% 54% / 0.1)", color: "hsl(38 95% 54%)", border: "1px solid hsl(38 95% 54% / 0.2)" }}>
              FUNDING PHASES
            </span>
            <h2 className="text-white font-bold" style={{ fontSize: "clamp(28px, 4vw, 42px)" }}>Our Roadmap</h2>
          </motion.div>

          {loading ? (
            <div className="text-white/30 text-center py-12">Loading...</div>
          ) : (
            <div className="relative max-w-2xl mx-auto">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-px" style={{ background: "linear-gradient(180deg, hsl(270 91% 55% / 0.4), hsl(38 95% 54% / 0.2), transparent)" }} />

              <div className="space-y-8">
                {rounds.map((round, i) => {
                  const isActive = round.status === "active";
                  const isCompleted = round.status === "completed";
                  const progress = round.target_amount > 0 ? (round.current_amount / round.target_amount) * 100 : 0;

                  return (
                    <motion.div
                      key={round.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={timelineInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.4, delay: 0.15 * i }}
                      className="relative pl-16"
                    >
                      {/* Node */}
                      <div
                        className="absolute left-4 top-2 w-5 h-5 rounded-full border-2 flex items-center justify-center"
                        style={{
                          borderColor: isActive ? "hsl(270 91% 55%)" : isCompleted ? "hsl(160 60% 45%)" : "rgba(255,255,255,0.2)",
                          background: isActive ? "hsl(270 91% 55%)" : isCompleted ? "hsl(160 60% 45%)" : "transparent",
                          boxShadow: isActive ? "0 0 16px hsl(270 91% 55% / 0.4)" : "none",
                        }}
                      >
                        {(isActive || isCompleted) && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>

                      {/* Card */}
                      <div
                        className="rounded-2xl"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: isActive ? "1px solid hsl(270 91% 55% / 0.3)" : "1px solid rgba(255,255,255,0.08)",
                          padding: "24px 28px",
                          boxShadow: isActive ? "0 0 40px hsl(270 91% 55% / 0.08)" : "none",
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white font-semibold text-lg">{round.phase_name}</h3>
                          <span
                            className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wider uppercase"
                            style={{
                              background: isActive ? "hsl(270 91% 55% / 0.15)" : isCompleted ? "hsl(160 60% 45% / 0.15)" : "rgba(255,255,255,0.06)",
                              color: isActive ? "hsl(270 91% 55%)" : isCompleted ? "hsl(160 60% 45%)" : "rgba(255,255,255,0.4)",
                            }}
                          >
                            {round.status}
                          </span>
                        </div>

                        <p className="text-3xl font-bold text-white mb-2">{formatAmount(round.target_amount)}</p>

                        {/* Progress bar */}
                        <div className="w-full h-1.5 rounded-full mb-3" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={timelineInView ? { width: `${Math.min(progress, 100)}%` } : {}}
                            transition={{ duration: 1, delay: 0.3 + 0.15 * i }}
                            className="h-full rounded-full"
                            style={{ background: isActive ? "linear-gradient(90deg, hsl(270 91% 55%), hsl(38 95% 54%))" : "rgba(255,255,255,0.15)" }}
                          />
                        </div>
                        <p className="text-xs text-white/30 mb-3">{formatAmount(round.current_amount)} raised of {formatAmount(round.target_amount)}</p>

                        {round.description && <p className="text-sm text-white/50">{round.description}</p>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Use of Funds */}
        {activeRound?.fund_allocation && (
          <div ref={fundsRef} className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={fundsInView ? { opacity: 1, y: 0 } : {}}
              className="text-center mb-12"
            >
              <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase mb-4" style={{ background: "hsl(270 91% 55% / 0.1)", color: "hsl(270 91% 55%)", border: "1px solid hsl(270 91% 55% / 0.2)" }}>
                USE OF FUNDS
              </span>
              <h2 className="text-white font-bold" style={{ fontSize: "clamp(28px, 4vw, 42px)" }}>Where the money goes</h2>
            </motion.div>

            <div className="max-w-2xl mx-auto rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "32px" }}>
              <div className="space-y-6">
                {Object.entries(activeRound.fund_allocation).map(([key, value], i) => {
                  const color = allocationColors[key] || "hsl(270 91% 55%)";
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={fundsInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.1 * i }}
                    >
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-white/80 font-medium">{key}</span>
                        <span className="text-sm font-semibold" style={{ color }}>{value}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={fundsInView ? { width: `${value}%` } : {}}
                          transition={{ duration: 0.8, delay: 0.2 + 0.1 * i }}
                          className="h-full rounded-full"
                          style={{ background: color }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <div className="rounded-2xl inline-flex flex-col items-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", padding: "48px 56px" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5" style={{ background: "hsl(38 95% 54% / 0.12)" }}>
              <Mail className="w-6 h-6" style={{ color: "hsl(38 95% 54%)" }} />
            </div>
            <h3 className="text-white font-semibold text-xl mb-2">Talk to the Founders</h3>
            <p className="text-white/40 text-sm mb-6 max-w-sm">Interested in partnering or investing? Let's start a conversation</p>
            <a
              href="mailto:founders@sitaos.com"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg, hsl(270 91% 55%), hsl(38 95% 54%))" }}
            >
              Get in Touch <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Pitch;