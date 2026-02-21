import { motion, AnimatePresence } from 'framer-motion';
import { useDemo } from '../../store';
import { useAutoplayProgress } from '../../hooks/useAutoplay';
import { Film, Pause } from 'lucide-react';

export function AutoplayProgressBar() {
  const { autoplayActive, stopAutoplay } = useDemo();
  const progress = useAutoplayProgress();

  if (!autoplayActive || !progress) return null;

  const { act, actLabel, stepInAct, stepsInAct, overallProgress, estimatedSecondsLeft } = progress;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.round(s % 60);
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-10 left-0 right-0 z-30 flex items-center gap-3 px-4 py-1.5 bg-card/60 backdrop-blur-md border-b border-primary/10"
      >
        {/* Film icon */}
        <Film className="h-3 w-3 text-primary flex-shrink-0" />

        {/* Act indicator */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3].map(a => (
            <div key={a} className="flex items-center gap-1">
              <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all duration-300 ${
                a < act ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                a === act ? 'bg-primary/20 text-primary border border-primary/40 shadow-[0_0_8px_hsl(var(--primary)/0.3)]' :
                'bg-muted/20 text-muted-foreground border border-border/30'
              }`}>
                {a < act ? '✓' : a}
              </div>
              {a < 3 && <div className={`w-4 h-px transition-colors duration-300 ${a < act ? 'bg-emerald-500/40' : 'bg-border/30'}`} />}
            </div>
          ))}
        </div>

        {/* Act label */}
        <motion.span
          key={actLabel}
          initial={{ opacity: 0, x: 5 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-[9px] font-semibold text-foreground tracking-tight truncate max-w-[180px]"
        >
          {actLabel}
        </motion.span>

        {/* Progress bar */}
        <div className="flex-1 h-1 rounded-full bg-muted/20 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary"
            animate={{ width: `${overallProgress * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>

        {/* Step counter */}
        <span className="text-[8px] text-muted-foreground font-mono whitespace-nowrap">
          {stepInAct}/{stepsInAct}
        </span>

        {/* ETA */}
        <span className="text-[8px] text-muted-foreground font-mono whitespace-nowrap">
          ~{formatTime(estimatedSecondsLeft)}
        </span>

        {/* Stop button */}
        <button
          onClick={stopAutoplay}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
          title="Stop autoplay"
        >
          <Pause className="h-3 w-3" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
