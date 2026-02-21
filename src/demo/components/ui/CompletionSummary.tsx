import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, RotateCcw, ArrowRight } from 'lucide-react';

interface CompletionSummaryProps {
  visible: boolean;
  stats: {
    workflows: number;
    totalCostCents: number;
    policyGates: number;
    receipts: number;
    decisionsValue: string;
  };
  onReset: () => void;
}

function AnimatedCounter({ target, prefix = '', suffix = '', delay = 0 }: { target: number; prefix?: string; suffix?: string; delay?: number }) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    if (value >= target) return;
    const step = Math.max(1, Math.floor(target / 30));
    const t = setTimeout(() => setValue(v => Math.min(v + step, target)), 40);
    return () => clearTimeout(t);
  }, [value, target, started]);

  return <span>{prefix}{value.toLocaleString()}{suffix}</span>;
}

export function CompletionSummary({ visible, stats, onReset }: CompletionSummaryProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-xl"
        >
          <motion.div
            initial={{ scale: 0.8, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25, delay: 0.1 }}
            className="w-[440px] max-w-[90vw] rounded-2xl border border-border/40 bg-card/80 backdrop-blur-xl shadow-2xl p-8 text-center space-y-6"
          >
            {/* Trophy */}
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.3 }}
            >
              <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground">Mission Complete</h2>
              <p className="text-sm text-muted-foreground">SITA handled everything autonomously.</p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Workflows', value: stats.workflows, suffix: ' completed', delay: 400 },
                { label: 'Decisions', value: 0, prefix: '', customDisplay: stats.decisionsValue, delay: 600 },
                { label: 'Policy Gates', value: stats.policyGates, suffix: ' passed', delay: 800 },
                { label: 'Receipts', value: stats.receipts, suffix: ' minted', delay: 1000 },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: item.delay / 1000 }}
                  className="rounded-xl bg-muted/20 border border-border/20 p-3"
                >
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-lg font-bold text-foreground">
                    {item.customDisplay ?? <AnimatedCounter target={item.value} prefix={item.prefix} suffix={item.suffix} delay={item.delay} />}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Total cost callout */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="rounded-xl bg-primary/5 border border-primary/20 p-3"
            >
              <p className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Total AI Cost</p>
              <p className="text-2xl font-bold text-primary">
                $<AnimatedCounter target={stats.totalCostCents} delay={1200} />
              </p>
              <p className="text-[10px] text-muted-foreground">cents for everything above</p>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="flex gap-3"
            >
              <button
                onClick={onReset}
                className="flex-1 py-2.5 rounded-lg border border-border/40 text-sm text-foreground hover:bg-muted/30 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Run Again
              </button>
              <a
                href="/#fund"
                className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                Back the Project <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
