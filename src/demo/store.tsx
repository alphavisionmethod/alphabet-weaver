import { createContext, useContext, useState, useCallback, useMemo, useEffect, type ReactNode } from 'react';
import type { ViewMode, WorkflowId, WorkflowState, WorkflowStep, Receipt, DemoSettings, AvatarSkinState, PolicyGate, ToolCall, IntelTabId } from './types';
import { FROZEN_TIMESTAMP, generateReceiptId, generateCorrelationId } from './data';

export interface ActivityLogEntry {
  type: 'policy' | 'tool' | 'receipt' | 'system';
  message: string;
  timestamp: string;
}

interface DemoState {
  viewMode: ViewMode;
  resolvedMode: Exclude<ViewMode, 'auto'>;
  hasChosenMode: boolean;
  activeWorkflow: WorkflowId | null;
  workflows: Record<WorkflowId, WorkflowState>;
  receipts: Receipt[];
  avatarState: AvatarSkinState;
  settings: DemoSettings;
  autoplayActive: boolean;
  activityLog: ActivityLogEntry[];
  narration: string;
  attackVisible: boolean;
  showCompletion: boolean;
  intelTab: IntelTabId;

  chooseMode: (mode: ViewMode) => void;
  setActiveWorkflow: (id: WorkflowId | null) => void;
  advanceWorkflow: (id: WorkflowId) => void;
  approveWire: () => void;
  setAvatarState: (s: AvatarSkinState) => void;
  updateSettings: (s: Partial<DemoSettings>) => void;
  setNarration: (text: string) => void;
  setIntelTab: (tab: IntelTabId) => void;
  dismissAttack: () => void;
  dismissCompletion: () => void;
  startAutoplay: () => void;
  stopAutoplay: () => void;
  resetDemo: () => void;
}

const DemoContext = createContext<DemoState | null>(null);

function resolveAutoMode(): Exclude<ViewMode, 'auto'> {
  if (typeof window === 'undefined') return 'desktop';
  const w = window.innerWidth;
  if (w < 768) return 'mobile';
  return 'desktop';
}

const INITIAL_WORKFLOWS: Record<WorkflowId, WorkflowState> = {
  'revenue-leak': { id: 'revenue-leak', step: 'idle', data: {}, policyGates: [], toolCalls: [], receipts: [] },
  'wire-transfer': { id: 'wire-transfer', step: 'idle', data: {}, policyGates: [], toolCalls: [], receipts: [] },
  'board-briefing': { id: 'board-briefing', step: 'idle', data: {}, policyGates: [], toolCalls: [], receipts: [] },
};

const STEP_ORDER: WorkflowStep[] = ['idle', 'scanning', 'findings', 'approval', 'approved', 'receipt'];

function nextStep(current: WorkflowStep, workflow: WorkflowId): WorkflowStep {
  const idx = STEP_ORDER.indexOf(current);
  if (idx >= STEP_ORDER.length - 1) return current;
  const next = STEP_ORDER[idx + 1];
  if (next === 'approval' && workflow !== 'wire-transfer') return 'approved';
  if (next === 'approved' && workflow !== 'wire-transfer') return 'receipt';
  return next;
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem('sita-demo-view');
    return (saved as ViewMode) || 'auto';
  });
  const [hasChosenMode, setHasChosenMode] = useState(() => !!localStorage.getItem('sita-demo-view'));
  const [activeWorkflow, setActiveWorkflow] = useState<WorkflowId | null>(null);
  const [workflows, setWorkflows] = useState<Record<WorkflowId, WorkflowState>>(INITIAL_WORKFLOWS);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [avatarState, setAvatarState] = useState<AvatarSkinState>('IDLE');
  const [autoplayActive, setAutoplayActive] = useState(false);
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([]);
  const [narration, setNarration] = useState('');
  const [attackVisible, setAttackVisible] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [intelTab, setIntelTab] = useState<IntelTabId>('meta');
  const [settings, setSettings] = useState<DemoSettings>({
    seed: 42,
    frozenTime: true,
    debugOverlay: false,
    connectorMode: 'SIM',
    shadowMode: false,
  });

  const resolvedMode = useMemo<Exclude<ViewMode, 'auto'>>(() => {
    if (viewMode === 'auto') return resolveAutoMode();
    return viewMode;
  }, [viewMode]);

  const addLog = useCallback((entry: Omit<ActivityLogEntry, 'timestamp'>) => {
    const ts = settings.frozenTime ? FROZEN_TIMESTAMP : new Date().toISOString();
    setActivityLog(prev => [...prev.slice(-49), { ...entry, timestamp: ts }]);
  }, [settings.frozenTime]);

  const chooseMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
    setHasChosenMode(true);
    localStorage.setItem('sita-demo-view', mode);
  }, []);

  const advanceWorkflow = useCallback((id: WorkflowId) => {
    setWorkflows(prev => {
      const wf = prev[id];
      const step = nextStep(wf.step, id);
      const ts = settings.frozenTime ? FROZEN_TIMESTAMP : new Date().toISOString();

      const gates: PolicyGate[] = [...wf.policyGates];
      const tools: ToolCall[] = [...wf.toolCalls];
      const wfReceipts: Receipt[] = [...wf.receipts];

      if (step === 'scanning') {
        gates.push({ verdict: 'PASS', rule: `${id}.read_access`, timestamp: ts });
        tools.push({ id: `tc_${Date.now()}`, tool: `${id}.scan`, args: { scope: 'full' }, result: 'initiated', timestamp: ts });
        setAvatarState('THINKING');
        setNarration(id === 'revenue-leak' ? 'Scanning 847 vendor records for anomalies…' : id === 'wire-transfer' ? 'Drafting wire transfer, verifying AML compliance…' : 'Querying 12 advisory board members…');
        addLog({ type: 'policy', message: `Policy gate PASS: ${id}.read_access` });
        addLog({ type: 'tool', message: `Tool call: ${id}.scan initiated` });
      } else if (step === 'findings') {
        tools.push({ id: `tc_${Date.now()}`, tool: `${id}.analyze`, args: {}, result: 'findings_ready', timestamp: ts });
        setAvatarState('CONFIRMING');
        setNarration(id === 'revenue-leak' ? '5 anomalies found — $27,688 recoverable.' : id === 'wire-transfer' ? 'Risk score: 32%. Proceeding to dual-signature approval.' : 'Aggregating stances from 12 advisors…');
        addLog({ type: 'tool', message: `Tool call: ${id}.analyze → findings_ready` });
      } else if (step === 'approval') {
        gates.push({ verdict: 'ESCALATE', rule: 'wire_transfer.amount_threshold', timestamp: ts });
        setAvatarState('WARNING');
        setAttackVisible(true);
        addLog({ type: 'policy', message: `Policy gate ESCALATE: wire_transfer.amount_threshold` });
      } else if (step === 'approved') {
        gates.push({ verdict: 'PASS', rule: `${id}.execute`, timestamp: ts });
        setAvatarState('CONFIRMING');
        addLog({ type: 'policy', message: `Policy gate PASS: ${id}.execute` });
        if (id !== 'wire-transfer') {
          setTimeout(() => advanceWorkflow(id), 600);
        }
      } else if (step === 'receipt') {
        const receipt: Receipt = {
          receiptId: generateReceiptId(settings.seed, receipts.length + wfReceipts.length),
          correlationId: generateCorrelationId(id, settings.seed),
          capabilityId: `cap_${id}`,
          mode: settings.connectorMode,
          costCents: id === 'revenue-leak' ? 8 : id === 'wire-transfer' ? 3 : 22,
          timestamp: ts,
          workflow: id,
          summary: id === 'revenue-leak' ? '5 findings detected, $27,688 recoverable' : id === 'wire-transfer' ? 'Wire $24,500 to Meridian Partners approved' : 'Board briefing compiled from 12 advisors',
        };
        wfReceipts.push(receipt);
        setReceipts(r => [...r, receipt]);
        setAvatarState('IDLE');
        setNarration(`Receipt minted: ${receipt.receiptId.slice(0, 18)}… Cost: $${(receipt.costCents / 100).toFixed(2)}`);
        addLog({ type: 'receipt', message: `Receipt minted: ${receipt.receiptId.slice(0, 16)}…` });
      }

      return { ...prev, [id]: { ...wf, step, policyGates: gates, toolCalls: tools, receipts: wfReceipts } };
    });
  }, [settings, receipts.length, addLog]);

  const approveWire = useCallback(() => {
    setWorkflows(prev => {
      const wf = prev['wire-transfer'];
      if (wf.step !== 'approval') return prev;
      const ts = settings.frozenTime ? FROZEN_TIMESTAMP : new Date().toISOString();
      return {
        ...prev,
        'wire-transfer': {
          ...wf,
          step: 'approved',
          policyGates: [...wf.policyGates, { verdict: 'PASS', rule: 'wire_transfer.dual_signature', timestamp: ts }],
        },
      };
    });
    setAvatarState('CONFIRMING');
    addLog({ type: 'policy', message: 'Policy gate PASS: wire_transfer.dual_signature' });
    setTimeout(() => {
      advanceWorkflow('wire-transfer');
    }, 800);
  }, [settings, advanceWorkflow, addLog]);

  const updateSettings = useCallback((partial: Partial<DemoSettings>) => {
    setSettings(s => ({ ...s, ...partial }));
  }, []);

  const resetDemo = useCallback(() => {
    setWorkflows(INITIAL_WORKFLOWS);
    setReceipts([]);
    setActiveWorkflow(null);
    setAvatarState('IDLE');
    setActivityLog([]);
    setNarration('');
    setAttackVisible(false);
    setShowCompletion(false);
  }, []);

  useEffect(() => {
    if (avatarState !== 'IDLE' && avatarState !== 'WARNING') {
      const t = setTimeout(() => setAvatarState('IDLE'), 2500);
      return () => clearTimeout(t);
    }
  }, [avatarState]);

  // Detect all workflows complete
  useEffect(() => {
    const allDone = (['revenue-leak', 'wire-transfer', 'board-briefing'] as WorkflowId[]).every(id => workflows[id].step === 'receipt');
    if (allDone && receipts.length >= 3 && !showCompletion) {
      setTimeout(() => setShowCompletion(true), 1500);
    }
  }, [workflows, receipts.length, showCompletion]);

  const value = useMemo<DemoState>(() => ({
    viewMode, resolvedMode, hasChosenMode, activeWorkflow, workflows, receipts,
    avatarState, settings, autoplayActive, activityLog, narration, attackVisible, showCompletion,
    intelTab,
    chooseMode, setActiveWorkflow, advanceWorkflow, approveWire,
    setAvatarState, updateSettings, resetDemo, setNarration, setIntelTab,
    dismissAttack: () => setAttackVisible(false),
    dismissCompletion: () => setShowCompletion(false),
    startAutoplay: () => setAutoplayActive(true),
    stopAutoplay: () => setAutoplayActive(false),
  }), [viewMode, resolvedMode, hasChosenMode, activeWorkflow, workflows, receipts,
    avatarState, settings, autoplayActive, activityLog, narration, attackVisible, showCompletion,
    intelTab, chooseMode, advanceWorkflow, approveWire, updateSettings, resetDemo]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error('useDemo must be used within DemoProvider');
  return ctx;
}
