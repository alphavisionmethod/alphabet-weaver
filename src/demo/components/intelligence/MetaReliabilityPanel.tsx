import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDemo } from '../../store';
import { generateReliabilityState } from '../../systemIntelligence';
import { Brain, AlertTriangle, Shield, Zap } from 'lucide-react';

const AUTONOMY_LABELS = ['L0 · Suggest Only', 'L1 · Execute Low-Impact', 'L2 · Execute + Experiment'];
const AUTONOMY_COLORS = ['text-red-400', 'text-amber-400', 'text-emerald-400'];
const AUTONOMY_BG = ['bg-red-500/10', 'bg-amber-500/10', 'bg-emerald-500/10'];

export function MetaReliabilityPanel() {
  const { activeWorkflow, workflows, settings } = useDemo();

  const state = useMemo(
    () => generateReliabilityState(activeWorkflow, workflows, settings.seed),
    [activeWorkflow, workflows, settings.seed]
  );

  const reliabilityPct = Math.round(state.p_reliable * 100);
  const ringDash = 2 * Math.PI * 38;
  const ringOffset = ringDash * (1 - state.p_reliable);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <Brain className="h-3.5 w-3.5 text-primary" />
        <span className="text-[11px] font-semibold text-foreground">Meta-Reliability Model</span>
      </div>

      {/* Reliability ring */}
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 flex-shrink-0">
          <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
            <circle cx="40" cy="40" r="38" fill="none" strokeWidth="4" className="stroke-muted/20" />
            <motion.circle
              cx="40" cy="40" r="38" fill="none" strokeWidth="4"
              strokeLinecap="round"
              className={state.p_reliable > 0.85 ? 'stroke-emerald-400' : state.p_reliable > 0.7 ? 'stroke-amber-400' : 'stroke-red-400'}
              strokeDasharray={ringDash}
              initial={{ strokeDashoffset: ringDash }}
              animate={{ strokeDashoffset: ringOffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-foreground">{reliabilityPct}%</span>
            <span className="text-[7px] text-muted-foreground">reliable</span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {/* Autonomy level */}
          <div className={`rounded-lg px-2 py-1.5 ${AUTONOMY_BG[state.autonomy_level]}`}>
            <div className="flex items-center gap-1.5">
              {state.autonomy_level === 0 ? <AlertTriangle className="h-3 w-3 text-red-400" /> :
               state.autonomy_level === 1 ? <Shield className="h-3 w-3 text-amber-400" /> :
               <Zap className="h-3 w-3 text-emerald-400" />}
              <span className={`text-[9px] font-bold tracking-wider ${AUTONOMY_COLORS[state.autonomy_level]}`}>
                {AUTONOMY_LABELS[state.autonomy_level]}
              </span>
            </div>
          </div>

          {/* Failure mode */}
          {state.failure_mode !== 'none' && (
            <div className="rounded-lg bg-red-500/5 border border-red-500/15 px-2 py-1">
              <span className="text-[8px] text-red-400 font-semibold">
                ⚠ Predicted failure: {state.failure_mode.replace('_', ' ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Factor breakdown */}
      <div className="space-y-1.5">
        <span className="text-[8px] text-muted-foreground uppercase tracking-wider">Reliability Factors</span>
        {state.factors.map(f => (
          <div key={f.name} className="flex items-center gap-2">
            <span className="text-[9px] text-muted-foreground w-24 truncate">{f.name}</span>
            <div className="flex-1 h-1.5 rounded-full bg-muted/20 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${f.impact === 'positive' ? 'bg-emerald-400/60' : f.impact === 'negative' ? 'bg-red-400/60' : 'bg-muted-foreground/30'}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, f.value * 100)}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[8px] font-mono text-foreground w-8 text-right">{f.value.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
