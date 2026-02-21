import { motion, AnimatePresence } from 'framer-motion';

const REPLACED_TOOLS = [
  { name: 'CRM', cost: 49 },
  { name: 'Calendar AI', cost: 12 },
  { name: 'Email Sequencer', cost: 29 },
  { name: 'Insurance Broker', cost: 75 },
  { name: 'Travel Agent', cost: 25 },
  { name: 'Gift Concierge', cost: 15 },
  { name: 'Portfolio Tracker', cost: 19 },
  { name: 'Risk Analyzer', cost: 39 },
  { name: 'Lead Scorer', cost: 29 },
  { name: 'Task Manager', cost: 9 },
  { name: 'Expense Tracker', cost: 12 },
  { name: 'Doc Signer', cost: 15 },
  { name: 'Analytics Suite', cost: 49 },
  { name: 'Workflow Engine', cost: 29 },
  { name: 'Compliance Logger', cost: 39 },
];

const totalMonthlyCost = REPLACED_TOOLS.reduce((s, t) => s + t.cost, 0);

interface FinalSummaryProps {
  show: boolean;
  interactionCount: number;
  actionCount: number;
}

export function FinalSummary({ show, interactionCount, actionCount }: FinalSummaryProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />
          <motion.div
            className="relative max-w-lg w-full text-center space-y-6 p-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {/* Core impact lines */}
            <motion.p
              className="text-lg text-foreground leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              "You interacted with me <span className="text-primary font-semibold">{interactionCount}</span> times."
            </motion.p>
            <motion.p
              className="text-lg text-foreground leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              "I handled <span className="text-primary font-semibold">{actionCount}</span> actions."
            </motion.p>
            <motion.p
              className="text-lg text-foreground leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.2 }}
            >
              "Nothing executed without permission."
            </motion.p>
            <motion.p
              className="text-lg text-primary font-semibold leading-relaxed"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3.0 }}
            >
              "Everything is provable."
            </motion.p>

            {/* 15 tools replacement stat */}
            <motion.div
              className="pt-4 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 4.0, duration: 0.8 }}
            >
              <div className="h-px bg-border" />

              <p className="text-sm text-muted-foreground">
                This replaces <span className="text-foreground font-semibold">15 tools</span>.
              </p>

              {/* Cost comparison bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>15 separate tools</span>
                  <span className="text-foreground font-medium">${totalMonthlyCost}/mo</span>
                </div>
                <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-destructive/60"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 4.4, duration: 0.8, ease: 'easeOut' }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>SITA OS</span>
                  <span className="text-primary font-medium">One system</span>
                </div>
                <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: '12%' }}
                    transition={{ delay: 4.8, duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Scrolling tool names */}
              <motion.div
                className="flex flex-wrap justify-center gap-1.5 pt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 5.2 }}
              >
                {REPLACED_TOOLS.map((tool, i) => (
                  <motion.span
                    key={tool.name}
                    className="px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground border border-border line-through decoration-destructive/40"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.7, scale: 1 }}
                    transition={{ delay: 5.2 + i * 0.06 }}
                  >
                    {tool.name}
                  </motion.span>
                ))}
              </motion.div>

              <motion.p
                className="text-xs text-muted-foreground italic pt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 6.4 }}
              >
                And it gets cheaper as autonomy increases.
              </motion.p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
