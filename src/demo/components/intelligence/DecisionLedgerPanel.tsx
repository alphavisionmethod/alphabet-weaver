import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemo } from '../../store';
import { generateDecisionLedger } from '../../systemIntelligence';
import type { DecisionEvent } from '../../systemIntelligence';
import { Hash, Play, Check, ChevronDown, ChevronRight, Shield } from 'lucide-react';

function HashChain({ events }: { events: DecisionEvent[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      {events.map((e, i) => (
        <motion.div
          key={e.decision_id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.15 }}
        >
          <button
            onClick={() => setExpanded(expanded === e.decision_id ? null : e.decision_id)}
            className="w-full text-left rounded-lg border border-border/30 bg-card/40 p-2 hover:bg-card/60 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Hash className="h-3 w-3 text-primary/60 flex-shrink-0" />
              <span className="text-[10px] font-mono text-foreground truncate">{e.decision_id}</span>
              {expanded === e.decision_id ? <ChevronDown className="h-3 w-3 text-muted-foreground ml-auto" /> : <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[8px] text-muted-foreground font-mono truncate">{e.row_hash.slice(0, 24)}…</span>
              <span className={`text-[8px] px-1 rounded ${e.autonomy_level === 0 ? 'bg-red-500/10 text-red-400' : e.autonomy_level === 1 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                L{e.autonomy_level}
              </span>
            </div>
          </button>

          <AnimatePresence>
            {expanded === e.decision_id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-2 ml-5 border-l border-border/20 space-y-1.5 text-[9px]">
                  <div><span className="text-muted-foreground">Action:</span> <span className="text-foreground font-mono">{e.chosen_action}</span></div>
                  <div><span className="text-muted-foreground">Predicted:</span> <span className="text-foreground">{(e.predicted_outcome.calibrated_prob * 100).toFixed(1)}% (p10: {(e.predicted_outcome.p10 * 100).toFixed(0)}%, p90: {(e.predicted_outcome.p90 * 100).toFixed(0)}%)</span></div>
                  <div><span className="text-muted-foreground">Uncertainty:</span> <span className="text-foreground">ε={e.uncertainty.aleatoric.toFixed(3)} / η={e.uncertainty.epistemic.toFixed(3)}</span></div>
                  <div><span className="text-muted-foreground">Models:</span> <span className="text-foreground font-mono text-[8px]">task:{e.model_versions.task} meta:{e.model_versions.meta}</span></div>
                  <div><span className="text-muted-foreground">Context:</span> <span className="text-foreground font-mono text-[8px]">{e.context_snapshot_id.slice(0, 20)}…</span></div>
                  <div><span className="text-muted-foreground">Prev Hash:</span> <span className="text-foreground font-mono text-[8px]">{e.prev_hash.slice(0, 20)}…</span></div>
                  {e.risk_checks.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {e.risk_checks.map((rc, j) => (
                        <span key={j} className={`px-1 py-0.5 rounded text-[7px] font-bold ${rc.result === 'pass' ? 'bg-emerald-500/10 text-emerald-400' : rc.result === 'warn' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'}`}>
                          {rc.rule.split('.').pop()} {rc.result.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-[8px] text-muted-foreground/50">
                    Candidates: {e.candidate_actions.join(', ')}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hash chain link */}
          {i < events.length - 1 && (
            <div className="flex items-center ml-3 my-0.5">
              <div className="w-px h-3 bg-primary/20" />
              <div className="ml-1 text-[7px] text-primary/30 font-mono">→</div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export function DecisionLedgerPanel() {
  const { workflows, settings } = useDemo();
  const [replayResult, setReplayResult] = useState<'idle' | 'running' | 'success'>('idle');
  const [chainVerified, setChainVerified] = useState(false);

  const events = generateDecisionLedger(workflows, settings.seed);

  const handleReplay = useCallback(() => {
    setReplayResult('running');
    setTimeout(() => setReplayResult('success'), 1800);
  }, []);

  const handleVerifyChain = useCallback(() => {
    setChainVerified(true);
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Hash className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-semibold text-foreground">Decision Ledger</span>
        </div>
        <span className="text-[8px] text-muted-foreground font-mono">{events.length} entries</span>
      </div>

      {events.length === 0 ? (
        <p className="text-[10px] text-muted-foreground">Run a workflow to populate the ledger.</p>
      ) : (
        <>
          <HashChain events={events} />

          {/* Controls */}
          <div className="flex gap-2">
            <button
              onClick={handleReplay}
              disabled={replayResult === 'running'}
              className="flex-1 py-1.5 rounded-lg bg-primary/5 border border-primary/15 text-[9px] font-semibold text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-1"
            >
              {replayResult === 'running' ? (
                <><div className="h-2.5 w-2.5 border border-primary/40 border-t-primary rounded-full animate-spin" /> Replaying…</>
              ) : replayResult === 'success' ? (
                <><Check className="h-3 w-3 text-emerald-400" /> 100% Match</>
              ) : (
                <><Play className="h-3 w-3" /> Replay</>
              )}
            </button>
            <button
              onClick={handleVerifyChain}
              disabled={chainVerified}
              className="flex-1 py-1.5 rounded-lg bg-primary/5 border border-primary/15 text-[9px] font-semibold text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-1"
            >
              {chainVerified ? (
                <><Shield className="h-3 w-3 text-emerald-400" /> Chain Valid</>
              ) : (
                <><Shield className="h-3 w-3" /> Verify Chain</>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
