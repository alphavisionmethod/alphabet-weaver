import { motion } from 'framer-motion';
import { useDemo } from '../../store';
import { Shield, Wrench, Receipt } from 'lucide-react';
import { useRef, useEffect } from 'react';

export function TimelineScrubber() {
  const { activityLog } = useDemo();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [activityLog.length]);

  if (activityLog.length === 0) return null;

  const iconMap = {
    policy: Shield,
    tool: Wrench,
    receipt: Receipt,
    system: Shield,
  };

  const colorMap = {
    policy: 'bg-blue-500/80',
    tool: 'bg-amber-500/80',
    receipt: 'bg-emerald-500/80',
    system: 'bg-muted-foreground/50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-8 border-t border-border/20 bg-card/40 backdrop-blur-sm flex items-center px-3 gap-2 flex-shrink-0"
    >
      <span className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
        Timeline
      </span>
      <div className="h-px flex-1 bg-border/20 relative" />
      <div
        ref={scrollRef}
        className="flex items-center gap-1.5 overflow-x-auto scrollbar-none flex-1"
      >
        {activityLog.map((entry, i) => {
          const Icon = iconMap[entry.type];
          const bgColor = colorMap[entry.type];
          return (
            <motion.div
              key={i}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              className="group relative flex-shrink-0"
            >
              <div className={`w-4 h-4 rounded-full ${bgColor} flex items-center justify-center cursor-pointer hover:scale-125 transition-transform`}>
                <Icon className="w-2 h-2 text-white" />
              </div>
              {/* Tooltip */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 hidden group-hover:block z-50">
                <div className="px-2 py-1 rounded bg-popover border border-border text-[9px] text-popover-foreground whitespace-nowrap shadow-lg">
                  {entry.message}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      <span className="text-[9px] text-muted-foreground tabular-nums">
        {activityLog.length}
      </span>
    </motion.div>
  );
}
