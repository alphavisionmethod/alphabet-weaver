import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Cloud, Cpu, Shield, Zap, Globe, Lock } from "lucide-react";

const logos = [
  { icon: Cloud, label: "AWS" },
  { icon: Shield, label: "SOC 2" },
  { icon: Cpu, label: "OpenAI" },
  { icon: Zap, label: "Stripe" },
  { icon: Globe, label: "Cloudflare" },
  { icon: Lock, label: "Vault" },
];

export default function LogoBar() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="py-12 px-6 border-y border-border/50">
      <div className="container-narrow">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-8"
        >
          Building with industry-leading infrastructure
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap"
        >
          {logos.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
