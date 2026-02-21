import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Play } from "lucide-react";
import sitaDemo from "@/assets/sita-demo.mp4";

const DemoVideoSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      id="demo-video"
      ref={ref}
      className="section-padding relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      
      {/* Parallax orb */}
      <motion.div
        style={{ y }}
        className="absolute -right-32 top-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none"
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
            See It In Action
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            A Day with <span className="gradient-text">SitaOs...</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            Watch how SITA OS transforms your daily operations with governed autonomy.
          </p>
        </motion.div>

        {/* Video Container */}
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Glow effect behind video */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-3xl blur-2xl opacity-50" />
          
          {/* Glass frame */}
          <div className="relative glass-card p-3 rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-glow-combined)" }}>
            {/* Inner container with border */}
            <div className="relative rounded-xl overflow-hidden border border-border/50 bg-background/50">
              {/* Video player */}
              <video
                className="w-full aspect-video object-cover"
                controls
                poster=""
                preload="metadata"
              >
                <source src={sitaDemo} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              
              {/* Decorative corner accents */}
              <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-primary/30 rounded-tl-xl pointer-events-none" />
              <div className="absolute top-0 right-0 w-16 h-16 border-r-2 border-t-2 border-accent/30 rounded-tr-xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-16 h-16 border-l-2 border-b-2 border-accent/30 rounded-bl-xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-primary/30 rounded-br-xl pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Optional caption */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center text-sm text-muted-foreground mt-6"
        >
          Experience the future of governed AI execution
        </motion.p>
      </div>
    </section>
  );
};

export default DemoVideoSection;
