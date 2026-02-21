import { useState, useCallback, useRef, useEffect } from 'react';
import { ScenarioEngine } from '../scenario-engine';
import { Ledger } from '../ledger';
import type { DemoSettings, DemoState, IntentEnvelope, ActionCategory } from '../contracts';
import type { PainPoint } from '../components/IntentSelector';

const DEFAULT_SETTINGS: DemoSettings = {
  persona: 'founder',
  stress: 'calm',
  autonomy: 'execute_with_approval',
  budgetCap: '5.00',
};

export function useSandboxSession() {
  const engineRef = useRef<ScenarioEngine | null>(null);
  const ledgerRef = useRef<Ledger>(new Ledger());
  const [state, setState] = useState<DemoState | null>(null);
  const [ledgerValid, setLedgerValid] = useState(true);
  const [loading, setLoading] = useState(false);

  const initSession = useCallback(async (settings?: Partial<DemoSettings>, painPoint?: PainPoint) => {
    const seed = Date.now();
    const sessionId = `session_${seed.toString(36)}`;
    const mergedSettings = { ...DEFAULT_SETTINGS, ...settings };

    const engine = new ScenarioEngine(sessionId, seed, mergedSettings, painPoint);
    engineRef.current = engine;
    ledgerRef.current = new Ledger();

    await ledgerRef.current.append(sessionId, 'session_init', {
      seed,
      settings: mergedSettings,
      painPoint,
    });

    setState(engine.getState());
  }, []);

  const act = useCallback(async (intent: Omit<IntentEnvelope, 'sessionId' | 'timestamp'>) => {
    const engine = engineRef.current;
    if (!engine || !state) return;

    setLoading(true);
    const fullIntent: IntentEnvelope = {
      ...intent,
      sessionId: state.sessionId,
      timestamp: new Date().toISOString(),
    };

    await ledgerRef.current.append(state.sessionId, `action_${intent.action}`, fullIntent as unknown as Record<string, unknown>);

    const newState = await engine.processAction(fullIntent);

    const verification = await ledgerRef.current.verify();
    setLedgerValid(verification.valid);
    if (!verification.valid) {
      engine.freeze();
    }

    setState({ ...newState });
    setLoading(false);
  }, [state]);

  const drillDown = useCallback((category: ActionCategory) => {
    act({ action: 'drill_down', category });
  }, [act]);

  const approve = useCallback((packetId: string, optionId?: string) => {
    act({ action: 'approve', packetId, optionId });
  }, [act]);

  const deny = useCallback((packetId: string) => {
    act({ action: 'deny', packetId });
  }, [act]);

  const updateSettings = useCallback((settings: Partial<DemoSettings>) => {
    act({ action: 'change_settings', payload: settings });
  }, [act]);

  const goBack = useCallback(() => {
    if (engineRef.current && state) {
      const newState = engineRef.current.getState();
      newState.activeCategory = null;
      setState({ ...newState });
    }
  }, [state]);

  // Auto-init on mount
  useEffect(() => {
    if (!state) {
      initSession();
    }
  }, [state, initSession]);

  return {
    state,
    loading,
    ledgerValid,
    ledgerEvents: ledgerRef.current.getEvents(),
    initSession,
    drillDown,
    approve,
    deny,
    updateSettings,
    goBack,
  };
}
