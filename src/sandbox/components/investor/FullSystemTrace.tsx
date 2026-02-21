import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Pause, CheckCircle, XCircle, Loader2, Zap, Link as LinkIcon,
  Cpu, Shield, Clock, ChevronDown, ChevronRight, SkipForward, SkipBack,
  RotateCcw, Film,
} from 'lucide-react';
import { runPipeline, runAdvisorConsensus, getLLMCalls, getLLMTotals, verifyLedger, getLedgerBlocks } from '../../lib/investorSimEngine';
import type { PipelineRun, PipelineStageResult, ConsensusReport, LLMCallReport, InvestorLedgerBlock } from '../../contracts/investor';
import { Progress } from '@/components/ui/progress';

const CATEGORIES = ['leads', 'insurance', 'travel', 'gifts', 'investing'] as const;

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  leads: { label: 'Lead Recovery', color: 'hsl(200 80% 60%)' },
  insurance: { label: 'Insurance Quotes', color: 'hsl(160 70% 50%)' },
  travel: { label: 'Travel Booking', color: 'hsl(38 95% 54%)' },
  gifts: { label: 'Gift Selection', color: 'hsl(280 70% 65%)' },
  investing: { label: 'Investment Analysis', color: 'hsl(0 70% 60%)' },
};

// ── Timeline event model ──

type TimelineEventType = 'pipeline_start' | 'stage' | 'pipeline_done' | 'consensus' | 'llm_routing' | 'verification';

interface TimelineEvent {
  type: TimelineEventType;
  label: string;
  sublabel: string;
  color: string;
  data: Record<string, unknown>;
}

interface TraceStep {
  category: string;
  pipeline: PipelineRun | null;
  status: 'pending' | 'running' | 'done';
}

interface TraceResult {
  steps: TraceStep[];
  consensus: ConsensusReport | null;
  llmCalls: LLMCallReport[];
  llmTotals: ReturnType<typeof getLLMTotals> | null;
  ledgerBlocks: InvestorLedgerBlock[];
  integrityValid: boolean | null;
  totalLatency: number;
  timeline: TimelineEvent[];
}

function buildTimeline(result: TraceResult): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  for (const step of result.steps) {
    if (!step.pipeline) continue;
    const meta = CATEGORY_META[step.category];

    events.push({
      type: 'pipeline_start',
      label: meta.label,
      sublabel: 'Pipeline initiated',
      color: meta.color,
      data: { category: step.category },
    });

    for (const stage of step.pipeline.stages) {
      events.push({
        type: 'stage',
        label: `${meta.label} → ${stage.stage.replace('_', ' ')}`,
        sublabel: `${stage.verdict} · ${stage.latencyMs}ms · Risk: ${stage.riskTier}`,
        color: meta.color,
        data: { ...stage, category: step.category },
      });
    }

    events.push({
      type: 'pipeline_done',
      label: meta.label,
      sublabel: `${step.pipeline.finalStatus} · ${step.pipeline.totalLatencyMs}ms total`,
      color: meta.color,
      data: { receiptHash: step.pipeline.receiptHash, status: step.pipeline.finalStatus },
    });
  }

  if (result.consensus) {
    events.push({
      type: 'consensus',
      label: 'Advisor Consensus',
      sublabel: `Winner: ${result.consensus.winnerAdvisorId.toUpperCase()} · Disagreement: ${(result.consensus.disagreementScore * 100).toFixed(0)}%`,
      color: 'hsl(38 95% 54%)',
      data: { ...result.consensus },
    });
  }

  if (result.llmCalls.length > 0) {
    for (const call of result.llmCalls) {
      events.push({
        type: 'llm_routing',
        label: `LLM: ${call.purpose}`,
        sublabel: `${call.model} · ${call.latencyMs}ms · $${call.costUsd.toFixed(4)}${call.cached ? ' · CACHED' : ''}${call.fallbackUsed ? ' · FALLBACK' : ''}`,
        color: 'hsl(200 80% 60%)',
        data: { ...call },
      });
    }
  }

  if (result.integrityValid !== null) {
    events.push({
      type: 'verification',
      label: 'Ledger Verification',
      sublabel: result.integrityValid
        ? `${result.ledgerBlocks.length} blocks · Chain VALID`
        : `Chain BROKEN`,
      color: result.integrityValid ? 'hsl(145 60% 50%)' : 'hsl(0 70% 60%)',
      data: { valid: result.integrityValid, blockCount: result.ledgerBlocks.length },
    });
  }

  return events;
}

// ── Replay Controls ──

function ReplayControls({
  cursor, total, playing, onPlay, onPause, onStepBack, onStepForward, onSeek, onReset,
}: {
  cursor: number; total: number; playing: boolean;
  onPlay: () => void; onPause: () => void;
  onStepBack: () => void; onStepForward: () => void;
  onSeek: (pos: number) => void; onReset: () => void;
}) {
  const pct = total > 0 ? ((cursor + 1) / total) * 100 : 0;

  return (
    <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button onClick={onStepBack} disabled={cursor <= 0} className="p-1.5 rounded-lg transition-colors hover:bg-white/5 disabled:opacity-20" title="Step back">
            <SkipBack className="w-4 h-4 text-white/60" />
          </button>
          {playing ? (
            <button onClick={onPause} className="p-2 rounded-xl transition-colors" style={{ background: 'hsl(38 95% 54% / 0.15)' }} title="Pause">
              <Pause className="w-4 h-4" style={{ color: 'hsl(38 95% 54%)' }} />
            </button>
          ) : (
            <button onClick={onPlay} disabled={cursor >= total - 1} className="p-2 rounded-xl transition-colors hover:bg-white/5 disabled:opacity-20" title="Play">
              <Play className="w-4 h-4 text-white/60" />
            </button>
          )}
          <button onClick={onStepForward} disabled={cursor >= total - 1} className="p-1.5 rounded-lg transition-colors hover:bg-white/5 disabled:opacity-20" title="Step forward">
            <SkipForward className="w-4 h-4 text-white/60" />
          </button>
          <button onClick={onReset} className="p-1.5 rounded-lg transition-colors hover:bg-white/5 ml-1" title="Reset to start">
            <RotateCcw className="w-3.5 h-3.5 text-white/40" />
          </button>
        </div>
        <span className="text-xs text-white/40 font-mono">{cursor + 1} / {total}</span>
      </div>

      {/* Scrubber bar */}
      <div className="relative">
        <Progress value={pct} className="h-1.5 bg-white/5 cursor-pointer [&>div]:bg-[hsl(38_95%_54%)] [&>div]:transition-all" />
        <input
          type="range"
          min={0}
          max={total - 1}
          value={cursor}
          onChange={e => onSeek(Number(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
          style={{ height: '100%' }}
        />
      </div>

      {/* Tick marks */}
      <div className="flex gap-px">
        {Array.from({ length: total }).map((_, i) => {
          const ev = (total > 0) ? i : 0;
          return (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-colors cursor-pointer"
              style={{
                background: i <= cursor ? 'hsl(38 95% 54% / 0.5)' : 'rgba(255,255,255,0.06)',
              }}
              onClick={() => onSeek(i)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Timeline Event Card ──

function TimelineEventCard({ event, index, isActive }: { event: TimelineEvent; index: number; isActive: boolean }) {
  const iconMap: Record<TimelineEventType, React.ReactNode> = {
    pipeline_start: <Zap className="w-3.5 h-3.5" />,
    stage: <Shield className="w-3.5 h-3.5" />,
    pipeline_done: <CheckCircle className="w-3.5 h-3.5" />,
    consensus: <Cpu className="w-3.5 h-3.5" />,
    llm_routing: <Cpu className="w-3.5 h-3.5" />,
    verification: <LinkIcon className="w-3.5 h-3.5" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15 }}
      className="flex gap-3 items-start"
    >
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center shrink-0 pt-1">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
          style={{
            background: isActive ? event.color : 'rgba(255,255,255,0.06)',
            color: isActive ? '#000' : 'rgba(255,255,255,0.3)',
            boxShadow: isActive ? `0 0 12px ${event.color}40` : 'none',
          }}
        >
          {iconMap[event.type]}
        </div>
        <div className="w-px flex-1 min-h-[16px]" style={{ background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* Content */}
      <div
        className="flex-1 rounded-lg px-3 py-2 mb-1 transition-all"
        style={{
          background: isActive ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
          border: isActive ? `1px solid ${event.color}30` : '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-white/25">#{index + 1}</span>
          <span className="text-xs font-medium" style={{ color: isActive ? event.color : 'rgba(255,255,255,0.6)' }}>
            {event.label}
          </span>
        </div>
        <div className="text-[11px] text-white/40 mt-0.5">{event.sublabel}</div>

        {/* Stage-specific details */}
        {isActive && event.type === 'stage' && (
          <div className="mt-2 grid grid-cols-4 gap-2 text-[10px]">
            <div><span className="text-white/30">Schema:</span> <span className="text-white/60">{(event.data as PipelineStageResult).schemaValid ? '✓' : '✗'}</span></div>
            <div><span className="text-white/30">Idempotency:</span> <span className="text-white/60">{(event.data as PipelineStageResult).idempotencyHit ? 'HIT' : 'MISS'}</span></div>
            <div><span className="text-white/30">Compliance:</span> <span className="text-white/60">{(event.data as PipelineStageResult).compliancePass ? '✓' : '✗'}</span></div>
            <div><span className="text-white/30">Signature:</span> <span className="text-white/60">{(event.data as PipelineStageResult).signatureValid ? '✓' : '✗'}</span></div>
          </div>
        )}

        {isActive && event.type === 'pipeline_done' && (
          <div className="mt-1.5 text-[10px] text-white/30 font-mono truncate">
            Receipt: {String(event.data.receiptHash).slice(0, 32)}…
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Component ──

export function FullSystemTrace() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<TraceResult | null>(null);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const abortRef = useRef(false);

  // Replay state
  const [replayMode, setReplayMode] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const playIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const timeline = result?.timeline ?? [];

  // Auto-advance when playing
  useEffect(() => {
    if (playing && timeline.length > 0) {
      playIntervalRef.current = setInterval(() => {
        setCursor(prev => {
          if (prev >= timeline.length - 1) {
            setPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 600);
    }
    return () => { if (playIntervalRef.current) clearInterval(playIntervalRef.current); };
  }, [playing, timeline.length]);

  const runTrace = useCallback(async () => {
    abortRef.current = false;
    setRunning(true);
    setExpandedStep(null);
    setReplayMode(false);
    setPlaying(false);
    setCursor(0);

    const steps: TraceStep[] = CATEGORIES.map(c => ({ category: c, pipeline: null, status: 'pending' as const }));
    setResult({ steps: [...steps], consensus: null, llmCalls: [], llmTotals: null, ledgerBlocks: [], integrityValid: null, totalLatency: 0, timeline: [] });

    let totalLatency = 0;

    for (let i = 0; i < CATEGORIES.length; i++) {
      if (abortRef.current) break;

      steps[i] = { ...steps[i], status: 'running' };
      setResult(prev => prev ? { ...prev, steps: [...steps] } : prev);

      await new Promise(r => setTimeout(r, 400));

      const pipeline = await runPipeline(CATEGORIES[i]);
      totalLatency += pipeline.totalLatencyMs;

      steps[i] = { ...steps[i], pipeline, status: 'done' };
      setResult(prev => prev ? { ...prev, steps: [...steps], totalLatency } : prev);

      await new Promise(r => setTimeout(r, 200));
    }

    if (abortRef.current) { setRunning(false); return; }

    await new Promise(r => setTimeout(r, 300));
    const consensus = await runAdvisorConsensus();
    const llmCalls = getLLMCalls();
    const llmTotals = getLLMTotals();
    const ledgerBlocks = getLedgerBlocks();
    const verification = await verifyLedger();

    const finalResult: TraceResult = {
      steps: [...steps],
      consensus,
      llmCalls,
      llmTotals,
      ledgerBlocks,
      integrityValid: verification.valid,
      totalLatency,
      timeline: [],
    };
    finalResult.timeline = buildTimeline(finalResult);

    setResult(finalResult);
    setRunning(false);
  }, []);

  const enterReplay = useCallback(() => {
    setReplayMode(true);
    setCursor(0);
    setPlaying(false);
  }, []);

  const exitReplay = useCallback(() => {
    setReplayMode(false);
    setPlaying(false);
    if (playIntervalRef.current) clearInterval(playIntervalRef.current);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Full System Trace</h2>
          <p className="text-sm text-white/50 mt-1">
            Runs 5 categories through Iron Dome, then advisor consensus, LLM routing, and ledger verification.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {result && !running && timeline.length > 0 && (
            <button
              onClick={replayMode ? exitReplay : enterReplay}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: replayMode ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
                color: replayMode ? 'hsl(38 95% 54%)' : 'rgba(255,255,255,0.5)',
                border: replayMode ? '1px solid hsl(38 95% 54% / 0.3)' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Film className="w-4 h-4" />
              {replayMode ? 'Exit Replay' : 'Replay'}
            </button>
          )}
          <button
            onClick={runTrace}
            disabled={running}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: running ? 'rgba(255,255,255,0.05)' : 'hsl(38 95% 54%)',
              color: running ? 'rgba(255,255,255,0.3)' : '#000',
            }}
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {running ? 'Running…' : 'Run Full Trace'}
          </button>
        </div>
      </div>

      {/* Empty state */}
      {!result && !running && (
        <div className="rounded-2xl p-12 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Zap className="w-10 h-10 mx-auto mb-4 text-white/20" />
          <p className="text-sm text-white/40">Click "Run Full Trace" to execute all 5 action categories in sequence.</p>
          <p className="text-xs text-white/25 mt-2">Each category traverses the full Iron Dome pipeline. Results chain into a verifiable ledger.</p>
        </div>
      )}

      {/* ═══ REPLAY MODE ═══ */}
      {replayMode && timeline.length > 0 && (
        <div className="space-y-4">
          <ReplayControls
            cursor={cursor}
            total={timeline.length}
            playing={playing}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onStepBack={() => { setPlaying(false); setCursor(c => Math.max(0, c - 1)); }}
            onStepForward={() => { setPlaying(false); setCursor(c => Math.min(timeline.length - 1, c + 1)); }}
            onSeek={setCursor}
            onReset={() => { setPlaying(false); setCursor(0); }}
          />

          {/* Current event spotlight */}
          <AnimatePresence mode="wait">
            <motion.div
              key={cursor}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="rounded-xl p-5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${timeline[cursor].color}25`,
                boxShadow: `0 0 40px ${timeline[cursor].color}08`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full" style={{ background: timeline[cursor].color }} />
                <span className="text-xs uppercase tracking-wider text-white/30">{timeline[cursor].type.replace('_', ' ')}</span>
                <span className="text-[10px] font-mono text-white/20 ml-auto">Event #{cursor + 1}</span>
              </div>
              <h3 className="text-base font-medium" style={{ color: timeline[cursor].color }}>{timeline[cursor].label}</h3>
              <p className="text-sm text-white/50 mt-1">{timeline[cursor].sublabel}</p>

              {/* Detail grid for stages */}
              {timeline[cursor].type === 'stage' && (
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    ['Schema', (timeline[cursor].data as PipelineStageResult).schemaValid ? '✓ Valid' : '✗ Invalid'],
                    ['Risk', String((timeline[cursor].data as PipelineStageResult).riskTier)],
                    ['Compliance', (timeline[cursor].data as PipelineStageResult).compliancePass ? '✓ Pass' : '✗ Fail'],
                    ['Signature', (timeline[cursor].data as PipelineStageResult).signatureValid ? '✓ Valid' : '✗ Invalid'],
                    ['Idempotency', (timeline[cursor].data as PipelineStageResult).idempotencyHit ? 'HIT' : 'MISS'],
                    ['Latency', `${(timeline[cursor].data as PipelineStageResult).latencyMs}ms`],
                    ['Status', String((timeline[cursor].data as PipelineStageResult).status)],
                    ['Verdict', String((timeline[cursor].data as PipelineStageResult).verdict)],
                  ].map(([k, v]) => (
                    <div key={k} className="rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div className="text-[10px] text-white/30">{k}</div>
                      <div className="text-xs text-white/70 font-medium mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>
              )}

              {timeline[cursor].type === 'pipeline_done' && (
                <div className="mt-2 text-[10px] font-mono text-white/25 truncate">
                  Receipt: {String(timeline[cursor].data.receiptHash).slice(0, 40)}…
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Scrollable timeline feed */}
          <div className="rounded-xl p-4 max-h-[400px] overflow-y-auto" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="space-y-0">
              {timeline.slice(0, cursor + 1).map((ev, i) => (
                <TimelineEventCard key={i} event={ev} index={i} isActive={i === cursor} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ STANDARD VIEW (non-replay) ═══ */}
      {result && !replayMode && (
        <div className="space-y-6">
          {/* Pipeline Steps */}
          <div className="space-y-2">
            <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider">Pipeline Execution</h3>
            {result.steps.map((step, i) => {
              const meta = CATEGORY_META[step.category];
              const isExpanded = expandedStep === i;

              return (
                <motion.div
                  key={step.category}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-xl overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <button
                    onClick={() => step.status === 'done' && setExpandedStep(isExpanded ? null : i)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{
                      background: step.status === 'done' ? 'hsl(145 60% 40% / 0.15)' : step.status === 'running' ? 'hsl(38 95% 54% / 0.15)' : 'rgba(255,255,255,0.04)',
                    }}>
                      {step.status === 'done' && <CheckCircle className="w-4 h-4" style={{ color: 'hsl(145 60% 50%)' }} />}
                      {step.status === 'running' && <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'hsl(38 95% 54%)' }} />}
                      {step.status === 'pending' && <Clock className="w-4 h-4 text-white/20" />}
                    </div>

                    <span className="text-sm font-medium" style={{ color: meta.color }}>{meta.label}</span>

                    {step.pipeline && (
                      <span className="ml-auto flex items-center gap-3 text-xs text-white/40">
                        <span>{step.pipeline.stages.length} stages</span>
                        <span>{step.pipeline.totalLatencyMs}ms</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium" style={{
                          background: 'hsl(145 60% 40% / 0.15)', color: 'hsl(145 60% 50%)',
                        }}>
                          {step.pipeline.finalStatus}
                        </span>
                        {step.status === 'done' && (isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)}
                      </span>
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && step.pipeline && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 grid grid-cols-7 gap-1.5">
                          {step.pipeline.stages.map((stage, si) => (
                            <div key={si} className="rounded-lg p-2 text-center" style={{
                              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                            }}>
                              <div className="text-[10px] text-white/50 mb-1">{stage.stage.replace('_', ' ')}</div>
                              <div className="text-[10px] font-medium" style={{ color: 'hsl(145 60% 50%)' }}>{stage.status}</div>
                              <div className="text-[9px] text-white/30 mt-0.5">{stage.latencyMs}ms</div>
                            </div>
                          ))}
                        </div>
                        <div className="px-4 pb-3">
                          <div className="text-[10px] text-white/30 font-mono truncate">
                            Receipt: {step.pipeline.receiptHash.slice(0, 32)}…
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Summary Row */}
          {!running && result.consensus && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-4 gap-3">
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-xs text-white/40 mb-1">Total Latency</div>
                <div className="text-xl font-semibold text-white">{result.totalLatency}<span className="text-xs text-white/40 ml-1">ms</span></div>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-xs text-white/40 mb-1 flex items-center gap-1"><Cpu className="w-3 h-3" /> LLM Cost</div>
                <div className="text-xl font-semibold text-white">${result.llmTotals?.totalCost.toFixed(4)}</div>
                <div className="text-[10px] text-white/30 mt-1">{result.llmTotals?.cacheHits} cache hits · {result.llmTotals?.fallbacks} fallbacks</div>
              </div>
              <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="text-xs text-white/40 mb-1 flex items-center gap-1"><LinkIcon className="w-3 h-3" /> Ledger Blocks</div>
                <div className="text-xl font-semibold text-white">{result.ledgerBlocks.length}</div>
                <div className="text-[10px] text-white/30 mt-1">Hash-chained · Merkle verified</div>
              </div>
              <div className="rounded-xl p-4" style={{
                background: result.integrityValid ? 'hsl(145 60% 40% / 0.06)' : 'hsl(0 70% 50% / 0.06)',
                border: `1px solid ${result.integrityValid ? 'hsl(145 60% 40% / 0.15)' : 'hsl(0 70% 50% / 0.15)'}`,
              }}>
                <div className="text-xs text-white/40 mb-1 flex items-center gap-1"><Shield className="w-3 h-3" /> Integrity</div>
                <div className="flex items-center gap-2">
                  {result.integrityValid
                    ? <><CheckCircle className="w-5 h-5" style={{ color: 'hsl(145 60% 50%)' }} /><span className="text-lg font-semibold" style={{ color: 'hsl(145 60% 50%)' }}>VALID</span></>
                    : <><XCircle className="w-5 h-5" style={{ color: 'hsl(0 70% 60%)' }} /><span className="text-lg font-semibold" style={{ color: 'hsl(0 70% 60%)' }}>BROKEN</span></>
                  }
                </div>
              </div>
            </motion.div>
          )}

          {/* Advisor Consensus */}
          {!running && result.consensus && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">Advisor Consensus</h3>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="text-sm text-white">
                  Winner: <span className="font-medium" style={{ color: 'hsl(38 95% 54%)' }}>{result.consensus.winnerAdvisorId.toUpperCase()}</span>
                </div>
                <div className="text-sm text-white/50">
                  Disagreement: <span className="font-medium text-white">{(result.consensus.disagreementScore * 100).toFixed(0)}%</span>
                </div>
                <div className="px-2.5 py-1 rounded-full text-[11px] font-medium" style={{
                  background: result.consensus.requiredApproval === 'NONE' ? 'hsl(145 60% 40% / 0.15)' : 'hsl(38 95% 54% / 0.15)',
                  color: result.consensus.requiredApproval === 'NONE' ? 'hsl(145 60% 50%)' : 'hsl(38 95% 54%)',
                }}>
                  Approval: {result.consensus.requiredApproval}
                </div>
              </div>
              <div className="mt-3 flex gap-2 flex-wrap">
                {result.consensus.finalPlanSteps.map((step, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg text-[11px] text-white/50" style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                  }}>{i + 1}. {step}</span>
                ))}
              </div>
            </motion.div>
          )}

          {/* LLM Routing Table */}
          {!running && result.llmCalls.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider">LLM Routing Decisions</h3>
              </div>
              <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                {result.llmCalls.map((call, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-center gap-3 text-xs">
                    <span className="text-white/70 w-32 shrink-0">{call.purpose}</span>
                    <span className="font-mono text-white/40 w-28 shrink-0">{call.model}</span>
                    <span className="text-white/30 w-16 shrink-0">{call.tokensIn}→{call.tokensOut}</span>
                    <span className="text-white/30 w-14 shrink-0">{call.latencyMs}ms</span>
                    <span className="text-white/30 w-16 shrink-0">${call.costUsd.toFixed(4)}</span>
                    {call.cached && <span className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ background: 'hsl(200 80% 50% / 0.15)', color: 'hsl(200 80% 60%)' }}>CACHED</span>}
                    {call.fallbackUsed && <span className="px-1.5 py-0.5 rounded text-[9px] font-medium" style={{ background: 'hsl(38 95% 54% / 0.15)', color: 'hsl(38 95% 54%)' }}>FALLBACK</span>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
