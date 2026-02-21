import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { FileText, Shield, UserCheck, Zap, Receipt } from "lucide-react";
import MagneticCard from "./MagneticCard";

const steps = [
  {
    icon: FileText,
    title: "Think",
    quote: ["SITA drafts decisions and plans actions.", "Nothing is executed yet."],
  },
  {
    icon: Shield,
    title: "Check",
    quote: ["Clear context against your rules. No black boxes."],
  },
  {
    icon: UserCheck,
    title: "Approve",
    quote: "You approve, edit, or reject. Or set policies for automatic approval.",
  },
  {
    icon: Zap,
    title: "Act",
    quote: ["SITA executes only what's permitted —", "within strict limits."],
  },
  {
    icon: Receipt,
    title: "Prove",
    quote: ["A receipt for every action:", "what happened, why, when, and by whom."],
  },
];

const CoreEngineSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);

  return (
    <section id="core-engine" ref={ref} className="section-padding relative overflow-hidden">
      {/* SVG gradient definition for icons */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <linearGradient id="icon-brand-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(270 91% 55%)" />
            <stop offset="100%" stopColor="hsl(38 95% 54%)" />
          </linearGradient>
        </defs>
      </svg>
      {/* Background */}
      <div className="absolute inset-0 bg-radial-center" />
      
      {/* Parallax floating orb */}
      <motion.div 
        style={{ y }}
        className="absolute -right-32 top-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"
      />

      <div className="container-narrow relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20 mb-4">
            How SITA Works
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Think. Check. <span className="gradient-text">Approve.</span> Act. Prove.
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            Every AI should be accountable. SITA drafts actions, checks them against your rules, waits for approval, executes, and leaves a receipt.
          </p>
        </motion.div>

        {/* Process flow */}
        <div className="relative">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-5">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative group flex items-center"
              >
                {/* Step number - outside MagneticCard to avoid transform clipping */}
                <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-background border-2 border-primary/50 flex items-center justify-center z-20 opacity-75">
                  <span className="text-sm font-bold gradient-text opacity-75">{index + 1}</span>
                </div>

                {/* Card */}
                <div className="flex-1">
                  <MagneticCard className="h-full">
                    <div className="glass-card-hover p-5 lg:p-6 h-full min-h-[280px] flex flex-col">

                      {/* Icon */}
                      <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/15 group-hover:from-primary/30 group-hover:to-accent/25 transition-all duration-300 shadow-[0_0_15px_hsl(270_91%_55%/0.15)]">
                        <step.icon className="w-6 h-6" style={{ stroke: 'url(#icon-brand-gradient)' }} />
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-bold text-foreground mb-3">{step.title}</h3>
                      
                      {/* Quote */}
                      <div className="flex-1">
                        <p className="text-muted-foreground text-sm leading-relaxed italic">
                          {Array.isArray(step.quote) ? step.quote.map((line, i) => (
                            <span key={i} className={i > 0 ? "block mt-2" : "block"}>{line}</span>
                          )) : step.quote}
                        </p>
                      </div>

                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                          background: "radial-gradient(circle at 50% 50%, hsl(270 91% 55% / 0.1), transparent 70%)",
                        }}
                      />
                    </div>
                  </MagneticCard>
                </div>

              </motion.div>
            ))}
          </div>

          {/* Bottom line */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center text-sm md:text-base text-muted-foreground mt-12"
          >
            Autonomy — without losing control.
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default CoreEngineSection;
