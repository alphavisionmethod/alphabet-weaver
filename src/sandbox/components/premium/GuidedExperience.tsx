import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OrbAvatar } from './OrbAvatar';
import { getGuidedSequence, GUIDED_VOICE_LINES, type SimResult } from '../../lib/simulationEngine';
import { useVoice } from '../../hooks/useVoice';
import { CheckCircle, Volume2, VolumeX, ShieldCheck } from 'lucide-react';

interface GuidedExperienceProps {
  name: string;
  onComplete: (receipts: SimResult[]) => void;
  onWowMoment: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  lead_recovery: '👥',
  insurance_quote: '🛡️',
  gift: '🎁',
  investing: '📊',
  travel: '✈️',
};

export function GuidedExperience({ name, onComplete, onWowMoment }: GuidedExperienceProps) {
  const [step, setStep] = useState(-1);
  const [receipts, setReceipts] = useState<SimResult[]>([]);
  const [showWow, setShowWow] = useState(false);
  const [done, setDone] = useState(false);
  const { isSpeaking, muted, speak, toggleMute } = useVoice();
  const sequence = useRef(getGuidedSequence()).current;
  const hasSpoken = useRef<Set<number>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => {
      if (!muted && !hasSpoken.current.has(-1)) {
        hasSpoken.current.add(-1);
        speak([`Good morning, ${name}. Let me show you what happened while you slept.`]);
      }
      setTimeout(() => setStep(0), 2500);
    }, 1200);
    return () => clearTimeout(t);
  }, [name, muted, speak]);

  useEffect(() => {
    if (step < 0 || step >= sequence.length) return;
    const current = sequence[step];
    setReceipts(prev => {
      if (prev.find(r => r.id === current.id)) return prev;
      return [...prev, current];
    });
    if (!muted && !hasSpoken.current.has(step)) {
      hasSpoken.current.add(step);
      speak([GUIDED_VOICE_LINES[step]]);
    }
    const t = setTimeout(() => {
      if (step < sequence.length - 1) {
        setStep(s => s + 1);
      } else {
        setTimeout(() => {
          if (!muted && !hasSpoken.current.has(99)) {
            hasSpoken.current.add(99);
            speak([GUIDED_VOICE_LINES[5]]);
          }
          setShowWow(true);
          onWowMoment();
          setTimeout(() => setDone(true), 3000);
        }, 1500);
      }
    }, 3200);
    return () => clearTimeout(t);
  }, [step, sequence, muted, speak, onWowMoment]);

  const handleContinue = useCallback(() => {
    onComplete(receipts);
  }, [receipts, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-lg w-full px-6 space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <OrbAvatar speaking={isSpeaking} size="md" />
            <div>
              <p className="text-sm font-medium text-foreground">SITA</p>
              <p className="text-xs text-muted-foreground">
                {isSpeaking ? 'Speaking...' : step < 0 ? 'Waking up...' : 'Processing'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleMute}
            className="p-2 rounded-full transition-colors bg-muted"
          >
            {muted ? (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Volume2 className="h-4 w-4 text-foreground" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {step === -1 && (
            <motion.p
              className="text-xl font-light text-center text-foreground"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6 }}
            >
              Good morning, {name}.
            </motion.p>
          )}
        </AnimatePresence>

        <div className="space-y-3 min-h-[300px]">
          <AnimatePresence>
            {receipts.map((receipt) => (
              <motion.div
                key={receipt.id}
                className="rounded-2xl p-4 backdrop-blur-md bg-card border border-border"
                style={{ boxShadow: '0 2px 16px hsl(var(--border) / 0.3)' }}
                initial={{ opacity: 0, y: 20, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg mt-0.5">{TYPE_ICONS[receipt.type] || '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{receipt.title}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1">
                          <ShieldCheck className="h-3 w-3" style={{ color: 'hsl(270 91% 55%)' }} />
                          <span className="text-[9px] font-semibold uppercase" style={{ color: 'hsl(270 91% 55%)' }}>
                            {receipt.policyVerdict}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" style={{ color: 'hsl(150 60% 45%)' }} />
                          <span className="text-[10px] font-medium" style={{ color: 'hsl(150 60% 45%)' }}>
                            {Math.round(receipt.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs mt-1 leading-relaxed text-muted-foreground">
                      {receipt.description}
                    </p>
                    {receipt.simulatedSavings && (
                      <p className="text-xs font-medium mt-1.5" style={{ color: 'hsl(38 95% 54%)' }}>
                        ${receipt.simulatedSavings.toLocaleString()} saved
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showWow && (
            <motion.div
              className="text-center space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <p className="text-lg font-light text-foreground">
                All of this happened while you slept.
              </p>
              {done && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  onClick={handleContinue}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium text-white transition-all"
                  style={{
                    background: 'linear-gradient(135deg, hsl(270 91% 55%), hsl(38 95% 54%))',
                    boxShadow: '0 4px 20px hsl(270 91% 55% / 0.3)',
                  }}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Explore what else I can do
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
