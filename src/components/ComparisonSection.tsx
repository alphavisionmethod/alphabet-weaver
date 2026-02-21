import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Check, X, Minus } from "lucide-react";

type Val = "yes" | "no" | "partial";

const features: { label: string; sita: Val; chatgpt: Val; traditional: Val }[] = [
  { label: "Governed Execution", sita: "yes", chatgpt: "no", traditional: "no" },
  { label: "Cryptographic Receipts", sita: "yes", chatgpt: "no", traditional: "no" },
  { label: "Autonomy Levels (0-5)", sita: "yes", chatgpt: "no", traditional: "partial" },
  { label: "Policy Gates", sita: "yes", chatgpt: "no", traditional: "partial" },
  { label: "Shadow Mode Testing", sita: "yes", chatgpt: "no", traditional: "no" },
  { label: "Multi-Advisor Board", sita: "yes", chatgpt: "no", traditional: "no" },
  { label: "Real-Time Audit Trail", sita: "yes", chatgpt: "partial", traditional: "partial" },
  { label: "Human Override", sita: "yes", chatgpt: "partial", traditional: "yes" },
];

function Icon({ v }: { v: Val }) {
  if (v === "yes") return <Check className="w-5 h-5 text-emerald-400" />;
  if (v === "no") return <X className="w-5 h-5 text-red-400/60" />;
  return <Minus className="w-5 h-5 text-muted-foreground" />;
}

export default function ComparisonSection() {
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
            COMPETITIVE EDGE
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
            How SITA OS <span className="gradient-text">compares</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-3 max-w-lg mx-auto">
            Not another chatbot. A governed execution system with accountability built in.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="glass-card overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-sm font-medium text-muted-foreground p-4">Feature</th>
                  <th className="text-center text-sm font-bold text-primary p-4">SITA OS</th>
                  <th className="text-center text-sm font-medium text-muted-foreground p-4">ChatGPT / AI Agents</th>
                  <th className="text-center text-sm font-medium text-muted-foreground p-4">Traditional Automation</th>
                </tr>
              </thead>
              <tbody>
                {features.map((f, i) => (
                  <tr key={f.label} className={`border-b border-border/50 ${i % 2 === 0 ? "bg-muted/20" : ""}`}>
                    <td className="p-4 text-sm font-medium text-foreground">{f.label}</td>
                    <td className="p-4 text-center"><div className="flex justify-center"><Icon v={f.sita} /></div></td>
                    <td className="p-4 text-center"><div className="flex justify-center"><Icon v={f.chatgpt} /></div></td>
                    <td className="p-4 text-center"><div className="flex justify-center"><Icon v={f.traditional} /></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
