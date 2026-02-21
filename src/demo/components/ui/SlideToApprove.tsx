import { useState, useCallback, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ChevronRight, Lock } from 'lucide-react';

interface SlideToApproveProps {
  onApprove: () => void;
  label?: string;
  disabled?: boolean;
}

export function SlideToApprove({ onApprove, label = 'Slide to approve', disabled }: SlideToApproveProps) {
  const [approved, setApproved] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const maxX = 240;

  const bgOpacity = useTransform(x, [0, maxX], [0, 0.15]);
  const textOpacity = useTransform(x, [0, maxX * 0.6], [1, 0]);
  const checkOpacity = useTransform(x, [maxX * 0.8, maxX], [0, 1]);

  const handleDragEnd = useCallback(() => {
    if (x.get() > maxX * 0.85) {
      setApproved(true);
      onApprove();
    } else {
      x.set(0);
    }
  }, [x, maxX, onApprove]);

  if (approved) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center gap-2"
      >
        <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <motion.svg initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4 }} className="h-3 w-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <motion.path d="M5 12l5 5L20 7" />
          </motion.svg>
        </div>
        <span className="text-xs font-medium text-emerald-400">Approved</span>
      </motion.div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative h-12 rounded-xl border border-border/60 bg-card/50 overflow-hidden select-none ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
    >
      {/* Background fill */}
      <motion.div
        className="absolute inset-0 bg-primary"
        style={{ opacity: bgOpacity }}
      />

      {/* Label */}
      <motion.div className="absolute inset-0 flex items-center justify-center" style={{ opacity: textOpacity }}>
        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
          <Lock className="h-3 w-3" />
          {label}
        </span>
      </motion.div>

      {/* Check mark */}
      <motion.div className="absolute inset-0 flex items-center justify-center" style={{ opacity: checkOpacity }}>
        <span className="text-xs text-primary font-medium">Release to confirm</span>
      </motion.div>

      {/* Slider thumb */}
      <motion.div
        className="absolute top-1 left-1 h-10 w-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
        drag="x"
        dragConstraints={{ left: 0, right: maxX }}
        dragElastic={0}
        style={{ x }}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.95 }}
      >
        <ChevronRight className="h-4 w-4 text-primary" />
      </motion.div>
    </div>
  );
}
