import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ADVISORS } from '../../data';
import type { Advisor } from '../../types';

interface AdvisorVoteAnimationProps {
  onComplete?: () => void;
}

const STANCE_CONFIG = {
  approve: { color: 'bg-emerald-400', label: 'APPROVE', textColor: 'text-emerald-400' },
  caution: { color: 'bg-amber-400', label: 'CAUTION', textColor: 'text-amber-400' },
  reject: { color: 'bg-red-400', label: 'REJECT', textColor: 'text-red-400' },
};

export function AdvisorVoteAnimation({ onComplete }: AdvisorVoteAnimationProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [showVerdict, setShowVerdict] = useState(false);

  useEffect(() => {
    if (revealedCount < ADVISORS.length) {
      const t = setTimeout(() => setRevealedCount(c => c + 1), 250);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => { setShowVerdict(true); onComplete?.(); }, 600);
      return () => clearTimeout(t);
    }
  }, [revealedCount, onComplete]);

  const revealed = ADVISORS.slice(0, revealedCount);
  const tally = { approve: 0, caution: 0, reject: 0 };
  revealed.forEach(a => tally[a.stance]++);
  const total = revealed.length;

  return (
    <div className="space-y-3">
      {/* Tally bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[9px] text-muted-foreground">
          <span>{total} / {ADVISORS.length} voted</span>
          <div className="flex gap-3">
            <span className="text-emerald-400">{tally.approve} approve</span>
            <span className="text-amber-400">{tally.caution} caution</span>
            <span className="text-red-400">{tally.reject} reject</span>
          </div>
        </div>
        <div className="h-2 rounded-full bg-muted/30 overflow-hidden flex">
          {total > 0 && (
            <>
              <motion.div
                className="h-full bg-emerald-400/80"
                animate={{ width: `${(tally.approve / ADVISORS.length) * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
              <motion.div
                className="h-full bg-amber-400/80"
                animate={{ width: `${(tally.caution / ADVISORS.length) * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
              <motion.div
                className="h-full bg-red-400/80"
                animate={{ width: `${(tally.reject / ADVISORS.length) * 100}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </>
          )}
        </div>
      </div>

      {/* Advisor cards */}
      <div className="space-y-1.5 max-h-[260px] overflow-y-auto">
        {revealed.map((a: Advisor, i: number) => {
          const cfg = STANCE_CONFIG[a.stance];
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, rotateX: -90, originY: 0 }}
              animate={{ opacity: 1, rotateX: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="rounded-lg border border-border/30 bg-card/50 p-2 flex items-center gap-2"
            >
              <div className={`h-2 w-2 rounded-full ${cfg.color}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-foreground">{a.name}</span>
                  <span className="text-[9px] text-muted-foreground">{a.role}</span>
                </div>
              </div>
              <span className={`text-[8px] font-bold tracking-wider ${cfg.textColor}`}>
                {cfg.label}
              </span>
              <span className="text-[9px] text-muted-foreground font-mono">
                {Math.round(a.confidence * 100)}%
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Final verdict */}
      {showVerdict && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-center"
        >
          <p className="text-[10px] text-muted-foreground mb-1">Board Recommendation</p>
          <p className="text-sm font-bold text-emerald-400">PROCEED WITH CAUTION</p>
          <p className="text-[10px] text-muted-foreground mt-1">
            {tally.approve} approve · {tally.caution} caution · {tally.reject} reject
          </p>
        </motion.div>
      )}
    </div>
  );
}
