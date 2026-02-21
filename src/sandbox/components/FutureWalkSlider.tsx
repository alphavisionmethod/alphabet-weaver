import { useState } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Clock } from 'lucide-react';

const FUTURE_SNAPSHOTS: Record<number, { savings: string; pipeline: string; stress: string; events: string }> = {
  0: { savings: '$0', pipeline: '$18,400', stress: 'High', events: 'Just started' },
  7: { savings: '$380', pipeline: '$22,100', stress: 'Medium', events: 'Anniversary gift delivered ✓' },
  14: { savings: '$740', pipeline: '$26,800', stress: 'Medium-Low', events: 'Insurance locked ✓' },
  30: { savings: '$1,480', pipeline: '$34,200', stress: 'Low', events: 'Travel completed ✓ · 3 deals closed ✓' },
};

function getSnapshot(day: number) {
  const keys = Object.keys(FUTURE_SNAPSHOTS).map(Number).sort((a, b) => a - b);
  let best = keys[0];
  for (const k of keys) {
    if (k <= day) best = k;
  }
  return FUTURE_SNAPSHOTS[best];
}

export function FutureWalkSlider() {
  const [day, setDay] = useState(0);
  const snapshot = getSnapshot(day);

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-foreground">Future Walk</span>
        <span className="text-xs text-muted-foreground ml-auto">+{day} days</span>
      </div>

      <Slider
        value={[day]}
        onValueChange={([v]) => setDay(v)}
        min={0}
        max={30}
        step={1}
      />

      <motion.div
        key={day}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 gap-2"
      >
        <div className="p-2 rounded-md bg-muted/50">
          <p className="text-[10px] text-muted-foreground uppercase">Savings</p>
          <p className="text-sm font-medium text-green-500">{snapshot.savings}</p>
        </div>
        <div className="p-2 rounded-md bg-muted/50">
          <p className="text-[10px] text-muted-foreground uppercase">Pipeline</p>
          <p className="text-sm font-medium text-primary">{snapshot.pipeline}</p>
        </div>
        <div className="p-2 rounded-md bg-muted/50">
          <p className="text-[10px] text-muted-foreground uppercase">Stress</p>
          <p className="text-sm font-medium text-foreground">{snapshot.stress}</p>
        </div>
        <div className="p-2 rounded-md bg-muted/50 col-span-1">
          <p className="text-[10px] text-muted-foreground uppercase">Events</p>
          <p className="text-xs text-foreground">{snapshot.events}</p>
        </div>
      </motion.div>
    </div>
  );
}
