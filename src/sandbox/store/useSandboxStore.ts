import { useState, useCallback } from 'react';
import type { SimResult } from '../lib/simulationEngine';

export interface SandboxSession {
  sessionId: string;
  name: string;
  autonomyLevel: number;
  completedGuided: boolean;
  guidedStep: number;
  wowMomentTriggered: boolean;
  emailCaptured: boolean;
  createdAt: string;
  actionCount: number;
}

const STORAGE_KEY = 'sita_sandbox';
const RECEIPTS_KEY = 'sita_sandbox_receipts';

function generateId(): string {
  return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function loadSession(): SandboxSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function saveSession(session: SandboxSession) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {}
}

function loadReceipts(): SimResult[] {
  try {
    const raw = localStorage.getItem(RECEIPTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveReceipts(receipts: SimResult[]) {
  try {
    localStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
  } catch {}
}

export function useSandboxStore() {
  const [session, setSession] = useState<SandboxSession | null>(() => loadSession());
  const [receipts, setReceipts] = useState<SimResult[]>(() => loadReceipts());

  const createSession = useCallback((name: string) => {
    const newSession: SandboxSession = {
      sessionId: generateId(),
      name: name.trim() || 'Friend',
      autonomyLevel: 1,
      completedGuided: false,
      guidedStep: 0,
      wowMomentTriggered: false,
      emailCaptured: false,
      createdAt: new Date().toISOString(),
      actionCount: 0,
    };
    setSession(newSession);
    saveSession(newSession);
    setReceipts([]);
    saveReceipts([]);
    return newSession;
  }, []);

  const updateSession = useCallback((updates: Partial<SandboxSession>) => {
    setSession(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      saveSession(updated);
      return updated;
    });
  }, []);

  const advanceGuided = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev;
      const updated = { ...prev, guidedStep: prev.guidedStep + 1 };
      saveSession(updated);
      return updated;
    });
  }, []);

  const completeGuided = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev;
      const updated = { ...prev, completedGuided: true, autonomyLevel: 2 };
      saveSession(updated);
      return updated;
    });
  }, []);

  const triggerWow = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev;
      const updated = { ...prev, wowMomentTriggered: true };
      saveSession(updated);
      return updated;
    });
  }, []);

  const addReceipt = useCallback((receipt: SimResult) => {
    setReceipts(prev => {
      const updated = [...prev, receipt];
      saveReceipts(updated);
      return updated;
    });
  }, []);

  const setAllReceipts = useCallback((newReceipts: SimResult[]) => {
    setReceipts(newReceipts);
    saveReceipts(newReceipts);
  }, []);

  const incrementActions = useCallback(() => {
    setSession(prev => {
      if (!prev) return prev;
      const newCount = prev.actionCount + 1;
      const newLevel = Math.min(5, 2 + Math.floor(newCount / 3) * 0.4);
      const updated = { ...prev, actionCount: newCount, autonomyLevel: parseFloat(newLevel.toFixed(1)) };
      saveSession(updated);
      return updated;
    });
  }, []);

  const resetSession = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(RECEIPTS_KEY);
    setSession(null);
    setReceipts([]);
  }, []);

  return {
    session,
    receipts,
    hasSession: !!session,
    createSession,
    updateSession,
    advanceGuided,
    completeGuided,
    triggerWow,
    addReceipt,
    setAllReceipts,
    incrementActions,
    resetSession,
  };
}
