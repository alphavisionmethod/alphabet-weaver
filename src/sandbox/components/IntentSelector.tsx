import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Briefcase, Landmark, Brain, Heart, Zap, ClipboardList, Target, DollarSign, Clock } from 'lucide-react';
import type { Persona } from '../contracts';

export type PainPoint = 'stress' | 'admin' | 'missed_opportunities' | 'financial_anxiety' | 'time_pressure';

const PAIN_POINTS = [
  { id: 'stress' as PainPoint, label: 'Stress', icon: Zap, desc: 'Too many decisions, not enough headspace.' },
  { id: 'admin' as PainPoint, label: 'Admin work', icon: ClipboardList, desc: 'Drowning in busywork.' },
  { id: 'missed_opportunities' as PainPoint, label: 'Missed opportunities', icon: Target, desc: 'Things falling through the cracks.' },
  { id: 'financial_anxiety' as PainPoint, label: 'Financial anxiety', icon: DollarSign, desc: 'Not sure if I\'m optimized.' },
  { id: 'time_pressure' as PainPoint, label: 'Time pressure', icon: Clock, desc: 'Never enough hours.' },
] as const;

const PERSONAS = [
  { id: 'founder' as Persona, label: 'Founder', icon: Rocket, desc: 'Revenue, runway, burn.' },
  { id: 'professional' as Persona, label: 'High-Income Professional', icon: Briefcase, desc: 'Time saved + optimization.' },
  { id: 'family_office' as Persona, label: 'Family Office / Investor', icon: Landmark, desc: 'Risk exposure + preservation.' },
  { id: 'neurodivergent' as Persona, label: 'Executive (Clarity Mode)', icon: Brain, desc: 'Fewer items. Clear priority.' },
  { id: 'consumer' as Persona, label: 'Personal Life', icon: Heart, desc: 'Calm. Protective. Safe.' },
] as const;

interface IntentSelectorProps {
  onComplete: (persona: Persona, painPoint?: PainPoint) => void;
}

export function IntentSelector({ onComplete }: IntentSelectorProps) {
  const [painPoint, setPainPoint] = useState<PainPoint | null>(null);
  const [selected, setSelected] = useState<Persona | null>(null);
  const [phase, setPhase] = useState<'pain' | 'persona' | 'transitioning'>('pain');

  const handlePainContinue = () => {
    setPhase('persona');
  };

  const handlePersonaContinue = () => {
    setPhase('transitioning');
    setTimeout(() => onComplete(selected || 'consumer', painPoint || undefined), 1200);
  };

  return (
    <AnimatePresence mode="wait">
      {phase === 'pain' && (
        <motion.div
          key="pain"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5 } }}
        >
          <div className="absolute inset-0 bg-background" />
          <motion.div
            className="relative max-w-lg w-full text-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <motion.p
              className="text-lg text-muted-foreground italic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Before we start —
            </motion.p>
            <motion.h1
              className="text-2xl md:text-3xl font-semibold text-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              What do you want less of?
            </motion.h1>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              {PAIN_POINTS.map(({ id, label, icon: Icon, desc }, i) => (
                <motion.button
                  key={id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4 + i * 0.1 }}
                  onClick={() => setPainPoint(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 text-left ${
                    painPoint === id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card/50 hover:border-primary/50'
                  }`}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${painPoint === id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <p className={`text-sm font-medium ${painPoint === id ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</p>
                    <p className="text-[11px] text-muted-foreground">{desc}</p>
                  </div>
                </motion.button>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.0 }}
            >
              <button
                onClick={handlePainContinue}
                disabled={!painPoint}
                className="px-6 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {phase === 'persona' && (
        <motion.div
          key="persona"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8 } }}
        >
          <div className="absolute inset-0 bg-background" />
          <motion.div
            className="relative max-w-lg w-full text-center space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <motion.h1
              className="text-2xl md:text-3xl font-semibold text-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Who are you right now?
            </motion.h1>

            <motion.div
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {PERSONAS.map(({ id, label, icon: Icon, desc }, i) => (
                <motion.button
                  key={id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  onClick={() => setSelected(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 text-left ${
                    selected === id
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card/50 hover:border-primary/50'
                  }`}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${selected === id ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <p className={`text-sm font-medium ${selected === id ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</p>
                    <p className="text-[11px] text-muted-foreground">{desc}</p>
                  </div>
                </motion.button>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              <button
                onClick={handlePersonaContinue}
                disabled={!selected}
                className="px-6 py-2.5 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Show me
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      {phase === 'transitioning' && (
        <motion.div
          key="transition"
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
        >
          <div className="absolute inset-0 bg-background" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
