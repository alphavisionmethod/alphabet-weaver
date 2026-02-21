import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

interface TrustMeterProps {
  approvedCount: number;
  deniedCount: number;
}

export function TrustMeter({ approvedCount, deniedCount }: TrustMeterProps) {
  // Trust starts at 2.0, increases by 0.4 per approval, decreases 0.1 per denial, max 5
  const trust = Math.min(5, Math.max(0, 2.0 + approvedCount * 0.4 - deniedCount * 0.1));
  const pct = (trust / 5) * 100;

  const label = trust < 2 ? 'Building' : trust < 3.5 ? 'Established' : trust < 4.5 ? 'High' : 'Full delegation';

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border bg-card/80">
      <ShieldCheck className="h-3.5 w-3.5 text-primary flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">Trust</span>
          <span className="text-[10px] font-medium text-foreground">{trust.toFixed(1)} / 5</span>
        </div>
        <div className="w-full h-1 rounded-full bg-muted mt-0.5 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: '40%' }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <span className="text-[9px] text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
