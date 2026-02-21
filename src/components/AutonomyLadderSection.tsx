import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { User, Brain, Zap, Rocket } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const levels = [
  {
    level: 0,
    name: "I suggest, you do",
    description: "AI suggests, you execute",
    icon: User,
  },
  {
    level: 33,
    name: "I draft, you approve",
    description: "AI drafts, you review & send",
    icon: Brain,
  },
  {
    level: 66,
    name: "I act, you review",
    description: "AI acts, you review after",
    icon: Zap,
  },
  {
    level: 100,
    name: "I run it, you relax",
    description: "Full automation within your rules",
    icon: Rocket,
  },
];

const AutonomyLadderSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const [autonomyLevel, setAutonomyLevel] = useState([33]);

  const currentLevel = levels.reduce((prev, curr) => {
    return Math.abs(curr.level - autonomyLevel[0]) < Math.abs(prev.level - autonomyLevel[0])
      ? curr
      : prev;
  });

  const glowIntensity = autonomyLevel[0] / 100;

  return (
    <section id="autonomy-ladder" ref={ref} className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-radial-center" />
      
      {/* Parallax floating orb */}
      <motion.div 
        style={{ y }}
        className="absolute left-1/4 -top-20 w-72 h-72 bg-accent/5 rounded-full blur-3xl pointer-events-none"
      />

      {/* Dynamic golden glow based on autonomy level */}
      <motion.div
        animate={{
          opacity: glowIntensity * 0.4,
          scale: 1 + glowIntensity * 0.3,
        }}
        transition={{ duration: 0.5 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 50%, hsl(var(--gold) / ${glowIntensity * 0.25}), transparent)`,
        }}
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
            Control You Can Adjust
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            You decide how much <span className="gradient-text">control to keep</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Start hands-on. Let go gradually. The choice is always yours.
          </p>
        </motion.div>

        {/* Interactive slider card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <div
            className="glass-card p-8 md:p-12 transition-all duration-500"
            style={{
              boxShadow: `0 0 ${40 + glowIntensity * 80}px hsl(var(--gold) / ${glowIntensity * 0.35})`,
              borderColor: `hsl(var(--gold) / ${0.15 + glowIntensity * 0.35})`,
            }}
          >
            {/* Current level display */}
            <div className="text-center mb-10">
              <motion.div
                key={currentLevel.name}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 transition-all duration-500"
                style={{
                  background: `linear-gradient(135deg, hsl(var(--primary) / ${1 - glowIntensity * 0.5}), hsl(var(--gold) / ${glowIntensity}))`,
                  boxShadow: `0 0 ${20 + glowIntensity * 30}px hsl(var(--gold) / ${glowIntensity * 0.5})`,
                }}
              >
                <currentLevel.icon className="w-10 h-10 text-background" />
              </motion.div>
              <motion.h3
                key={`title-${currentLevel.name}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-2xl md:text-3xl font-bold mb-2"
              >
                <span
                  style={{
                    background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--gold) / ${0.5 + glowIntensity * 0.5}))`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {currentLevel.name}
                </span>
              </motion.h3>
              <motion.p
                key={`desc-${currentLevel.description}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-muted-foreground text-lg"
              >
                {currentLevel.description}
              </motion.p>
            </div>

            {/* Endpoint labels */}
            <div className="flex justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                You decide everything
              </span>
              <span className="text-sm font-medium flex items-center gap-2" style={{
                background: `linear-gradient(90deg, hsl(var(--primary)), hsl(var(--gold)))`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                We manage everything automatically
                <Rocket className="w-4 h-4 text-gold" />
              </span>
            </div>

            {/* Slider */}
            <div className="mb-8">
              <Slider
                value={autonomyLevel}
                onValueChange={setAutonomyLevel}
                max={100}
                step={1}
                className="cursor-pointer"
              />
            </div>

            {/* Level icon buttons */}
            <div className="flex justify-between">
              {levels.map((level, index) => (
                <motion.button
                  key={level.level}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  onClick={() => setAutonomyLevel([level.level])}
                  className={`flex flex-col items-center gap-1.5 transition-all duration-300 group ${
                    currentLevel.level === level.level
                      ? "opacity-100"
                      : "opacity-40 hover:opacity-70"
                  }`}
                >
                  <div
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      currentLevel.level === level.level
                        ? ""
                        : "bg-muted group-hover:bg-muted/80"
                    }`}
                    style={
                      currentLevel.level === level.level
                        ? {
                            background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--gold) / ${0.5 + glowIntensity * 0.5}))`,
                            boxShadow: `0 0 15px hsl(var(--gold) / ${glowIntensity * 0.4})`,
                          }
                        : undefined
                    }
                  >
                    <level.icon
                      className={`w-5 h-5 md:w-6 md:h-6 ${
                        currentLevel.level === level.level
                          ? "text-background"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block ${
                      currentLevel.level === level.level ? "gradient-text" : "text-muted-foreground"
                    }`}
                  >
                    Level {index + 1}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Bottom note */}
            <div className="mt-8 pt-6 border-t border-border text-center">
              <span className="text-sm text-muted-foreground">
                Different tasks, different levels. You're always in control of the dial.
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AutonomyLadderSection;
