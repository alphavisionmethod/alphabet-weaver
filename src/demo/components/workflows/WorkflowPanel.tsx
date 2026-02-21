import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemo } from '../../store';
import { FINDINGS, WIRE_TRANSFER } from '../../data';
import { FloatingCard } from '../ui/FloatingCard';
import { PolicyBadge } from '../ui/PolicyBadge';
import { SlideToApprove } from '../ui/SlideToApprove';
import { ReceiptCard } from '../ui/ReceiptCard';
import { Confetti } from '../ui/Confetti';
import { AdvisorVoteAnimation } from '../ui/AdvisorVoteAnimation';
import { Play, ArrowRight, AlertTriangle, DollarSign, Users, Loader2 } from 'lucide-react';
import type { WorkflowId } from '../../types';
import { useSoundEffects } from '../../hooks/useSoundEffects';

const WORKFLOW_META: Record<WorkflowId, { label: string; icon: typeof DollarSign; desc: string }> = {
  'revenue-leak': { label: 'Revenue Leak Detector', icon: DollarSign, desc: 'Scan for duplicate charges, missing invoices, and anomalies.' },
  'wire-transfer': { label: 'Wire Transfer', icon: AlertTriangle, desc: 'Draft, verify, and approve outbound wire transfers.' },
  'board-briefing': { label: 'Board Briefing', icon: Users, desc: 'Compile advisor stances into an actionable recommendation.' },
};

export function WorkflowPanel() {
  const { activeWorkflow, workflows, setActiveWorkflow, advanceWorkflow, approveWire, settings } = useDemo();
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  const { play } = useSoundEffects();
  const prevStepRef = useRef<string | null>(null);

  // Sound effects + confetti on step transitions
  useEffect(() => {
    const step = activeWorkflow ? workflows[activeWorkflow]?.step : null;
    const prevStep = prevStepRef.current;
    prevStepRef.current = step;

    if (!step || step === prevStep) return;

    switch (step) {
      case 'scanning':
        play('chime');
        break;
      case 'approval':
        play('warning');
        break;
      case 'approved':
        play('confirm');
        break;
      case 'receipt':
        play('stamp');
        setConfettiTrigger(true);
        setTimeout(() => setConfettiTrigger(false), 100);
        break;
    }
  }, [activeWorkflow, activeWorkflow ? workflows[activeWorkflow]?.step : null, play]);

  if (!activeWorkflow) {
    return (
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">Workflows</h2>
        {(Object.keys(WORKFLOW_META) as WorkflowId[]).map(id => {
          const meta = WORKFLOW_META[id];
          const wf = workflows[id];
          const Icon = meta.icon;
          const hasReceipt = wf.receipts.length > 0;
          return (
            <FloatingCard key={id} className="cursor-pointer hover:border-primary/30 transition-colors" depth={1}>
              <button onClick={() => { setActiveWorkflow(id); if (wf.step === 'idle') advanceWorkflow(id); }} className="w-full text-left">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{meta.label}</span>
                      {hasReceipt && <span className="text-[9px] text-emerald-400">✓ Complete</span>}
                    </div>
                    <p className="text-[10px] text-muted-foreground truncate">{meta.desc}</p>
                  </div>
                  <Play className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              </button>
            </FloatingCard>
          );
        })}
      </div>
    );
  }

  const wf = workflows[activeWorkflow];
  const meta = WORKFLOW_META[activeWorkflow];

  return (
    <div className="space-y-4 relative">
      <Confetti trigger={confettiTrigger} />

      <div className="flex items-center gap-2">
        <button onClick={() => setActiveWorkflow(null)} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">← Back</button>
        <span className="text-sm font-semibold text-foreground">{meta.label}</span>
        <span className="ml-auto text-[9px] text-muted-foreground font-mono">{settings.connectorMode}</span>
      </div>

      {/* Policy gates */}
      {wf.policyGates.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {wf.policyGates.map((g, i) => <PolicyBadge key={i} verdict={g.verdict} rule={g.rule} compact />)}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Scanning */}
        {(wf.step === 'scanning') && (
          <motion.div key="scanning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FloatingCard>
              <div className="flex items-center gap-3 py-4">
                <Loader2 className="h-4 w-4 text-primary animate-spin" />
                <div>
                  <p className="text-xs font-medium text-foreground">Scanning…</p>
                  <p className="text-[10px] text-muted-foreground">Analyzing financial records and vendor data.</p>
                </div>
              </div>
              <button onClick={() => advanceWorkflow(activeWorkflow)} className="w-full mt-2 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5">
                Complete scan <ArrowRight className="h-3 w-3" />
              </button>
            </FloatingCard>
          </motion.div>
        )}

        {/* Findings */}
        {wf.step === 'findings' && (
          <motion.div key="findings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
            {activeWorkflow === 'revenue-leak' && FINDINGS.map(f => (
              <FloatingCard key={f.id} depth={1}>
                <div className="flex items-start gap-2">
                  <div className={`mt-0.5 h-2 w-2 rounded-full ${f.severity === 'critical' ? 'bg-red-400' : f.severity === 'high' ? 'bg-amber-400' : f.severity === 'medium' ? 'bg-yellow-400' : 'bg-muted-foreground/40'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-foreground">{f.title}</span>
                      <span className="text-[9px] text-muted-foreground">{f.vendor}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{f.description}</p>
                    <span className="text-[10px] font-medium text-primary">${(f.amount / 100).toFixed(2)}</span>
                  </div>
                </div>
              </FloatingCard>
            ))}

            {/* Animated advisor voting for board briefing */}
            {activeWorkflow === 'board-briefing' && (
              <AdvisorVoteAnimation />
            )}

            {activeWorkflow === 'wire-transfer' && (
              <FloatingCard>
                <div className="space-y-2">
                  {Object.entries(WIRE_TRANSFER).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[10px]">
                      <span className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-foreground font-mono">{typeof v === 'number' ? (k === 'riskScore' ? `${(v * 100).toFixed(0)}%` : `$${v.toLocaleString()}`) : typeof v === 'boolean' ? (v ? 'Yes' : 'No') : String(v)}</span>
                    </div>
                  ))}
                </div>
              </FloatingCard>
            )}

            <button onClick={() => advanceWorkflow(activeWorkflow)} className="w-full py-2 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5">
              {activeWorkflow === 'wire-transfer' ? 'Proceed to approval' : 'Mint receipt'} <ArrowRight className="h-3 w-3" />
            </button>
          </motion.div>
        )}

        {/* Approval (wire only) */}
        {wf.step === 'approval' && (
          <motion.div key="approval" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
            <FloatingCard>
              <p className="text-xs text-foreground font-medium mb-1">Wire Transfer Approval Required</p>
              <p className="text-[10px] text-muted-foreground mb-3">
                ${WIRE_TRANSFER.amount.toLocaleString()} {WIRE_TRANSFER.currency} → {WIRE_TRANSFER.recipient}
              </p>
              <SlideToApprove onApprove={approveWire} />
            </FloatingCard>
          </motion.div>
        )}

        {/* Approved */}
        {wf.step === 'approved' && (
          <motion.div key="approved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <FloatingCard>
              <div className="flex items-center gap-2 py-2">
                <div className="h-6 w-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <svg className="h-3 w-3 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12l5 5L20 7" /></svg>
                </div>
                <span className="text-xs font-medium text-foreground">Action approved. Minting receipt…</span>
              </div>
            </FloatingCard>
          </motion.div>
        )}

        {/* Receipt */}
        {wf.step === 'receipt' && wf.receipts.length > 0 && (
          <motion.div key="receipt" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <ReceiptCard receipt={wf.receipts[wf.receipts.length - 1]} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
