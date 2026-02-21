import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { runPipeline } from '../../lib/investorSimEngine';
import type { PipelineRun, PipelineStageResult } from '../../contracts/investor';
import { Shield, CheckCircle, Clock, Zap, FileCheck, Lock, Box } from 'lucide-react';

const STAGE_META: Record<string, { label: string; icon: React.ReactNode }> = {
  intent: { label: 'Intent', icon: <Zap className="w-4 h-4" /> },
  policy_gate: { label: 'Policy Gate', icon: <Shield className="w-4 h-4" /> },
  ticket: { label: 'Ticket', icon: <FileCheck className="w-4 h-4" /> },
  preflight: { label: 'Preflight', icon: <CheckCircle className="w-4 h-4" /> },
  execution: { label: 'Execution', icon: <Zap className="w-4 h-4" /> },
  receipt: { label: 'Receipt', icon: <Lock className="w-4 h-4" /> },
  ledger_block: { label: 'Ledger Block', icon: <Box className="w-4 h-4" /> },
};

const CATEGORIES = ['travel', 'insurance', 'leads', 'gifts', 'investing'];

function StageCard({ stage, index, active }: { stage: PipelineStageResult; index: number; active: boolean }) {
  const meta = STAGE_META[stage.stage] || { label: stage.stage, icon: null };
  const pass = stage.status === 'PASS';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 0 }}
      transition={{ delay: index * 0.12, duration: 0.35 }}
      className="rounded-xl p-4"
      style={{
        background: pass ? 'rgba(255,255,255,0.03)' : 'rgba(239,68,68,0.08)',
        border: `1px solid ${pass ? 'rgba(255,255,255,0.08)' : 'rgba(239,68,68,0.3)'}`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: pass ? 'hsl(270 91% 65%)' : '#ef4444' }}>{meta.icon}</span>
        <span className="text-sm font-medium text-foreground">{meta.label}</span>
        <span className={`ml-auto text-xs font-mono px-2 py-0.5 rounded ${pass ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {stage.status}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">{stage.verdict}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-muted-foreground">Schema</span>
        <span className={stage.schemaValid ? 'text-emerald-400' : 'text-red-400'}>{stage.schemaValid ? '✓ Valid' : '✗ Invalid'}</span>
        <span className="text-muted-foreground">Risk</span>
        <span className="text-foreground">{stage.riskTier}</span>
        <span className="text-muted-foreground">Idempotency</span>
        <span className="text-foreground">{stage.idempotencyHit ? 'HIT (cached)' : 'MISS'}</span>
        <span className="text-muted-foreground">Compliance</span>
        <span className={stage.compliancePass ? 'text-emerald-400' : 'text-red-400'}>{stage.compliancePass ? '✓ Pass' : '✗ Fail'}</span>
        <span className="text-muted-foreground">Signature</span>
        <span className={stage.signatureValid ? 'text-emerald-400' : 'text-red-400'}>{stage.signatureValid ? '✓ Verified' : '✗ Invalid'}</span>
        <span className="text-muted-foreground">Latency</span>
        <span className="text-foreground">{stage.latencyMs}ms</span>
      </div>
    </motion.div>
  );
}

export function IronDomeConsole() {
  const [run, setRun] = useState<PipelineRun | null>(null);
  const [running, setRunning] = useState(false);
  const [activeStage, setActiveStage] = useState(-1);

  const execute = useCallback(async (cat: string) => {
    setRunning(true);
    setActiveStage(-1);
    setRun(null);
    const result = await runPipeline(cat);
    setRun(result);
    for (let i = 0; i < result.stages.length; i++) {
      await new Promise(r => setTimeout(r, 180));
      setActiveStage(i);
    }
    setRunning(false);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Iron Dome Pipeline</h3>
        <p className="text-sm text-muted-foreground">Single choke point. Every action traverses 7 stages before execution.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => execute(cat)}
            disabled={running}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'hsl(270 91% 75%)',
            }}
          >
            Run: {cat}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {run && (
          <motion.div
            key={run.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground font-mono">{run.id}</span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />{run.totalLatencyMs}ms
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${run.finalStatus === 'EXECUTED' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {run.finalStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {run.stages.map((stage, i) => (
                <StageCard key={stage.stage} stage={stage} index={i} active={i <= activeStage} />
              ))}
            </div>

            <div className="text-xs text-muted-foreground font-mono mt-2">
              Receipt: {run.receiptHash.slice(0, 16)}…
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
