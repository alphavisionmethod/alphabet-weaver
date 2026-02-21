import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRightLeft, TrendingDown, TrendingUp } from 'lucide-react';
import type { ActionCategory } from '../contracts';

const COUNTERFACTUALS: Record<ActionCategory, { without: string[]; with: string[]; savings?: string }> = {
  insurance: {
    without: ['+$1,140/year cost', 'Renewal auto-locked', 'No renegotiation possible'],
    with: ['$1,140 savings captured', 'Rate locked at lower premium', 'Negotiation transcript on file'],
    savings: '$1,140/yr',
  },
  leads: {
    without: ['20 leads decay to 0', '$18,400 pipeline lost', 'Competitors capture attention'],
    with: ['4 meetings booked', '$18,400 revenue revived', 'Consent rules preserved'],
    savings: '$18,400',
  },
  travel: {
    without: ['Prices increase 12% in 3 days', 'Preferred hotel sold out', 'Schedule conflicts unresolved'],
    with: ['Locked best rate', 'Preferred room secured', 'Calendar conflicts resolved'],
    savings: '$340',
  },
  gifts: {
    without: ['Anniversary forgotten', 'Relationship stress spike', 'Emergency gift premium +40%'],
    with: ['Thoughtful gift selected', 'Delivered on time', 'Within budget'],
  },
  investing: {
    without: ['Opportunity window closes', 'Information asymmetry grows', 'Decision paralysis continues'],
    with: ['Opportunity flagged early', 'Risk analysis ready', 'No commitment without approval'],
  },
};

interface CounterfactualToggleProps {
  category: ActionCategory;
}

export function CounterfactualToggle({ category }: CounterfactualToggleProps) {
  const [showCounterfactual, setShowCounterfactual] = useState(false);
  const data = COUNTERFACTUALS[category];

  return (
    <div className="rounded-lg border border-border bg-card p-3 space-y-2">
      <button
        onClick={() => setShowCounterfactual(!showCounterfactual)}
        className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors w-full"
      >
        <ArrowRightLeft className="h-3 w-3" />
        {showCounterfactual ? 'Hide counterfactual' : 'What if I didn\'t act?'}
      </button>

      <AnimatePresence>
        {showCounterfactual && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-destructive">
                  <TrendingDown className="h-3 w-3" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">Without action</span>
                </div>
                {data.without.map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-xs text-destructive/80"
                  >
                    {line}
                  </motion.p>
                ))}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-green-500">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">With action</span>
                </div>
                {data.with.map((line, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-xs text-green-500/80"
                  >
                    {line}
                  </motion.p>
                ))}
              </div>
            </div>
            {data.savings && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-2 pt-2 border-t border-border text-center"
              >
                <span className="text-xs text-primary font-medium">
                  Net value of action: {data.savings}
                </span>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
