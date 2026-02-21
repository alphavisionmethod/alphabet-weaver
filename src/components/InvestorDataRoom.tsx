import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Lock, Fingerprint, Shield, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const InvestorDataRoom = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("user_leads").insert({
        email,
        source: "investor_data_room",
        lead_type: "investor" as const,
        tags: ["investor"],
      });

      if (error) {
        if (error.code === "23505") {
          alert("You're already on the investor list!");
        } else {
          throw error;
        }
      } else {
        setIsSuccess(true);
        setEmail("");
        
        // Send admin notification (fire and forget)
        supabase.functions.invoke("notify-investor-lead", {
          body: { email },
        }).catch(console.error);

        // Fire workflow triggers (fire and forget)
        supabase.functions.invoke("execute-workflow", {
          body: {
            trigger_type: "form_submission",
            contact_email: email,
            metadata: { source: "investor_data_room", form_name: "investor" },
          },
        }).catch(console.error);

        supabase.functions.invoke("execute-workflow", {
          body: {
            trigger_type: "contact_created",
            contact_email: email,
            metadata: { source: "investor_data_room", is_investor: true },
          },
        }).catch(console.error);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section ref={ref} className="section-padding relative overflow-hidden">
      {/* Light leak effects */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-narrow relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto text-center"
        >
          {/* Locked card */}
          <motion.div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative glass-card p-12 border-gold/20 hover:border-gold/50 transition-all duration-500"
          >
            {/* Biometric scan effect on hover */}
            <motion.div
              initial={false}
              animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
              className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
            >
              {/* Scanning line */}
              <motion.div
                initial={{ y: "-100%" }}
                animate={isHovered ? { y: "200%" } : { y: "-100%" }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent blur-sm"
              />
              {/* Grid pattern */}
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 20px, hsl(var(--accent) / 0.1) 20px, hsl(var(--accent) / 0.1) 21px),
                                  repeating-linear-gradient(90deg, transparent, transparent 20px, hsl(var(--accent) / 0.1) 20px, hsl(var(--accent) / 0.1) 21px)`
              }} />
            </motion.div>

            {/* Lock icon */}
            <motion.div
              animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.3 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-gold/20 to-accent/10 mb-6"
            >
              {isHovered ? (
                <Fingerprint className="w-10 h-10 text-gold animate-pulse" />
              ) : (
                <Lock className="w-10 h-10 text-gold" />
              )}
            </motion.div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold mb-4">
              <Shield className="w-3 h-3" />
              INSTITUTIONAL ACCESS
            </div>

            {/* Title */}
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Institutional Grade Autonomy
            </h2>
            <p className="text-muted-foreground mb-6">
              SITA OS is solving the liability crisis of the Agentic Age.
              <br />
              <span className="text-foreground/80">For venture partners and accredited operators.</span>
            </p>

            {/* Form or Success */}
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-accent/10 border border-accent/30"
              >
                <Check className="w-5 h-5 text-accent" />
                <span className="text-accent font-medium">Access request received. We'll be in touch.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="investor@fund.com"
                  required
                  className="flex-1 px-5 py-4 rounded-xl bg-secondary border border-gold/20 focus:border-gold/50 focus:ring-2 focus:ring-gold/20 outline-none transition-all text-foreground placeholder:text-muted-foreground"
                />
                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative px-8 py-4 rounded-xl font-semibold text-background overflow-hidden disabled:opacity-50 group"
                  style={{
                    background: "linear-gradient(135deg, hsl(var(--gold)), hsl(var(--accent)))",
                  }}
                >
                  {/* Biometric scan effect on button */}
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Fingerprint className="w-5 h-5 transition-transform group-hover:scale-110" />
                    {isSubmitting ? "Verifying..." : "Request Access"}
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                  />
                </motion.button>
              </form>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default InvestorDataRoom;
