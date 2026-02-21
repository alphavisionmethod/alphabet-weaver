import { useEffect, useRef, useCallback } from 'react';
import { useDemo } from '../store';
import type { WorkflowId, IntelTabId } from '../types';

type AutoplayAction =
  | { type: 'workflow'; action: 'start' | 'advance' | 'approve' | 'back'; workflowId?: WorkflowId }
  | { type: 'intel'; tab: IntelTabId }
  | { type: 'narrate'; text: string }
  | { type: 'pause' };

interface AutoplayStep {
  actions: AutoplayAction[];
  delay: number;
  narration?: string;
}

const CINEMATIC_SEQUENCE: AutoplayStep[] = [
  // === ACT 1: Revenue Leak ===
  { actions: [{ type: 'narrate', text: 'Act 1 — Revenue Leak Detection. SITA autonomously scans 847 vendor records.' }], delay: 2500 },
  { actions: [{ type: 'workflow', action: 'start', workflowId: 'revenue-leak' }, { type: 'intel', tab: 'meta' }], delay: 3000, narration: 'Meta-reliability model assessing prediction confidence…' },
  { actions: [{ type: 'workflow', action: 'advance', workflowId: 'revenue-leak' }], delay: 3000, narration: '5 anomalies found — $27,688 recoverable. Autonomy level: L2.' },
  { actions: [{ type: 'intel', tab: 'ledger' }], delay: 3000, narration: 'Decision Ledger: every action hashed into an append-only chain. Fully replayable.' },
  { actions: [{ type: 'intel', tab: 'regime' }], delay: 3000, narration: 'Regime Geometry: continuous state embedding tracks market dynamics in real-time.' },
  { actions: [{ type: 'workflow', action: 'advance', workflowId: 'revenue-leak' }], delay: 2500, narration: 'Approved autonomously — policy gates passed. Receipt minted.' },
  { actions: [{ type: 'workflow', action: 'back' }], delay: 2000 },

  // === ACT 2: Wire Transfer ===
  { actions: [{ type: 'narrate', text: 'Act 2 — Wire Transfer with Dual-Signature Approval.' }], delay: 2500 },
  { actions: [{ type: 'workflow', action: 'start', workflowId: 'wire-transfer' }, { type: 'intel', tab: 'drift' }], delay: 3000, narration: 'Adversarial Drift Simulator: stress-testing against 6 failure scenarios…' },
  { actions: [{ type: 'workflow', action: 'advance', workflowId: 'wire-transfer' }], delay: 3000, narration: 'Risk score 32%. Typosquat attack detected — autonomy throttled to L0.' },
  { actions: [{ type: 'intel', tab: 'meta' }], delay: 3000, narration: 'Meta-reliability drops to 65%. System escalates to human approval.' },
  { actions: [{ type: 'workflow', action: 'approve' }], delay: 2500, narration: 'Dual-signature confirmed. Wire approved with full audit trail.' },
  { actions: [{ type: 'intel', tab: 'decay' }], delay: 3500, narration: 'Confidence Decay Forecast: predicting reliability over next 50 decisions.' },
  { actions: [{ type: 'workflow', action: 'back' }], delay: 2000 },

  // === ACT 3: Board Briefing ===
  { actions: [{ type: 'narrate', text: 'Act 3 — Advisory Board Briefing. 12 advisors queried simultaneously.' }], delay: 2500 },
  { actions: [{ type: 'workflow', action: 'start', workflowId: 'board-briefing' }, { type: 'intel', tab: 'experiments' }], delay: 3000, narration: 'Safe Micro-Experiments: proposing 4 interventions with risk-bounded exploration.' },
  { actions: [{ type: 'workflow', action: 'advance', workflowId: 'board-briefing' }], delay: 3500, narration: 'Aggregating 12 advisor stances. Circuit breaker active — no harmful probes.' },
  { actions: [{ type: 'intel', tab: 'regime' }], delay: 3000, narration: 'Regime trajectory shows stable curvature. System maintaining L2 autonomy.' },
  { actions: [{ type: 'workflow', action: 'advance', workflowId: 'board-briefing' }], delay: 2500, narration: 'Board briefing compiled. Receipt minted.' },
  { actions: [{ type: 'intel', tab: 'ledger' }], delay: 3500, narration: 'Full decision chain verified. 3 workflows, 7 policy gates, 100% replay fidelity.' },
  { actions: [{ type: 'workflow', action: 'back' }], delay: 2000 },

  // === FINALE ===
  { actions: [{ type: 'narrate', text: 'All workflows complete. A self-auditing system that learns when it\'s wrong — and proves when it\'s right.' }], delay: 4000 },
];

export function useAutoplay() {
  const {
    autoplayActive, stopAutoplay, setActiveWorkflow,
    advanceWorkflow, approveWire, resetDemo, setNarration, setIntelTab,
  } = useDemo();
  const stepRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const runStep = useCallback(() => {
    if (stepRef.current >= CINEMATIC_SEQUENCE.length) {
      stopAutoplay();
      return;
    }

    const step = CINEMATIC_SEQUENCE[stepRef.current];

    // Set narration first if present
    if (step.narration) {
      setNarration(step.narration);
    }

    // Execute all actions in this step
    for (const action of step.actions) {
      switch (action.type) {
        case 'workflow':
          switch (action.action) {
            case 'start':
              if (action.workflowId) {
                setActiveWorkflow(action.workflowId);
                advanceWorkflow(action.workflowId);
              }
              break;
            case 'advance':
              if (action.workflowId) advanceWorkflow(action.workflowId);
              break;
            case 'approve':
              approveWire();
              break;
            case 'back':
              setActiveWorkflow(null);
              break;
          }
          break;
        case 'intel':
          setIntelTab(action.tab);
          break;
        case 'narrate':
          setNarration(action.text);
          break;
        case 'pause':
          break;
      }
    }

    stepRef.current++;
    timerRef.current = setTimeout(runStep, step.delay);
  }, [setActiveWorkflow, advanceWorkflow, approveWire, stopAutoplay, setNarration, setIntelTab]);

  useEffect(() => {
    if (autoplayActive) {
      resetDemo();
      stepRef.current = 0;
      timerRef.current = setTimeout(runStep, 1200);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [autoplayActive, runStep, resetDemo]);
}
