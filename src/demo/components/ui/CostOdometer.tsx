import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CostOdometerProps {
  cents: number;
}

function Digit({ value }: { value: string }) {
  return (
    <span className="inline-block w-[7px] overflow-hidden relative h-[14px]">
      <AnimatePresence mode="popLayout">
        <motion.span
          key={value}
          initial={{ y: -14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 14, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute inset-0 flex items-center justify-center text-[11px] font-mono font-bold text-primary"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function CostOdometer({ cents }: CostOdometerProps) {
  const [displayCents, setDisplayCents] = useState(0);
  const targetRef = useRef(0);
  const rafRef = useRef<number>();

  useEffect(() => {
    targetRef.current = cents;
    const tick = () => {
      setDisplayCents(prev => {
        if (prev >= targetRef.current) return targetRef.current;
        return prev + 1;
      });
      if (displayCents < targetRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [cents]);

  // Tick up one cent at a time with delay
  useEffect(() => {
    if (displayCents < cents) {
      const t = setTimeout(() => setDisplayCents(d => d + 1), 80);
      return () => clearTimeout(t);
    }
  }, [displayCents, cents]);

  const dollars = (displayCents / 100).toFixed(2);
  const chars = `$${dollars}`.split('');

  return (
    <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-primary/5 border border-primary/10">
      <span className="text-[8px] text-muted-foreground mr-1 tracking-wider">AI COST</span>
      <div className="flex items-center">
        {chars.map((char, i) => (
          char === '$' || char === '.'
            ? <span key={i} className="text-[11px] font-mono font-bold text-primary">{char}</span>
            : <Digit key={i} value={char} />
        ))}
      </div>
    </div>
  );
}
