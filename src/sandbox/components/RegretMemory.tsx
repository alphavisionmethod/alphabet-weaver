import { motion, AnimatePresence } from 'framer-motion';
import { Brain, AlertCircle } from 'lucide-react';
import type { ActionCategory } from '../contracts';

const REGRETS: Record<ActionCategory, { memory: string; avoidance: string } | null> = {
  insurance: {
    memory: 'Last year, you delayed renewal by 3 weeks. Premium spiked 18% and caused a $420 overpayment.',
    avoidance: 'I initiated comparison 30 days early this cycle. Pattern avoided.',
  },
  leads: {
    memory: 'In Q2 2024, 12 warm leads went cold after 14 days without follow-up. $9,200 in pipeline evaporated.',
    avoidance: 'I re-engaged all dormant leads within 48 hours. Consent rules preserved.',
  },
  travel: {
    memory: 'Last trip was booked 3 days before departure. Hotel cost was 34% above market. Stress score: 8.2/10.',
    avoidance: 'This itinerary was simulated 14 days out. Both options are 20%+ below rush pricing.',
  },
  gifts: null,
  investing: {
    memory: 'In September 2024, a similar opportunity was flagged but timing was off — market dropped 11% within 2 weeks.',
    avoidance: 'I added a 14-day deferral recommendation. Volatility check embedded.',
  },
};

interface RegretMemoryProps {
  category: ActionCategory;
}

export function RegretMemory({ category }: RegretMemoryProps) {
  const regret = REGRETS[category];
  if (!regret) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="rounded-lg border border-accent/20 bg-accent/5 p-3 space-y-2"
    >
      <div className="flex items-center gap-2">
        <Brain className="h-3.5 w-3.5 text-accent" />
        <span className="text-[10px] font-medium text-accent uppercase tracking-wider">Regret Memory</span>
      </div>
      <div className="flex items-start gap-2 text-xs">
        <AlertCircle className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
        <p className="text-muted-foreground italic">{regret.memory}</p>
      </div>
      <p className="text-xs text-foreground pl-5">{regret.avoidance}</p>
    </motion.div>
  );
}
