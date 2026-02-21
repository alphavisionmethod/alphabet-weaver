import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { TrendingUp, Wallet, Sparkles, Play, ZoomIn } from "lucide-react";
import MagneticCard from "./MagneticCard";
import ImageLightbox from "./ImageLightbox";
import businessOsPreview from "@/assets/business-os-preview.jpg";
import financeOsPreview from "@/assets/finance-os-preview.jpg";
import conciergeOsPreview from "@/assets/concierge-os-preview.jpg";

interface Feature {
  name: string;
  desc: string;
}

interface Desk {
  id: string;
  icon: React.ElementType;
  emoji?: string;
  title: string;
  tagline: string;
  description: string;
  features: Feature[];
  gradient: string;
  preview: string;
}

const desks: Desk[] = [
  {
    id: "business",
    icon: TrendingUp,
    title: "Business OS",
    tagline: "Run your business. Not just reports.",
    description: "From lead generation to closing deals, SITA OS manages your sales pipeline, marketing, and operations—automatically.",
    features: [
      { name: "Works for any industry", desc: "E-commerce, professional services, local shops—SITA OS adapts to your specific business model and workflows." },
      { name: "Growth on autopilot", desc: "Find opportunities, reach out to leads, recover lost deals—your GTM runs in a continuous loop." },
      { name: "Full visibility, full control", desc: "Track everything from competitor moves to pipeline health. Every action stays within your policies." },
    ],
    gradient: "from-primary to-primary/60",
    preview: businessOsPreview,
  },
  {
    id: "finance",
    icon: Wallet,
    emoji: "💰",
    title: "Finance OS",
    tagline: "Grow wealth. Cut waste.",
    description: "Find better rates, track spending, manage investments—all under strict limits you define. Your money, optimized.",
    features: [
      { name: "Better rates, always", desc: "SITA OS scans for superior rates on insurance, banking, and credit—never let your capital sit idle." },
      { name: "Invest with guardrails", desc: "Manage your portfolio under strict risk parameters. Capture upside, protect downside." },
      { name: "Approval chains you set", desc: "Every dollar moved requires your sign-off. Full visibility into where money goes." },
    ],
    gradient: "from-accent to-accent/60",
    preview: financeOsPreview,
  },
  {
    id: "concierge",
    icon: Sparkles,
    emoji: "🎩",
    title: "Concierge OS",
    tagline: "Handle the hard stuff.",
    description: "Book travel, negotiate prices, manage subscriptions, remember birthdays. The mental load—handled.",
    features: [
      { name: "Negotiate on your behalf", desc: "Get the best prices on flights, hotels, and services. Bookings execute only after meeting your criteria." },
      { name: "Life logistics, sorted", desc: "Gifts, appointments, school runs, family milestones—no detail overlooked." },
      { name: "Protect your time", desc: "Cancel unused subscriptions, manage vendors, handle the tasks that eat your hours." },
    ],
    gradient: "from-primary via-accent to-primary",
    preview: conciergeOsPreview,
  },
];

const ThreeDesksSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const y2 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  
  const allImages = desks.map(desk => ({ src: desk.preview, alt: `${desk.title} preview` }));

  const scrollToDemo = () => {
    document.getElementById('demo-video')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <section id="three-desks" ref={ref} className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-grid opacity-30" />
      
      {/* Parallax floating orbs */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute -left-48 top-1/3 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div 
        style={{ y: y2 }}
        className="absolute -right-32 bottom-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"
      />

      <div className="container-narrow relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-accent/10 text-accent border border-accent/20 mb-4">
            The Three Desks
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            One AI. <span className="gradient-text">Three roles.</span>
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {desks.map((desk, index) => (
            <motion.div
              key={desk.id}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="relative group flex flex-col"
            >
              <MagneticCard className="flex-1">
                <div 
                  className="glass-card-hover bento-glow h-full lg:min-h-[520px] p-6 lg:p-8 flex flex-col"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    e.currentTarget.style.setProperty("--mouse-x", `${x}%`);
                    e.currentTarget.style.setProperty("--mouse-y", `${y}%`);
                  }}
                >
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 lg:w-14 lg:h-14 rounded-2xl bg-gradient-to-br ${desk.gradient} mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <desk.icon className="w-6 h-6 lg:w-7 lg:h-7 text-background" />
                  </div>

                  {/* Title with emoji */}
                  <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-2">
                    {desk.emoji && <span className="mr-2">{desk.emoji}</span>}
                    {desk.title}
                  </h3>
                  
                  {/* Tagline */}
                  <p className="text-base lg:text-lg font-semibold gradient-text mb-3">{desk.tagline}</p>
                  
                  {/* Description */}
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                    {desk.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-3 flex-1 mb-6">
                    {desk.features.map((feature) => (
                      <div key={feature.name} className="group/feature">
                        <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {feature.name}
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                          {feature.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* CTA - See Demo Video */}
                  <button
                    onClick={scrollToDemo}
                    className="inline-flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity group/btn"
                  >
                    <Play className="w-4 h-4" />
                    <span>See Demo Video</span>
                  </button>
                </div>
              </MagneticCard>

              {/* Preview Image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.15 + 0.3 }}
                className="mt-4"
              >
                <button
                  onClick={() => setLightboxIndex(index)}
                  className="w-full glass-card p-2 rounded-xl overflow-hidden group/preview cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                  style={{ boxShadow: "var(--shadow-glow-combined)" }}
                >
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={desk.preview}
                      alt={`${desk.title} preview`}
                      className="w-full h-36 sm:h-40 md:h-44 lg:h-48 object-cover transition-transform duration-500 group-hover/preview:scale-110"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-background/60 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="p-3 rounded-full bg-primary/20 backdrop-blur-sm">
                        <ZoomIn className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </div>
                </button>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      <ImageLightbox
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
        src={lightboxIndex !== null ? allImages[lightboxIndex]?.src : ""}
        alt={lightboxIndex !== null ? allImages[lightboxIndex]?.alt : ""}
        images={allImages}
        currentIndex={lightboxIndex ?? 0}
        onNavigate={setLightboxIndex}
      />
    </section>
  );
};

export default ThreeDesksSection;
