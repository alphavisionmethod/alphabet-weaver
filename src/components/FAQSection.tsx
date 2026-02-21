import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What exactly is SITA OS?",
    answer: "Think of it as a highly capable assistant that actually does things—pays bills, sends emails, books travel, manages your pipeline—but only within rules you set. Every action is logged. You're always in control.",
  },
  {
    question: "How is this different from ChatGPT or other AI assistants?",
    answer: "ChatGPT gives you text. SITA OS gives you results. It doesn't just suggest—it acts, safely. Every action follows your rules and creates a verifiable record.",
  },
  {
    question: "What do you mean by 'governed execution'?",
    answer: "Every action SITA OS takes is constrained by rules you define. Spending limits, approval chains, risk thresholds—you set the boundaries. Full transparency, full control.",
  },
  {
    question: "Can I control how much autonomy the AI has?",
    answer: "Yes. Start with 'I suggest, you do' where you're fully hands-on. Progress to 'I run it, you relax' for routine tasks. You choose the level for each task, and you can change it anytime.",
  },
  {
    question: "What types of tasks can SITA OS handle?",
    answer: "Business: leads, pipeline, marketing. Finance: expenses, investments, rates. Lifestyle: travel, subscriptions, appointments. If it can follow a rule, SITA OS can handle it.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes. Every action is encrypted, auditable, and only visible to you. We don't sell your data. Ever.",
  },
  {
    question: "When will SITA OS be available?",
    answer: "We're in private beta now. Join the waitlist for early access. Beta participants get lifetime priority access and help shape the product.",
  },
];

const FAQSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="faq" ref={ref} className="section-padding relative overflow-hidden">
      {/* Light leak effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container-narrow relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20 mb-4">
            FAQ
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to know about SITA OS and governed AI execution.
          </p>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="glass-card border-0 rounded-xl overflow-hidden px-6 data-[state=open]:border-primary/30"
                >
                  <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline py-5 text-base font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 text-sm leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
