import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Crown, ChevronDown, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import advisorsVideo from "@/assets/advisors-video.mp4";

const fullContent = `
**The Family Office Model**
Billionaires don't make decisions alone. They have dedicated teams—family offices, investment committees, operations leads—who handle everything from wealth preservation to daily logistics. These systems are built to reduce errors, protect time, and execute with precision.

**SITA OS Brings This to Everyone**
We've built the first AI-powered advisory layer that operates like a personal family office. It doesn't just answer questions—it manages, coordinates, and acts across every domain of your life: business strategy, financial optimization, and personal operations.

**Your Complete Executive Team**
Imagine having a Chief of Staff who never sleeps. A CFO who monitors every transaction. A COO who keeps operations running smoothly. A personal assistant who remembers everything. SITA OS combines all of these into one intelligent system—governed by your rules, accountable to you alone.

**Built by Those Who Know**
The architecture behind SITA OS was shaped by operators who've built billion-dollar enterprises, managed sovereign wealth, and led global organizations. They understand what it takes to run at scale—and they've encoded that wisdom into every layer of the platform.
`;

const BoardOfAdvisorsSection = () => {
  const ref = useRef(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <section ref={ref} className="section-padding relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-gold/5 rounded-full blur-[200px] pointer-events-none" />

      <div className="container-narrow relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-gold/10 text-gold border border-gold/20 mb-6">
            <Crown className="w-3.5 h-3.5" />
            The Vision
          </span>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            Give Everyone a{" "}
            <span className="gradient-text">Billionaire-Level Advisory System</span>
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A complete executive team, Family Office, and Personal Assistant across every area of your life—focused on growth, profitability, and execution.
          </p>
        </motion.div>

        {/* Main content card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="max-w-5xl mx-auto"
        >
          <div className="glass-card rounded-3xl border border-gold/10 relative overflow-hidden">
            {/* Decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
            
            {/* Hero Video */}
            <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden">
              <video 
                ref={videoRef}
                src={advisorsVideo}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover object-center opacity-70"
              />
              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
              
              {/* Sound toggle button with glow animation */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                onClick={toggleMute}
                className="absolute bottom-4 right-4 p-3 rounded-full bg-background/30 backdrop-blur-md border border-white/10 hover:bg-background/50 transition-all duration-300 group animate-pulse"
                style={{
                  boxShadow: isMuted 
                    ? "0 0 15px hsl(var(--gold) / 0.3), 0 0 30px hsl(var(--gold) / 0.15)" 
                    : "0 0 20px hsl(var(--gold) / 0.5), 0 0 40px hsl(var(--gold) / 0.25)",
                }}
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white/80 group-hover:text-white transition-colors" />
                ) : (
                  <Volume2 className="w-5 h-5 text-gold group-hover:text-gold/80 transition-colors" />
                )}
              </motion.button>
            </div>

            {/* Content section */}
            <div className="p-8 md:p-12">
              {/* Opening statement */}
              <div className="space-y-4 mb-8">
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="text-2xl md:text-3xl lg:text-4xl font-light text-foreground/80 leading-relaxed"
                >
                  Most people manage life alone.
                </motion.p>
                <motion.p 
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-2xl md:text-3xl lg:text-4xl font-bold leading-relaxed"
                >
                  <span className="bg-gradient-to-r from-gold via-gold/90 to-amber-500 bg-clip-text text-transparent">
                    Billionaires build systems.
                  </span>
                </motion.p>
              </div>

              {/* Supporting text */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-3xl"
              >
                They rely on teams—family offices, investment committees, department heads, personal chiefs of staff—whose job is to reduce mistakes, defend time, and move with certainty.
              </motion.p>

              {/* Expanded content */}
              <motion.div
                initial={false}
                animate={{ 
                  height: isExpanded ? "auto" : 0,
                  opacity: isExpanded ? 1 : 0 
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pt-8 border-t border-border/30">
                  <div className="space-y-8">
                    {fullContent.split('\n\n').filter(p => p.trim()).map((paragraph, idx) => {
                      if (paragraph.includes('**')) {
                        const parts = paragraph.split('**');
                        return (
                          <div key={idx} className="space-y-3">
                            <h4 className="text-xl font-semibold text-foreground">{parts[1]}</h4>
                            <p className="text-muted-foreground leading-relaxed">{parts[2]}</p>
                          </div>
                        );
                      }
                      return (
                        <p key={idx} className="text-muted-foreground leading-relaxed">
                          {paragraph}
                        </p>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

              {/* Learn More button */}
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="outline"
                className="mt-8 px-8 py-6 rounded-xl border-gold/30 text-gold hover:bg-gold/10 hover:border-gold/50 transition-all duration-300 group"
              >
                <span className="text-base font-medium">{isExpanded ? "Show Less" : "Learn More"}</span>
                <motion.span
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="w-5 h-5 ml-2" />
                </motion.span>
              </Button>
            </div>
            
            {/* Bottom decorative accent */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/10 to-transparent" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BoardOfAdvisorsSection;
