import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import sitaLogo from "@/assets/sita-logo.jpeg";
import sitaDemo from "@/assets/sita-demo.mp4";
import VerificationReceipt from "./VerificationReceipt";

const HeroSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await (supabase.from as any)("user_leads").insert({
        email,
        source: "landing_page_hero",
        lead_type: "waitlist" as const,
        tags: ["general"],
      });

      if (error) {
        if (error.code === "23505") {
          // Unique violation - email already exists
          alert("You're already on the waitlist!");
        } else {
          throw error;
        }
      } else {
        setSubmittedEmail(email);
        setShowReceipt(true);
        setEmail("");

        // Fire workflow triggers (fire and forget)
        supabase.functions.invoke("execute-workflow", {
          body: {
            trigger_type: "form_submission",
            contact_email: email,
            metadata: { source: "landing_page_hero", form_name: "waitlist" },
          },
        }).catch(console.error);

        supabase.functions.invoke("execute-workflow", {
          body: {
            trigger_type: "contact_created",
            contact_email: email,
            metadata: { source: "landing_page_hero" },
          },
        }).catch(console.error);
      }
    } catch (error) {
      console.error("Error submitting to waitlist:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center section-padding overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute inset-0 bg-radial-top" />
      
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />

      <div className="container-narrow relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <img 
              src={sitaLogo} 
              alt="SITA OS" 
              className="w-20 h-20 mx-auto rounded-2xl shadow-lg"
              style={{ boxShadow: "var(--shadow-glow-combined)" }}
            />
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/5 mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">Your AI That Acts</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          >
            <span className="text-foreground">Most AIs talk.</span>
            <br />
            <span className="gradient-text">SITA executes — under your rules.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12"
          >
            A governed AI system for life and business. Nothing acts without permission. Every action leaves a receipt.
          </motion.p>

          {/* CTA Form */}


          <motion.form
            id="join-waitlist"
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-lg mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full sm:flex-1 px-6 py-4 rounded-xl bg-secondary/80 border border-border/60 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-hero pulse-glow w-full sm:w-auto whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="relative z-10">
                {isSubmitting ? "Submitting..." : "Join Waitlist"}
              </span>
            </button>
          </motion.form>

          {/* Micro-trust line */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-4 text-xs text-muted-foreground/70 tracking-wide"
          >
            Shadow mode by default. Approval required. Full audit trail.
          </motion.p>

          {/* Try the Live Demo button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="mt-6"
          >
            <Link
              to="/sandbox"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-sm font-medium"
            >
              ▶ Try the Live Demo
            </Link>
          </motion.div>

          {/* Demo Video */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-12 max-w-3xl mx-auto"
          >
            <div className="relative glass-card p-2 rounded-2xl" style={{ boxShadow: "var(--shadow-glow-combined)" }}>
              <div className="absolute top-4 left-4 z-10 opacity-75">
                <div className="flex flex-col gap-0.5 px-3 py-1.5 rounded-lg bg-background/80 backdrop-blur-sm border border-border/30">
                  <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-accent">CONCEPT VISUAL</span>
                  <span className="text-[10px] text-muted-foreground">Software → Hardware</span>
                </div>
              </div>
              <video
                src={sitaDemo}
                muted
                controls
                playsInline
                className="w-full rounded-xl"
                style={{ aspectRatio: "16/9" }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Verification Receipt Modal */}
      <VerificationReceipt
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        email={submittedEmail}
      />
    </section>
  );
};

export default HeroSection;
