import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemo } from '../../store';

export function ActivityTicker() {
  const { activityLog } = useDemo();
  const [visibleIndex, setVisibleIndex] = useState(0);

  useEffect(() => {
    if (activityLog.length === 0) return;
    setVisibleIndex(activityLog.length - 1);
  }, [activityLog.length]);

  // Auto-cycle through recent entries
  useEffect(() => {
    if (activityLog.length < 2) return;
    const interval = setInterval(() => {
      setVisibleIndex(prev => {
        const start = Math.max(0, activityLog.length - 5);
        const next = prev + 1;
        return next >= activityLog.length ? start : next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [activityLog.length]);

  if (activityLog.length === 0) return null;

  const entry = activityLog[visibleIndex];
  if (!entry) return null;

  return (
    <div className="h-6 flex items-center px-4 border-t border-border/20 bg-card/20 backdrop-blur-sm overflow-hidden flex-shrink-0">
      <div className="flex items-center gap-2 w-full">
        <div className={`h-1 w-1 rounded-full flex-shrink-0 ${
          entry.type === 'policy' ? 'bg-emerald-400' :
          entry.type === 'tool' ? 'bg-primary' :
          entry.type === 'receipt' ? 'bg-accent' : 'bg-muted-foreground/40'
        }`} />
        <AnimatePresence mode="wait">
          <motion.span
            key={`${visibleIndex}-${entry.message}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="text-[9px] font-mono text-muted-foreground truncate"
          >
            {entry.message}
          </motion.span>
        </AnimatePresence>
        <span className="ml-auto text-[8px] text-muted-foreground/40 font-mono flex-shrink-0">
          {entry.timestamp.slice(11, 19)}
        </span>
      </div>
    </div>
  );
}
