import { useEffect } from 'react';
import { useDemo } from '../store';

export function useKeyboardShortcuts() {
  const { setActiveWorkflow, advanceWorkflow, workflows, resetDemo } = useDemo();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case '1': {
          const wf = workflows['revenue-leak'];
          setActiveWorkflow('revenue-leak');
          if (wf.step === 'idle') advanceWorkflow('revenue-leak');
          break;
        }
        case '2': {
          const wf = workflows['wire-transfer'];
          setActiveWorkflow('wire-transfer');
          if (wf.step === 'idle') advanceWorkflow('wire-transfer');
          break;
        }
        case '3': {
          const wf = workflows['board-briefing'];
          setActiveWorkflow('board-briefing');
          if (wf.step === 'idle') advanceWorkflow('board-briefing');
          break;
        }
        case 'Escape':
          setActiveWorkflow(null);
          break;
        case 'r':
        case 'R':
          if (!e.metaKey && !e.ctrlKey) resetDemo();
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [workflows, setActiveWorkflow, advanceWorkflow, resetDemo]);
}
