import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Calendar, CreditCard, Users, Shield, AlertTriangle } from 'lucide-react';

const CHAOS_ITEMS = [
  { icon: Mail, label: '47 unread emails', x: '10%', y: '15%', rot: -12, color: 'text-destructive' },
  { icon: Mail, label: '12 flagged urgent', x: '65%', y: '8%', rot: 8, color: 'text-destructive' },
  { icon: Calendar, label: 'Meeting conflict 9am', x: '30%', y: '55%', rot: -5, color: 'text-destructive' },
  { icon: Calendar, label: 'Double-booked Wed', x: '75%', y: '45%', rot: 15, color: 'text-accent' },
  { icon: CreditCard, label: 'Insurance renewal due', x: '15%', y: '75%', rot: -8, color: 'text-accent' },
  { icon: CreditCard, label: '$2,400 invoice unpaid', x: '55%', y: '70%', rot: 6, color: 'text-destructive' },
  { icon: Users, label: '20 leads going cold', x: '45%', y: '25%', rot: -3, color: 'text-muted-foreground' },
  { icon: Shield, label: 'Policy renewal lapsing', x: '80%', y: '75%', rot: 10, color: 'text-accent' },
  { icon: AlertTriangle, label: 'Anniversary in 10 days', x: '20%', y: '40%', rot: -15, color: 'text-accent' },
];

interface ChaosSceneProps {
  onComplete: () => void;
}

export function ChaosScene({ onComplete }: ChaosSceneProps) {
  const [phase, setPhase] = useState<'chaos' | 'narrate' | 'resolve'>('chaos');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('narrate'), 2200);
    const t2 = setTimeout(() => setPhase('resolve'), 4500);
    const t3 = setTimeout(() => onComplete(), 6000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {phase !== 'resolve' ? null : (
        <motion.div
          key="fade-out"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        />
      )}
    </AnimatePresence>
  );
}

export function ChaosOverlay({ onComplete }: ChaosSceneProps) {
  const [phase, setPhase] = useState<'chaos' | 'narrate' | 'resolve'>('chaos');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('narrate'), 2500);
    const t2 = setTimeout(() => setPhase('resolve'), 5000);
    const t3 = setTimeout(() => onComplete(), 6500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background"
      initial={{ opacity: 1 }}
      animate={phase === 'resolve' ? { opacity: 0 } : { opacity: 1 }}
      transition={{ duration: 1.5 }}
      style={{ pointerEvents: phase === 'resolve' ? 'none' : 'auto' }}
    >
      {/* Stress meter */}
      <div className="absolute top-6 right-6 flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Stress</span>
        <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-destructive"
            initial={{ width: '20%' }}
            animate={{ width: phase === 'chaos' ? '92%' : '15%' }}
            transition={{ duration: phase === 'chaos' ? 2 : 1.5 }}
          />
        </div>
      </div>

      {/* Floating chaos items */}
      <div className="relative w-full h-full max-w-5xl mx-auto">
        {CHAOS_ITEMS.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={i}
              className={`absolute flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card/80 backdrop-blur-sm ${item.color}`}
              style={{ left: item.x, top: item.y }}
              initial={{ opacity: 0, scale: 0.5, rotate: item.rot }}
              animate={phase === 'chaos' ? {
                opacity: [0, 1],
                scale: 1,
                rotate: item.rot,
                y: [0, -4, 4, -2, 0],
              } : {
                opacity: 0,
                scale: 0.3,
                y: -30,
              }}
              transition={{
                delay: phase === 'chaos' ? i * 0.15 : i * 0.05,
                duration: phase === 'chaos' ? 0.5 : 0.6,
                y: phase === 'chaos' ? { repeat: Infinity, duration: 2 + i * 0.3, ease: 'easeInOut' } : undefined,
              }}
            >
              <Icon className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="text-xs font-medium whitespace-nowrap">{item.label}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Narration */}
      <AnimatePresence>
        {phase === 'narrate' && (
          <motion.div
            className="absolute inset-x-0 bottom-1/3 flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-lg font-medium text-foreground text-center">
              "This is what your life looked like at 6:00am."
            </p>
          </motion.div>
        )}
        {phase === 'resolve' && (
          <motion.div
            className="absolute inset-x-0 bottom-1/3 flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p className="text-lg font-medium text-primary text-center">
              Everything handled. Only 2 items need approval.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
