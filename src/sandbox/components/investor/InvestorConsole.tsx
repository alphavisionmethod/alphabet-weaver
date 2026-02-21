import { useState, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Shield, Home, ChevronRight, ChevronDown, CheckCircle, XCircle,
  AlertTriangle, Users, Lock, ArrowLeft, ArrowRight,
  Repeat, Edit3, Ban, DollarSign, UserX, Eye,
  Cpu, TrendingUp, Clock, Zap, BarChart3,
  Activity, Brain, Undo2, Search, HeartPulse,
  FileText, MapPin, Phone, AlertOctagon, Volume2, VolumeX,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip as ReTooltip } from 'recharts';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import sitaLogo from '@/assets/sita-s-logo.jpeg';
import {
  runPipeline, simulateAttack, runAdvisorConsensus,
  verifyLedger, getLedgerBlocks, getLLMCalls, getLLMTotals,
  resetInvestorLedger,
} from '../../lib/investorSimEngine';
import type {
  AttackAttempt, AttackType, PipelineRun, ConsensusReport,
  InvestorLedgerBlock,
} from '../../contracts/investor';
import { playChime, playTick, playBlock, playSuccess, playActivation, playUndo, isSoundMuted, toggleSoundMute } from '../../lib/investorSounds';

// ── Phase definitions (7-minute narrative) ──
type Phase = 'outcome' | 'irondome' | 'attack' | 'advisors' | 'proof' | 'economics' | 'future';

const PHASES: Phase[] = ['outcome', 'irondome', 'attack', 'advisors', 'proof', 'economics', 'future'];

const PHASE_META: Record<Phase, { title: string; subtitle: string; minute: string; label: string }> = {
  outcome: { title: 'It handles things.', subtitle: "That's the visible layer. Now let me show you why this is defensible.", minute: '0–1', label: 'Outcome' },
  irondome: { title: 'Even if I try to break it, it refuses.', subtitle: 'Watch the pipeline light up.', minute: '1–2', label: 'Iron Dome' },
  attack: { title: 'The intelligence is impressive.\nThe refusal system is what matters.', subtitle: 'Every trick is caught, logged, and proven.', minute: '2–3', label: 'Attack' },
  advisors: { title: 'It doesn\'t think with one model.', subtitle: 'It routes decisions through institutional roles.', minute: '3–4', label: 'Advisors' },
  proof: { title: 'Every action leaves a fingerprint.', subtitle: 'If anything changes, it\'s detectable.', minute: '4–5', label: 'Proof' },
  economics: { title: 'As autonomy increases, cost per decision drops.', subtitle: 'Now margins are obvious.', minute: '5–6', label: 'Economics' },
  future: { title: '', subtitle: '', minute: '6–7', label: 'Future' },
};

// ── Animated counter hook ──
function useAnimatedCount(target: number, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const startTime = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return count;
}

// ── Reusable components ──

function GlassPanel({ children, className = '', glow }: { children: React.ReactNode; className?: string; glow?: string }) {
  return (
    <div
      className={`rounded-2xl border border-border/40 backdrop-blur-xl ${className}`}
      style={{ background: 'hsl(var(--card) / 0.6)', boxShadow: glow ? `0 0 60px ${glow}` : undefined }}
    >
      {children}
    </div>
  );
}

function TechDetail({ children, label = 'View Technical Detail' }: { children: React.ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors">
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        {label}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="mt-2 rounded-xl bg-muted/30 border border-border/30 p-3 text-[10px] font-mono text-muted-foreground/70">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PhaseTransition({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center mt-8">
      <button onClick={() => { playChime(); onClick(); }} className="btn-hero text-sm px-6 py-3">
        {label}
        <ChevronRight className="w-4 h-4 ml-2" />
      </button>
    </motion.div>
  );
}

// ═══════════════════════════════════════
// OS ACTIVATION SPLASH (Feature #2)
// ═══════════════════════════════════════

function ActivationSplash({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    resetInvestorLedger();
    playActivation();
    const t = setTimeout(onComplete, 2500);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2.5, times: [0, 0.3, 0.7, 1] }}
        >
          <img src={sitaLogo} alt="SITA" className="w-16 h-16 rounded-2xl mx-auto mb-6 opacity-60" />
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">SITA OS Active</h1>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-muted-foreground font-mono">Initializing systems…</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ═══════════════════════════════════════
// SYSTEM STATUS FOOTER (Feature #3)
// ═══════════════════════════════════════

function SystemStatusFooter({ blockCount }: { blockCount: number }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-border/20 backdrop-blur-xl bg-background/60">
      <div className="max-w-5xl mx-auto px-6 h-8 flex items-center justify-center gap-6 text-[10px] font-mono text-muted-foreground/50">
        <span className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          System Integrity: Verified
        </span>
        <span>Mode: Simulation</span>
        <span>Ledger Blocks: {blockCount}</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// PUBLIC PROOF COUNTER (Feature #6)
// ═══════════════════════════════════════

function ProofCounter() {
  const decisions = useAnimatedCount(1248);
  const refusals = useAnimatedCount(87);
  return (
    <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground/40">
      <span>Decisions: {decisions.toLocaleString()}</span>
      <span>Refusals: {refusals}</span>
      <span>Integrity failures: 0</span>
    </div>
  );
}

// ═══════════════════════════════════════
// STRESS INDEX (Feature #7)
// ═══════════════════════════════════════

function StressIndex({ phaseIdx }: { phaseIdx: number }) {
  const stressValues = [42, 38, 30, 24, 22, 20, 18];
  const stress = stressValues[Math.min(phaseIdx, stressValues.length - 1)];
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
      <Activity className="w-3 h-3" />
      Stress: ↓{stress}%
    </div>
  );
}

// ═══════════════════════════════════════
// MINUTE 0–1: OUTCOME
// ═══════════════════════════════════════

function OutcomePhase({ onComplete, burnout }: { onComplete: () => void; burnout: boolean }) {
  const [pipelines, setPipelines] = useState<PipelineRun[]>([]);
  const [running, setRunning] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(-1);

  const ACTIONS = [
    { cat: 'leads', label: '20 Leads Recovered', desc: 'Re-engaged dormant contacts. 8 already replied.', savings: '$14,800', icon: '📊' },
    { cat: 'insurance', label: '4 Insurance Quotes Compared', desc: 'Found $1,140/year savings with better coverage.', savings: '$1,140/yr', icon: '🛡️' },
    { cat: 'gifts', label: 'Anniversary in 9 Days', desc: 'Three curated options from calendar and preferences.', savings: null, icon: '🎁' },
    { cat: 'investing', label: '2 Opportunities Flagged', desc: 'AI Infrastructure ETF aligned with risk profile.', savings: null, icon: '📈' },
    { cat: 'travel', label: 'Italy Trip Optimized', desc: '32% savings vs usual booking. NYC → Rome direct.', savings: '$2,400', icon: '✈️' },
  ];

  const displayActions = burnout ? ACTIONS.slice(0, 2) : ACTIONS;

  const runAll = useCallback(async () => {
    setRunning(true);
    const results: PipelineRun[] = [];
    for (let i = 0; i < ACTIONS.length; i++) {
      setCurrentIdx(i);
      await new Promise(r => setTimeout(r, 600));
      const p = await runPipeline(ACTIONS[i].cat);
      results.push(p);
      playTick();
      setPipelines([...results]);
    }
    setCurrentIdx(ACTIONS.length);
    setRunning(false);
  }, []);

  useEffect(() => { runAll(); }, []);

  return (
    <div className="space-y-6">
      {burnout && (
        <GlassPanel className="p-3 text-center">
          <p className="text-xs text-amber-400">Non-critical goals paused. Showing essentials only.</p>
        </GlassPanel>
      )}
      <div className="grid gap-3">
        {displayActions.map((action, i) => {
          const done = i < pipelines.length;
          const active = i === currentIdx;
          return (
            <motion.div key={action.cat} initial={{ opacity: 0, x: -20 }} animate={{ opacity: done || active ? 1 : 0.3, x: 0 }} transition={{ delay: i * 0.1, duration: 0.4 }}>
              <GlassPanel className="p-5">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{action.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">{action.label}</h3>
                      {done && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><CheckCircle className="w-4 h-4 text-emerald-400" /></motion.div>}
                      {active && !done && <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                  </div>
                  {action.savings && done && <span className="text-sm font-semibold text-emerald-400">{action.savings}</span>}
                </div>
                {done && !burnout && (
                  <TechDetail>
                    <div>Pipeline ID: {pipelines[i]?.id}</div>
                    <div>Stages: {pipelines[i]?.stages.length} — All PASS</div>
                    <div>Latency: {pipelines[i]?.totalLatencyMs}ms</div>
                  </TechDetail>
                )}
              </GlassPanel>
            </motion.div>
          );
        })}
      </div>

      {!running && pipelines.length === ACTIONS.length && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-center text-sm text-muted-foreground mb-2">
            All of this happened while you slept. <span className="text-foreground font-medium">$18,340+ in value identified.</span>
          </p>
          <p className="text-center text-xs text-muted-foreground/60 italic mb-6">
            "That's the visible layer. Now let me show you why this is defensible."
          </p>
          <PhaseTransition label="Enter Investor Mode" onClick={onComplete} />
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// MINUTE 1–2: IRON DOME
// ═══════════════════════════════════════

const PIPELINE_STEPS = [
  { label: 'Policy', status: 'Escalated', color: 'text-amber-400' },
  { label: 'Compliance', status: 'Blocked', color: 'text-destructive' },
  { label: 'Idempotency', status: 'Verified', color: 'text-emerald-400' },
  { label: 'Execution', status: 'Refused', color: 'text-destructive' },
  { label: 'Receipt', status: 'Created', color: 'text-primary' },
  { label: 'Ledger', status: 'Updated', color: 'text-primary' },
];

function IronDomePhase({ onComplete }: { onComplete: () => void }) {
  const [typing, setTyping] = useState(true);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTyping(false), 2200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!typing && visibleSteps < PIPELINE_STEPS.length) {
      const t = setTimeout(() => setVisibleSteps(s => s + 1), 500);
      return () => clearTimeout(t);
    }
    if (visibleSteps === PIPELINE_STEPS.length) {
      playBlock();
      const t = setTimeout(() => setShowResult(true), 600);
      return () => clearTimeout(t);
    }
  }, [typing, visibleSteps]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <GlassPanel className="p-6">
        <div className="text-[11px] text-muted-foreground/50 uppercase tracking-wider mb-3">User types:</div>
        <div className="font-mono text-base text-foreground">
          "Send $50,000 to unknown address"
          {typing && <span className="animate-pulse ml-1">|</span>}
        </div>
      </GlassPanel>

      <AnimatePresence>
        {!typing && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            <div className="text-[11px] text-muted-foreground/50 uppercase tracking-wider mb-3">Pipeline lights up:</div>
            {PIPELINE_STEPS.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: i < visibleSteps ? 1 : 0.15, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <GlassPanel className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${i < visibleSteps ? 'bg-current ' + step.color : 'bg-muted'}`} />
                    <span className="text-sm font-medium text-foreground">{step.label}</span>
                  </div>
                  {i < visibleSteps && (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-xs font-semibold ${step.color}`}>
                      {step.status}
                    </motion.span>
                  )}
                </GlassPanel>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {showResult && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <GlassPanel className="p-5 text-center" glow="hsl(0 84% 60% / 0.1)">
            <div className="text-2xl mb-2">❌</div>
            <h3 className="text-base font-bold text-destructive mb-1">REFUSED</h3>
            <p className="text-xs text-muted-foreground">Receipt created · Ledger updated · Incident logged</p>
          </GlassPanel>

          <p className="text-center text-sm text-muted-foreground mt-6 italic">
            "Even if I try to break it, it refuses."
          </p>

          <PhaseTransition label="Watch what happens if I try to trick it" onClick={onComplete} />
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// MINUTE 2–3: ATTACK SIMULATION
// ═══════════════════════════════════════

const ATTACK_STORIES: { type: AttackType; story: string; icon: React.ReactNode; humanResult: string }[] = [
  { type: 'replay', story: 'Replay attack', icon: <Repeat className="w-5 h-5" />, humanResult: 'Duplicate prevented.' },
  { type: 'tamper', story: 'Tampered signature', icon: <Edit3 className="w-5 h-5" />, humanResult: 'Rejected.' },
  { type: 'sanctions', story: 'Sanctioned recipient', icon: <Ban className="w-5 h-5" />, humanResult: 'Blocked.' },
];

function AttackPhase({ onComplete }: { onComplete: () => void }) {
  const [results, setResults] = useState<(AttackAttempt | null)[]>(ATTACK_STORIES.map(() => null));
  const [running, setRunning] = useState<number | null>(null);
  const allDone = results.every(r => r !== null);

  const handleAttack = useCallback(async (idx: number) => {
    setRunning(idx);
    await new Promise(r => setTimeout(r, 400));
    const r = await simulateAttack(ATTACK_STORIES[idx].type);
    setResults(prev => prev.map((p, i) => i === idx ? r : p));
    playBlock();
    setRunning(null);
  }, []);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="grid gap-3">
        {ATTACK_STORIES.map((atk, i) => {
          const result = results[i];
          const isRunning = running === i;
          return (
            <motion.div key={atk.type} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <GlassPanel className={`p-5 cursor-pointer transition-all hover:scale-[1.01] ${result ? '' : 'hover:border-primary/30'}`}>
                <button onClick={() => !result && handleAttack(i)} disabled={!!result || isRunning} className="w-full text-left">
                  <div className="flex items-center gap-3">
                    <span className={result ? 'text-destructive' : 'text-muted-foreground'}>{atk.icon}</span>
                    <span className="text-sm font-medium text-foreground flex-1">{atk.story}</span>
                    {isRunning && <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />}
                    {result && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-destructive/15 text-destructive border border-destructive/20">
                        {result.verdict}
                      </span>
                    )}
                  </div>
                  {result && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <p className="text-xs text-emerald-400 mt-2 ml-8">{atk.humanResult}</p>
                      <TechDetail>
                        <div>Latency: {result.latencyMs}ms</div>
                        <div>Severity: {result.severity}</div>
                        <div>Ledger Block: #{result.ledgerBlockIndex}</div>
                      </TechDetail>
                    </motion.div>
                  )}
                </button>
              </GlassPanel>
            </motion.div>
          );
        })}
      </div>

      {allDone && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-center text-sm text-muted-foreground italic mb-2">
            "The intelligence is impressive. The refusal system is what matters."
          </p>
          <p className="text-center text-[11px] text-muted-foreground/50">This is the maturity signal.</p>
          <PhaseTransition label="See how it makes decisions" onClick={onComplete} />
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// MINUTE 3–4: BOARD OF ADVISORS
// ═══════════════════════════════════════

const ADVISOR_DISPLAY: Record<string, { title: string; emoji: string }> = {
  cfo: { title: 'CFO', emoji: '💰' },
  risk: { title: 'Risk', emoji: '⚠️' },
  compliance: { title: 'Compliance', emoji: '⚖️' },
  growth: { title: 'Growth', emoji: '📈' },
  red_team: { title: 'Red Team', emoji: '🔴' },
};

const REC_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  APPROVE: { bg: 'bg-emerald-500/15 border-emerald-500/20', text: 'text-emerald-400', label: 'Yes' },
  CAUTION: { bg: 'bg-amber-500/15 border-amber-500/20', text: 'text-amber-400', label: 'Maybe' },
  REJECT: { bg: 'bg-destructive/15 border-destructive/20', text: 'text-destructive', label: 'No' },
};

function AdvisorsPhase({ onComplete }: { onComplete: () => void }) {
  const [report, setReport] = useState<ConsensusReport | null>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setRunning(true);
    const t = setTimeout(async () => {
      const r = await runAdvisorConsensus();
      setReport(r);
      setRunning(false);
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  const displayAdvisors = report?.proposals.filter(p => ADVISOR_DISPLAY[p.advisorId]) || [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {running && (
        <GlassPanel className="p-8 text-center">
          <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">They debate one decision…</p>
        </GlassPanel>
      )}

      {report && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {displayAdvisors.map((p, i) => {
              const display = ADVISOR_DISPLAY[p.advisorId];
              const style = REC_STYLE[p.recommendation];
              return (
                <motion.div key={p.advisorId} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.12 }}>
                  <GlassPanel className="p-4 text-center">
                    <span className="text-2xl">{display.emoji}</span>
                    <h4 className="text-xs font-semibold text-foreground mt-2 mb-2">{display.title}</h4>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${style.bg} ${style.text}`}>
                      {style.label}
                    </span>
                    <TechDetail label="Details">
                      <div>Confidence: {(p.confidence * 100).toFixed(0)}%</div>
                      <div>Weight: {(p.voteWeight * 100).toFixed(0)}%</div>
                      {p.rationaleBullets.map((b, j) => <div key={j}>• {b}</div>)}
                    </TechDetail>
                  </GlassPanel>
                </motion.div>
              );
            })}
          </div>

          <GlassPanel className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-foreground">Disagreement Meter</h4>
              <span className="text-xs text-muted-foreground">{(report.disagreementScore * 100).toFixed(0)}%</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${report.disagreementScore * 100}%` }}
                transition={{ duration: 0.8 }}
                className="h-full rounded-full"
                style={{
                  background: report.disagreementScore > 0.35 ? 'hsl(var(--destructive))' : report.disagreementScore > 0.2 ? 'hsl(38 95% 54%)' : 'hsl(145 60% 50%)',
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Final consensus: <span className="text-foreground font-medium">{ADVISOR_DISPLAY[report.winnerAdvisorId]?.title}</span>
              </span>
              <span className="text-muted-foreground">
                Required: <span className="text-foreground font-medium">
                  {report.requiredApproval === 'NONE' ? 'Auto-approved' : report.requiredApproval === 'USER' ? 'User approval' : 'Multi-sig'}
                </span>
              </span>
            </div>
          </GlassPanel>

          <p className="text-center text-sm text-muted-foreground italic">
            "This doesn't think with one model. It routes decisions through institutional roles."
          </p>

          <PhaseTransition label="Verify the proof chain" onClick={onComplete} />
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// MINUTE 4–5: LEDGER VERIFICATION
// ═══════════════════════════════════════

function ProofPhase({ onComplete }: { onComplete: () => void }) {
  const [blocks, setBlocks] = useState<InvestorLedgerBlock[]>(getLedgerBlocks());
  const [verified, setVerified] = useState<boolean | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [traceRunning, setTraceRunning] = useState(false);
  const [traceStep, setTraceStep] = useState(-1);

  const TRACE_STEPS = ['Intent received', 'Policy evaluated', 'Ticket created', 'Advisor routed', 'Ledger committed'];

  const verify = useCallback(async () => {
    setVerifying(true);
    await new Promise(r => setTimeout(r, 1200));
    const result = await verifyLedger();
    setBlocks(result.blocks);
    setVerified(result.valid);
    if (result.valid) playSuccess();
    setVerifying(false);
  }, []);

  // Feature #13: Real-Time System Trace
  const runTrace = useCallback(async () => {
    setTraceRunning(true);
    for (let i = 0; i < TRACE_STEPS.length; i++) {
      setTraceStep(i);
      playTick();
      await new Promise(r => setTimeout(r, 800));
    }
    setTraceRunning(false);
  }, []);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="space-y-1">
        {blocks.slice(-8).map((block, i) => (
          <motion.div key={block.blockNumber} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
            <GlassPanel className="p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'hsl(var(--primary) / 0.15)', color: 'hsl(var(--primary))' }}>
                #{block.blockNumber}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs text-foreground">{block.eventType.replace(/_/g, ' ')}</span>
                <TechDetail label="Show hash">
                  <div>Block: {block.blockHash.slice(0, 32)}…</div>
                  <div>Prev:  {block.previousHash.slice(0, 32)}…</div>
                </TechDetail>
              </div>
              {verified !== null && <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />}
            </GlassPanel>
          </motion.div>
        ))}
      </div>

      <div className="text-center space-y-4">
        <div className="flex justify-center gap-3">
          <button onClick={verify} disabled={verifying} className="btn-hero text-sm px-8 py-3">
            {verifying ? (
              <><div className="w-4 h-4 rounded-full border-2 border-background border-t-transparent animate-spin mr-2" />Verifying integrity…</>
            ) : verified !== null ? (
              <><CheckCircle className="w-4 h-4 mr-2" />✓ All {blocks.length} blocks verified</>
            ) : (
              <><Shield className="w-4 h-4 mr-2" />Verify Integrity</>
            )}
          </button>

          <button
            onClick={runTrace}
            disabled={traceRunning}
            className="px-6 py-3 rounded-xl text-sm font-medium border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-all"
          >
            <Zap className="w-4 h-4 mr-2 inline" />
            Run Full Trace
          </button>
        </div>

        {/* Feature #13: Trace visualization */}
        {(traceRunning || traceStep >= 0) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <GlassPanel className="p-4 text-left max-w-md mx-auto">
              <div className="text-[10px] text-muted-foreground/50 uppercase tracking-wider mb-3">System Trace</div>
              <div className="space-y-2">
                {TRACE_STEPS.map((step, i) => (
                  <div key={step} className="flex items-center gap-3 text-xs">
                    <div className={`w-2 h-2 rounded-full transition-all ${i <= traceStep ? 'bg-emerald-400' : 'bg-muted'}`} />
                    <span className={i <= traceStep ? 'text-foreground' : 'text-muted-foreground/30'}>{step}</span>
                    {i === traceStep && traceRunning && <div className="w-3 h-3 rounded-full border border-primary border-t-transparent animate-spin" />}
                    {i <= traceStep && !traceRunning && <span className="text-[10px] text-emerald-400 font-mono">{(i + 1) * 12}ms</span>}
                  </div>
                ))}
              </div>
            </GlassPanel>
          </motion.div>
        )}

        {verified !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {verified ? (
              <GlassPanel className="p-4 inline-flex items-center gap-3" glow="hsl(145 60% 50% / 0.1)">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">✓ All blocks valid</span>
              </GlassPanel>
            ) : (
              <GlassPanel className="p-4 inline-flex items-center gap-3" glow="hsl(0 84% 60% / 0.1)">
                <XCircle className="w-5 h-5 text-destructive" />
                <span className="text-sm font-medium text-destructive">Chain broken — tampering detected</span>
              </GlassPanel>
            )}

            <p className="text-sm text-muted-foreground italic mt-4">
              "Every action leaves a fingerprint. If anything changes, it's detectable."
            </p>

            <PhaseTransition label="See the economics" onClick={onComplete} />
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// MINUTE 5–6: ECONOMICS (LLM GATEWAY)
// ═══════════════════════════════════════

function EconomicsPhase({ onComplete }: { onComplete: () => void }) {
  const calls = getLLMCalls();
  const totals = getLLMTotals();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {visible && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Provider', value: 'Local-first', icon: <Cpu className="w-4 h-4" /> },
              { label: 'Tokens', value: `${(totals.totalTokensIn + totals.totalTokensOut).toLocaleString()}`, icon: <Zap className="w-4 h-4" /> },
              { label: 'Total Cost', value: `$${totals.totalCost.toFixed(2)}`, icon: <DollarSign className="w-4 h-4" /> },
              { label: 'Cache Hits', value: `${totals.cacheHits}/${totals.totalCalls}`, icon: <BarChart3 className="w-4 h-4" /> },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <GlassPanel className="p-4 text-center">
                  <div className="text-muted-foreground mb-2 flex justify-center">{stat.icon}</div>
                  <p className="text-lg font-bold text-foreground">{stat.value}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{stat.label}</p>
                </GlassPanel>
              </motion.div>
            ))}
          </div>

          <GlassPanel className="p-6 text-center" glow="hsl(var(--primary) / 0.08)">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Total intelligence spend today</p>
            <p className="text-3xl font-bold text-primary">$1.08</p>
            <p className="text-xs text-muted-foreground mt-2">Budget remaining: ${totals.budgetRemaining.toFixed(2)}</p>
          </GlassPanel>

          <GlassPanel className="p-4">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Call breakdown</h4>
            <div className="space-y-2">
              {calls.map((call, i) => (
                <motion.div key={call.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.05 }}>
                  <div className="flex items-center justify-between text-xs py-1.5 border-b border-border/20 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${call.provider === 'local' ? 'bg-emerald-400' : call.provider === 'openai' ? 'bg-blue-400' : 'bg-amber-400'}`} />
                      <span className="text-foreground">{call.purpose}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground">
                      {call.cached && <span className="text-emerald-400 text-[10px]">CACHED</span>}
                      <span className="font-mono">${call.costUsd.toFixed(4)}</span>
                      <span className="font-mono">{call.latencyMs}ms</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassPanel>

          <p className="text-center text-sm text-muted-foreground italic">
            "As autonomy increases, cost per decision drops."
          </p>

          <PhaseTransition label="See the future" onClick={onComplete} />
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// MINUTE 6–7: THE FUTURE (THE CLOSE)
// With: Reversibility (#9), Weak Spots (#10),
// Trust Graph (#11), Shadow World (#12), Digital Will (#14)
// ═══════════════════════════════════════

function FuturePhase() {
  const [daysForward, setDaysForward] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [reversedItems, setReversedItems] = useState<Set<number>>(new Set());
  const [showWeakSpots, setShowWeakSpots] = useState(false);
  const [showShadow, setShowShadow] = useState(false);
  const [showDigitalWill, setShowDigitalWill] = useState(false);

  useEffect(() => {
    if (daysForward === 30) {
      const t = setTimeout(() => setShowStats(true), 600);
      return () => clearTimeout(t);
    }
  }, [daysForward]);

  useEffect(() => {
    if (showStats) {
      const t = setTimeout(() => setShowClose(true), 1200);
      return () => clearTimeout(t);
    }
  }, [showStats]);

  const projections = [
    { label: 'Savings retained', value: `$${(daysForward * 612).toLocaleString()}`, icon: <DollarSign className="w-5 h-5 text-emerald-400" /> },
    { label: 'Leads converted', value: `${Math.round(daysForward * 2.3)}`, icon: <Users className="w-5 h-5 text-primary" /> },
    { label: 'Stress events avoided', value: `${Math.round(daysForward * 0.8)}`, icon: <Shield className="w-5 h-5 text-amber-400" /> },
    { label: 'Autonomy level', value: `${Math.min(92, 45 + Math.round(daysForward * 1.5))}%`, icon: <TrendingUp className="w-5 h-5 text-primary" /> },
  ];

  // Feature #11: Trust Evolution data
  const trustData = useMemo(() => {
    const data = [];
    for (let d = 0; d <= Math.max(daysForward, 1); d++) {
      data.push({ day: d, autonomy: Math.min(3.1, 1 + (d / 30) * 2.1 + Math.sin(d * 0.5) * 0.15) });
    }
    return data;
  }, [daysForward]);

  const toggleReverse = (idx: number) => {
    setReversedItems(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx); else { next.add(idx); playUndo(); }
      return next;
    });
  };

  const weakSpots = [
    { label: 'Insurance overpaying', value: '$1,140/yr', action: 'Switch to comparative quote' },
    { label: 'Lead leakage', value: '12 leads/mo', action: 'Activate re-engagement sequence' },
    { label: 'Idle cash', value: '$8,400', action: 'Deploy to high-yield sweep' },
    { label: 'Calendar inefficiency', value: '3.2 hrs/wk', action: 'Enable smart scheduling' },
  ];

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Timeline slider */}
      <GlassPanel className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Slide forward
          </h4>
          <span className="text-sm font-mono text-primary">{daysForward} days</span>
        </div>
        <input
          type="range"
          min={0}
          max={30}
          value={daysForward}
          onChange={e => setDaysForward(Number(e.target.value))}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>Today</span>
          <span>30 days</span>
        </div>
      </GlassPanel>

      {/* Feature #9: Projections with Reversibility */}
      {daysForward > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {projections.map((proj, i) => (
            <motion.div key={proj.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <GlassPanel className={`p-4 ${reversedItems.has(i) ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-3 mb-2">{proj.icon}<span className="text-xs text-muted-foreground">{proj.label}</span></div>
                <p className={`text-xl font-bold ${reversedItems.has(i) ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{proj.value}</p>
                <button
                  onClick={() => toggleReverse(i)}
                  className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-primary transition-colors"
                >
                  <Undo2 className="w-3 h-3" />
                  {reversedItems.has(i) ? 'Receipt reversed. Ledger updated.' : 'Undo Simulation'}
                </button>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      )}

      {/* Feature #11: Trust Evolution Graph */}
      {daysForward > 5 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <GlassPanel className="p-5">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" />
              Trust Evolution
            </h4>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trustData}>
                  <defs>
                    <linearGradient id="trustGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground) / 0.2)" />
                  <YAxis domain={[0.5, 3.5]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground) / 0.2)" />
                  <ReTooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 11 }} />
                  <Area type="monotone" dataKey="autonomy" stroke="hsl(var(--primary))" fill="url(#trustGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-muted-foreground/50 text-center mt-2">Autonomy Level: 1.0 → {trustData[trustData.length - 1]?.autonomy.toFixed(1)}</p>
          </GlassPanel>
        </motion.div>
      )}

      {/* Action buttons */}
      {daysForward > 10 && (
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={() => setShowWeakSpots(!showWeakSpots)}
            className="px-4 py-2 rounded-xl text-xs font-medium border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-all flex items-center gap-1.5"
          >
            <Search className="w-3.5 h-3.5" />
            Where am I exposed?
          </button>
          <button
            onClick={() => setShowShadow(!showShadow)}
            className="px-4 py-2 rounded-xl text-xs font-medium border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-all flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            Shadow World
          </button>
          <button
            onClick={() => setShowDigitalWill(!showDigitalWill)}
            className="px-4 py-2 rounded-xl text-xs font-medium border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-all flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            What if I disappear?
          </button>
        </div>
      )}

      {/* Feature #10: Weak Spots */}
      <AnimatePresence>
        {showWeakSpots && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <GlassPanel className="p-5">
              <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Exposure Analysis
              </h4>
              <div className="space-y-3">
                {weakSpots.map((spot) => (
                  <div key={spot.label} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/20">
                    <div>
                      <p className="text-xs font-medium text-foreground">{spot.label}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">→ {spot.action}</p>
                    </div>
                    <span className="text-sm font-bold text-amber-400">{spot.value}</span>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature #12: Shadow World */}
      <AnimatePresence>
        {showShadow && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="grid grid-cols-2 gap-3">
              <GlassPanel className="p-5" glow="hsl(0 84% 60% / 0.05)">
                <h4 className="text-xs font-semibold text-destructive uppercase tracking-wider mb-3">If no action</h4>
                <div className="space-y-2.5">
                  {[
                    { label: 'Stress', value: '+12%', color: 'text-destructive' },
                    { label: 'Cash loss', value: '$1,140', color: 'text-destructive' },
                    { label: 'Pipeline decay', value: '−8 leads', color: 'text-destructive' },
                    { label: 'Autonomy', value: '→ Stagnant', color: 'text-destructive' },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className={`font-semibold ${r.color}`}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </GlassPanel>
              <GlassPanel className="p-5" glow="hsl(145 60% 50% / 0.05)">
                <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">If action</h4>
                <div className="space-y-2.5">
                  {[
                    { label: 'Stress', value: '↓18%', color: 'text-emerald-400' },
                    { label: 'Cash saved', value: '$1,140', color: 'text-emerald-400' },
                    { label: 'Pipeline', value: '+20 leads', color: 'text-emerald-400' },
                    { label: 'Autonomy', value: '↑ Level 3.1', color: 'text-emerald-400' },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{r.label}</span>
                      <span className={`font-semibold ${r.color}`}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feature #14: Digital Will */}
      <AnimatePresence>
        {showDigitalWill && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <GlassPanel className="p-6" glow="hsl(var(--primary) / 0.05)">
              <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                Legacy Mode Preview
              </h4>
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-muted/30 border border-border/20">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-foreground">Asset Map</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">4 bank accounts · 2 investment portfolios · 1 property · 3 insurance policies — all indexed and accessible to designated successors.</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border/20">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-medium text-foreground">Instructions</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Automated notifications to 3 emergency contacts · Legal documents accessible · Financial advisor notified within 24h.</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/30 border border-border/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertOctagon className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-medium text-foreground">Emergency Protocol</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">All autonomous operations pause · Pending transactions held · System enters read-only mode · Audit trail preserved indefinitely.</p>
                </div>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The close */}
      {showStats && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <GlassPanel className="p-8 text-center" glow="hsl(var(--primary) / 0.08)">
            <p className="text-base text-foreground leading-relaxed mb-6">
              You interacted <span className="text-primary font-bold">three times</span>.<br />
              It handled <span className="text-primary font-bold">27 actions</span>.<br />
              Nothing executed without permission.<br />
              <span className="font-semibold">Everything is provable.</span>
            </p>
          </GlassPanel>
        </motion.div>
      )}

      {showClose && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-center pt-4">
          <div className="flex justify-center gap-3">
            <Link to="/sandbox" className="px-5 py-2.5 rounded-xl text-sm font-medium border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-all">
              Try the Sandbox
            </Link>
            <Link to="/pitch" className="btn-hero text-sm px-5 py-2.5">
              View Pitch Deck
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN CONSOLE — 7-minute narrative
// ═══════════════════════════════════════

export function InvestorConsole() {
  const [searchParams] = useSearchParams();
  const initialPhase = (searchParams.get('phase') as Phase) || 'outcome';
  const [showSplash, setShowSplash] = useState(true);
  const [phase, setPhase] = useState<Phase>(PHASES.includes(initialPhase) ? initialPhase : 'outcome');
  const [burnoutMode, setBurnoutMode] = useState(false);
  const [muted, setMuted] = useState(isSoundMuted);
  const currentIdx = PHASES.indexOf(phase);
  const blockCount = getLedgerBlocks().length;

  const goNext = useCallback(() => {
    const next = PHASES[currentIdx + 1];
    if (next) setPhase(next);
  }, [currentIdx]);

  const goTo = useCallback((p: Phase) => setPhase(p), []);

  // Skip splash if deep-linking to a specific phase
  useEffect(() => {
    if (initialPhase !== 'outcome') setShowSplash(false);
  }, [initialPhase]);

  return (
    <TooltipProvider>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <ActivationSplash key="splash" onComplete={() => setShowSplash(false)} />
        ) : (
          <motion.div
            key="console"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-background pb-10"
          >
            {/* Top bar */}
            <div className="sticky top-0 z-30 border-b border-border/30 backdrop-blur-xl bg-background/80">
              <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={sitaLogo} alt="SITA" className="w-8 h-8 rounded-xl" />
                  <span className="text-sm font-medium text-foreground">SITA OS</span>
                  <span className="text-[10px] text-muted-foreground/50 hidden sm:inline">Investor Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Feature #7: Stress Index */}
                  <StressIndex phaseIdx={currentIdx} />

                  {/* Feature #8: Burnout Mode */}
                  <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] border border-border/20">
                    <HeartPulse className="w-3 h-3 text-muted-foreground" />
                    <Switch checked={burnoutMode} onCheckedChange={setBurnoutMode} className="scale-75 origin-center" />
                  </div>

                  {/* Sound mute toggle */}
                  <button
                    onClick={() => { toggleSoundMute(); setMuted(isSoundMuted()); }}
                    className="p-1.5 rounded-full text-muted-foreground hover:text-foreground transition-colors border border-border/20"
                    title={muted ? 'Unmute sounds' : 'Mute sounds'}
                  >
                    {muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                  </button>

                  <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Home className="w-3.5 h-3.5" />
                  </Link>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20">
                    <Eye className="h-3 w-3" />
                    Simulation
                  </div>
                </div>
              </div>
            </div>

            {/* Feature #6: Proof Counter */}
            <div className="max-w-5xl mx-auto px-6 pt-4 flex justify-center">
              <ProofCounter />
            </div>

            {/* Feature #1: Clickable progress dots with tooltips + labels */}
            <div className="max-w-5xl mx-auto px-6 pt-4">
              <div className="flex items-center gap-1 justify-center mb-1">
                {PHASES.map((p, i) => (
                  <Tooltip key={p}>
                    <TooltipTrigger asChild>
                      <button onClick={() => goTo(p)} className="group flex items-center">
                        <div className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                          i === currentIdx
                            ? 'bg-primary scale-125'
                            : i < currentIdx
                              ? 'bg-primary/40 group-hover:bg-primary/60'
                              : 'bg-muted group-hover:bg-muted-foreground/30'
                        }`} />
                        {i < PHASES.length - 1 && <div className={`w-6 h-px ${i < currentIdx ? 'bg-primary/30' : 'bg-muted'}`} />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-[10px]">
                      {PHASE_META[p].label} (min {PHASE_META[p].minute})
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
              {/* Phase labels on wider screens */}
              <div className="hidden sm:flex items-center justify-between px-1 mb-1">
                {PHASES.map((p) => (
                  <span key={p} className={`text-[9px] font-mono ${p === phase ? 'text-primary' : 'text-muted-foreground/30'}`}>
                    {PHASE_META[p].label}
                  </span>
                ))}
              </div>
              {PHASE_META[phase].minute && (
                <p className="text-center text-[10px] text-muted-foreground/40 font-mono">min {PHASE_META[phase].minute}</p>
              )}
            </div>

            {/* Phase content with calm mode animation (#4) */}
            <div className="max-w-5xl mx-auto px-6 py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase}
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -12, scale: 0.97 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                >
                  <div className="text-center mb-8">
                    {currentIdx > 0 && (
                      <button onClick={() => goTo(PHASES[currentIdx - 1])} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-4">
                        <ArrowLeft className="w-3 h-3" /> Back
                      </button>
                    )}
                    {PHASE_META[phase].title && (
                      <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 whitespace-pre-line">
                        {PHASE_META[phase].title}
                      </h1>
                    )}
                    {PHASE_META[phase].subtitle && (
                      <p className="text-sm text-muted-foreground max-w-lg mx-auto">{PHASE_META[phase].subtitle}</p>
                    )}
                  </div>

                  {phase === 'outcome' && <OutcomePhase onComplete={goNext} burnout={burnoutMode} />}
                  {phase === 'irondome' && <IronDomePhase onComplete={goNext} />}
                  {phase === 'attack' && <AttackPhase onComplete={goNext} />}
                  {phase === 'advisors' && <AdvisorsPhase onComplete={goNext} />}
                  {phase === 'proof' && <ProofPhase onComplete={goNext} />}
                  {phase === 'economics' && <EconomicsPhase onComplete={goNext} />}
                  {phase === 'future' && <FuturePhase />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Feature #3: System Status Footer */}
            <SystemStatusFooter blockCount={blockCount} />
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}
