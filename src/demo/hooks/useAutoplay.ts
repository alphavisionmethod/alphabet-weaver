import { useEffect, useRef, useCallback, useState } from 'react';
import { useDemo } from '../store';
import type { WorkflowId, IntelTabId } from '../types';

// Act boundaries in CINEMATIC_SEQUENCE (step indices, inclusive)
const ACT_BOUNDARIES = [
  { act: 1, label: 'Revenue Leak Detection', start: 0, end: 6 },
  { act: 2, label: 'Wire Transfer Approval', start: 7, end: 14 },
  { act: 3, label: 'Board Briefing', start: 15, end: 22 },
  { act: 4, label: 'Finale', start: 23, end: 23 },
];

export interface AutoplayProgress {
  act: number;
  actLabel: string;
  stepInAct: number;
  stepsInAct: number;
  overallProgress: number;
  estimatedSecondsLeft: number;
}

// Shared ref for current step so progress hook can read it
let _currentStep = 0;
let _totalSteps = 0;
let _totalDurationMs = 0;

type AutoplayAction =
  | { type: 'workflow'; action: 'start' | 'advance' | 'approve' | 'back'; workflowId?: WorkflowId }
  | { type: 'intel'; tab: IntelTabId }
  | { type: 'narrate'; text: string }
  | { type: 'dismiss_attack' }
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
  { actions: [{ type: 'workflow', action: 'approve' }, { type: 'dismiss_attack' }], delay: 2500, narration: 'Dual-signature confirmed. Wire approved with full audit trail.' },
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

export function useAutoplayProgress(): AutoplayProgress | null {
  const { autoplayActive } = useDemo();
  const [progress, setProgress] = useState<AutoplayProgress | null>(null);

  useEffect(() => {
    if (!autoplayActive) { setProgress(null); return; }

    const interval = setInterval(() => {
      const step = _currentStep;
      const actInfo = ACT_BOUNDARIES.find(a => step >= a.start && step <= a.end) || ACT_BOUNDARIES[0];
      const stepInAct = step - actInfo.start + 1;
      const stepsInAct = actInfo.end - actInfo.start + 1;
      const overallProgress = _totalSteps > 0 ? step / _totalSteps : 0;

      // Estimate remaining time
      const elapsedSteps = step;
      let remainingMs = 0;
      for (let i = elapsedSteps; i < CINEMATIC_SEQUENCE.length; i++) {
        remainingMs += CINEMATIC_SEQUENCE[i].delay;
      }

      setProgress({
        act: actInfo.act,
        actLabel: actInfo.label,
        stepInAct,
        stepsInAct,
        overallProgress,
        estimatedSecondsLeft: remainingMs / 1000,
      });
    }, 300);

    return () => clearInterval(interval);
  }, [autoplayActive]);

  return progress;
}

export function useAutoplay() {
  const {
    autoplayActive, stopAutoplay, setActiveWorkflow,
    advanceWorkflow, approveWire, resetDemo, setNarration, setIntelTab, dismissAttack,
  } = useDemo();

  const fnsRef = useRef({ setActiveWorkflow, advanceWorkflow, approveWire, stopAutoplay, setNarration, setIntelTab, dismissAttack });
  fnsRef.current = { setActiveWorkflow, advanceWorkflow, approveWire, stopAutoplay, setNarration, setIntelTab, dismissAttack };

  const stepRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const runStep = useCallback(() => {
    if (stepRef.current >= CINEMATIC_SEQUENCE.length) {
      _currentStep = CINEMATIC_SEQUENCE.length;
      fnsRef.current.stopAutoplay();
      return;
    }

    _currentStep = stepRef.current;

    const step = CINEMATIC_SEQUENCE[stepRef.current];
    const fns = fnsRef.current;

    if (step.narration) {
      fns.setNarration(step.narration);
    }

    for (const action of step.actions) {
      switch (action.type) {
        case 'workflow':
          switch (action.action) {
            case 'start':
              if (action.workflowId) {
                fns.setActiveWorkflow(action.workflowId);
                fns.advanceWorkflow(action.workflowId);
              }
              break;
            case 'advance':
              if (action.workflowId) fns.advanceWorkflow(action.workflowId);
              break;
            case 'approve':
              fns.approveWire();
              break;
            case 'back':
              fns.setActiveWorkflow(null);
              break;
          }
          break;
        case 'intel':
          fns.setIntelTab(action.tab);
          break;
        case 'dismiss_attack':
          fns.dismissAttack();
          break;
        case 'narrate':
          fns.setNarration(action.text);
          break;
        case 'pause':
          break;
      }
    }

    stepRef.current++;
    timerRef.current = setTimeout(runStep, step.delay);
  }, []); // No deps — uses refs

  useEffect(() => {
    _totalSteps = CINEMATIC_SEQUENCE.length;
    if (autoplayActive) {
      resetDemo();
      stepRef.current = 0;
      _currentStep = 0;
      // Small delay to let reset settle before starting
      timerRef.current = setTimeout(runStep, 1500);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [autoplayActive, runStep, resetDemo]);
}
