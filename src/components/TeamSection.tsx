import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Linkedin } from "lucide-react";

const founders = [
  {
    name: "Founder Name",
    role: "CEO & Co-Founder",
    bio: "Vision, strategy, and governance architecture.",
    linkedin: "#",
    initials: "FN",
  },
  {
    name: "Co-Founder Name",
    role: "CTO & Co-Founder",
    bio: "Systems engineering, AI safety, and infrastructure.",
    linkedin: "#",
    initials: "CF",
  },
  {
    name: "Advisor Name",
    role: "Chief Science Officer",
    bio: "Machine learning, adversarial robustness, and trust systems.",
    linkedin: "#",
    initials: "AN",
  },
];

export default function TeamSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="section-padding relative overflow-hidden">
      <div className="container-narrow">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary mb-4">
            THE TEAM
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            Who's <span className="gradient-text">building this</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-lg mx-auto">
            Investors fund people. Here's who's behind SITA OS.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {founders.map((f, i) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="glass-card-hover p-8 text-center"
            >
              {/* Avatar placeholder */}
              <div className="w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center bg-gradient-to-br from-primary/30 to-accent/30 border border-primary/20">
                <span className="text-xl font-bold gradient-text">{f.initials}</span>
              </div>

              <h3 className="text-lg font-semibold text-foreground">{f.name}</h3>
              <p className="text-xs font-medium text-primary mt-1">{f.role}</p>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{f.bio}</p>

              <a
                href={f.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
