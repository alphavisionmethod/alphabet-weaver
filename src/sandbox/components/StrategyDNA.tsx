import { motion } from 'framer-motion';
import { Dna, TrendingDown } from 'lucide-react';

const STRATEGY_EVENTS = [
  { date: 'Aug 2024', label: 'v1: Conservative allocation', volatility: '22%' },
  { date: 'Nov 2024', label: 'v2: Added sector diversification', volatility: '16%' },
  { date: 'Current', label: 'v3: Risk-parity + momentum filter', volatility: '8%' },
];

export function StrategyDNA() {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Dna className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-foreground">Strategy DNA</span>
      </div>
      <p className="text-[10px] text-muted-foreground">
        Your investment strategy evolved twice in 6 months. Current version reduced volatility by 14%.
      </p>
      <div className="space-y-1.5">
        {STRATEGY_EVENTS.map((evt, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.15 }}
            className="flex items-center gap-2 text-xs"
          >
            <span className="w-16 text-[10px] text-muted-foreground flex-shrink-0">{evt.date}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            <span className="text-foreground flex-1">{evt.label}</span>
            <div className="flex items-center gap-1 text-muted-foreground">
              <TrendingDown className="h-2.5 w-2.5" />
              <span className="text-[10px]">{evt.volatility}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
