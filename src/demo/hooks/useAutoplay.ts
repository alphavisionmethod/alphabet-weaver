import { useEffect, useRef, useCallback } from 'react';
import { useDemo } from '../store';
import type { WorkflowId } from '../types';

const AUTOPLAY_SEQUENCE: { action: string; delay: number; workflowId?: WorkflowId }[] = [
  { action: 'start', delay: 1500, workflowId: 'revenue-leak' },
  { action: 'advance', delay: 2500, workflowId: 'revenue-leak' },
  { action: 'advance', delay: 3000, workflowId: 'revenue-leak' },
  { action: 'back', delay: 2000 },
  { action: 'start', delay: 1500, workflowId: 'wire-transfer' },
  { action: 'advance', delay: 2500, workflowId: 'wire-transfer' },
  { action: 'advance', delay: 2500, workflowId: 'wire-transfer' },
  { action: 'approve', delay: 2000 },
  { action: 'back', delay: 2000 },
  { action: 'start', delay: 1500, workflowId: 'board-briefing' },
  { action: 'advance', delay: 2500, workflowId: 'board-briefing' },
  { action: 'advance', delay: 3000, workflowId: 'board-briefing' },
  { action: 'back', delay: 2000 },
];

export function useAutoplay() {
  const { autoplayActive, stopAutoplay, setActiveWorkflow, advanceWorkflow, approveWire, resetDemo } = useDemo();
  const stepRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const captionRef = useRef('');

  const CAPTIONS: Record<string, string> = {
    'start:revenue-leak': 'SITA is scanning for revenue anomalies…',
    'advance:revenue-leak': 'Analyzing findings across vendor data…',
    'start:wire-transfer': 'Drafting wire transfer for approval…',
    'advance:wire-transfer': 'Verifying AML compliance & risk scoring…',
    'approve': 'Dual-signature approval confirmed.',
    'start:board-briefing': 'Compiling advisor stances…',
    'advance:board-briefing': 'Aggregating recommendations from 12 advisors…',
  };

  const runStep = useCallback(() => {
    if (stepRef.current >= AUTOPLAY_SEQUENCE.length) {
      stopAutoplay();
      return;
    }

    const step = AUTOPLAY_SEQUENCE[stepRef.current];
    const captionKey = step.workflowId ? `${step.action}:${step.workflowId}` : step.action;
    captionRef.current = CAPTIONS[captionKey] || '';

    switch (step.action) {
      case 'start':
        if (step.workflowId) {
          setActiveWorkflow(step.workflowId);
          advanceWorkflow(step.workflowId);
        }
        break;
      case 'advance':
        if (step.workflowId) advanceWorkflow(step.workflowId);
        break;
      case 'approve':
        approveWire();
        break;
      case 'back':
        setActiveWorkflow(null);
        break;
    }

    stepRef.current++;
    timerRef.current = setTimeout(runStep, step.delay);
  }, [setActiveWorkflow, advanceWorkflow, approveWire, stopAutoplay]);

  useEffect(() => {
    if (autoplayActive) {
      resetDemo();
      stepRef.current = 0;
      timerRef.current = setTimeout(runStep, 1000);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [autoplayActive, runStep, resetDemo]);

  return { caption: captionRef.current };
}
