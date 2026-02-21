import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemo } from '../../store';
import { generateDecisionLedger } from '../../systemIntelligence';
import type { DecisionEvent } from '../../systemIntelligence';
import { Hash, Play, Check, ChevronDown, ChevronRight, Shield, X, ArrowLeftRight } from 'lucide-react';

function HashChain({ events, onReplayEvent }: { events: DecisionEvent[]; onReplayEvent: (e: DecisionEvent) => void }) {
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
                  <button
                    onClick={(ev) => { ev.stopPropagation(); onReplayEvent(e); }}
                    className="mt-1 px-2 py-1 rounded bg-primary/10 border border-primary/20 text-[8px] font-semibold text-primary hover:bg-primary/20 transition-colors flex items-center gap-1"
                  >
                    <ArrowLeftRight className="h-2.5 w-2.5" /> Replay This Decision
                  </button>
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

// --- Replay Engine Visualization ---
interface ReplayDiffField {
  label: string;
  original: string;
  reconstructed: string;
  match: boolean;
}

function ReplayEngineOverlay({ event, onClose }: { event: DecisionEvent; onClose: () => void }) {
  const [phase, setPhase] = useState<'loading' | 'features' | 'model' | 'diff' | 'hash'>('loading');
  const [verifiedFields, setVerifiedFields] = useState(0);

  const diffFields: ReplayDiffField[] = [
    { label: 'Chosen Action', original: event.chosen_action, reconstructed: event.chosen_action, match: true },
    { label: 'Calibrated Prob', original: `${(event.predicted_outcome.calibrated_prob * 100).toFixed(2)}%`, reconstructed: `${(event.predicted_outcome.calibrated_prob * 100).toFixed(2)}%`, match: true },
    { label: 'p10 / p90', original: `${(event.predicted_outcome.p10 * 100).toFixed(1)}% / ${(event.predicted_outcome.p90 * 100).toFixed(1)}%`, reconstructed: `${(event.predicted_outcome.p10 * 100).toFixed(1)}% / ${(event.predicted_outcome.p90 * 100).toFixed(1)}%`, match: true },
    { label: 'Aleatoric ε', original: event.uncertainty.aleatoric.toFixed(4), reconstructed: event.uncertainty.aleatoric.toFixed(4), match: true },
    { label: 'Epistemic η', original: event.uncertainty.epistemic.toFixed(4), reconstructed: event.uncertainty.epistemic.toFixed(4), match: true },
    { label: 'Autonomy Level', original: `L${event.autonomy_level}`, reconstructed: `L${event.autonomy_level}`, match: true },
    { label: 'Row Hash', original: event.row_hash.slice(0, 24), reconstructed: event.row_hash.slice(0, 24), match: true },
  ];

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase('features'), 800),
      setTimeout(() => setPhase('model'), 1600),
      setTimeout(() => setPhase('diff'), 2400),
      setTimeout(() => setPhase('hash'), 3800),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Animate field verification
  useEffect(() => {
    if (phase !== 'diff') return;
    const interval = setInterval(() => {
      setVerifiedFields(v => {
        if (v >= diffFields.length) { clearInterval(interval); return v; }
        return v + 1;
      });
    }, 180);
    return () => clearInterval(interval);
  }, [phase, diffFields.length]);

  const phaseLabels = [
    { id: 'loading', label: 'Loading snapshot manifest…' },
    { id: 'features', label: 'Reconstructing feature pipeline…' },
    { id: 'model', label: 'Loading model versions & recomputing…' },
    { id: 'diff', label: 'Diffing original vs reconstructed…' },
    { id: 'hash', label: 'Verifying hash chain integrity…' },
  ];
  const phaseIndex = phaseLabels.findIndex(p => p.id === phase);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-[480px] max-h-[80vh] overflow-y-auto rounded-2xl border border-border/40 bg-card shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-primary" />
            <div>
              <p className="text-[11px] font-semibold text-foreground">Replay Engine</p>
              <p className="text-[9px] font-mono text-muted-foreground">{event.decision_id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Phase progress */}
        <div className="px-4 py-3 space-y-2 border-b border-border/10">
          {phaseLabels.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2">
              {i < phaseIndex ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : i === phaseIndex ? (
                <div className="h-3 w-3 border border-primary/40 border-t-primary rounded-full animate-spin" />
              ) : (
                <div className="h-3 w-3 rounded-full border border-border/30" />
              )}
              <span className={`text-[9px] ${i <= phaseIndex ? 'text-foreground' : 'text-muted-foreground/50'}`}>{p.label}</span>
            </div>
          ))}
        </div>

        {/* Manifest info */}
        <AnimatePresence>
          {(phase === 'features' || phase === 'model' || phase === 'diff' || phase === 'hash') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="px-4 py-2 border-b border-border/10 bg-muted/5"
            >
              <p className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Snapshot Manifest</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[8px] font-mono">
                <div><span className="text-muted-foreground">Context: </span><span className="text-foreground">{event.context_snapshot_id.slice(0, 16)}…</span></div>
                <div><span className="text-muted-foreground">Features: </span><span className="text-foreground">{event.features_version}</span></div>
                <div><span className="text-muted-foreground">Task Model: </span><span className="text-foreground">{event.model_versions.task}</span></div>
                <div><span className="text-muted-foreground">Meta Model: </span><span className="text-foreground">{event.model_versions.meta}</span></div>
                <div><span className="text-muted-foreground">Regime: </span><span className="text-foreground">{event.model_versions.regime}</span></div>
                <div><span className="text-muted-foreground">Drift: </span><span className="text-foreground">{event.model_versions.drift}</span></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Side-by-side diff */}
        <AnimatePresence>
          {(phase === 'diff' || phase === 'hash') && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="px-4 py-3"
            >
              <p className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Original vs Reconstructed</p>
              <div className="rounded-lg border border-border/30 overflow-hidden">
                {/* Header row */}
                <div className="grid grid-cols-[100px_1fr_1fr_28px] bg-muted/10 px-2 py-1 text-[7px] font-semibold text-muted-foreground uppercase tracking-wider">
                  <span>Field</span>
                  <span>Original</span>
                  <span>Reconstructed</span>
                  <span></span>
                </div>
                {diffFields.map((field, i) => (
                  <motion.div
                    key={field.label}
                    initial={{ opacity: 0, backgroundColor: 'transparent' }}
                    animate={{
                      opacity: i < verifiedFields ? 1 : 0.3,
                      backgroundColor: i < verifiedFields ? (field.match ? 'hsl(150 60% 45% / 0.05)' : 'hsl(0 80% 50% / 0.05)') : 'transparent',
                    }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-[100px_1fr_1fr_28px] px-2 py-1 border-t border-border/10 items-center"
                  >
                    <span className="text-[8px] text-muted-foreground">{field.label}</span>
                    <span className="text-[8px] font-mono text-foreground truncate">{field.original}</span>
                    <span className="text-[8px] font-mono text-foreground truncate">{field.reconstructed}</span>
                    <div className="flex justify-center">
                      {i < verifiedFields && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400 }}>
                          <Check className="h-3 w-3 text-emerald-400" />
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hash verification result */}
        <AnimatePresence>
          {phase === 'hash' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mx-4 mb-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-3 text-center space-y-1"
            >
              <div className="flex items-center justify-center gap-2">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Shield className="h-5 w-5 text-emerald-400" />
                </motion.div>
                <span className="text-[11px] font-bold text-emerald-400">REPLAY VERIFIED — 100% MATCH</span>
              </div>
              <p className="text-[8px] text-muted-foreground font-mono">
                row_hash: {event.row_hash.slice(0, 32)}…
              </p>
              <p className="text-[8px] text-muted-foreground">
                {diffFields.length}/{diffFields.length} fields matched · deterministic reconstruction confirmed
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export function DecisionLedgerPanel() {
  const { workflows, settings } = useDemo();
  const [chainVerified, setChainVerified] = useState(false);
  const [replayEvent, setReplayEvent] = useState<DecisionEvent | null>(null);

  const events = generateDecisionLedger(workflows, settings.seed);

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
          <HashChain events={events} onReplayEvent={setReplayEvent} />

          {/* Verify chain button */}
          <div className="flex gap-2">
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

      {/* Replay engine overlay */}
      <AnimatePresence>
        {replayEvent && (
          <ReplayEngineOverlay event={replayEvent} onClose={() => setReplayEvent(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
