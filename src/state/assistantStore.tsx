import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { ExecutionMode, ReviewItem, Proposal, ProposalStatus } from '@/types/assistant';

interface AssistantState {
  isOpen: boolean;
  activeTab: 'review' | 'propose' | 'explain';
  executionMode: ExecutionMode;
  reviewQueue: ReviewItem[];
  selectedItemId: string | null;
  badgeCount: number;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  setActiveTab: (tab: 'review' | 'propose' | 'explain') => void;
  setMode: (mode: ExecutionMode) => void;
  addToQueue: (item: ReviewItem) => void;
  approveProposal: (id: string) => void;
  rejectProposal: (id: string) => void;
  selectItem: (id: string | null) => void;
}

const AssistantContext = createContext<AssistantState | null>(null);

export function AssistantProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'review' | 'propose' | 'explain'>('review');
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('SIM');
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>(DEMO_ITEMS);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const toggle = useCallback(() => setIsOpen(o => !o), []);
  const setOpen = useCallback((open: boolean) => setIsOpen(open), []);

  const addToQueue = useCallback((item: ReviewItem) => {
    setReviewQueue(q => [item, ...q]);
  }, []);

  const updateStatus = useCallback((id: string, status: ProposalStatus) => {
    setReviewQueue(q =>
      q.map(item =>
        item.proposal.id === id
          ? { ...item, proposal: { ...item.proposal, status } }
          : item
      )
    );
  }, []);

  const approveProposal = useCallback((id: string) => updateStatus(id, 'approved'), [updateStatus]);
  const rejectProposal = useCallback((id: string) => updateStatus(id, 'rejected'), [updateStatus]);

  const selectItem = useCallback((id: string | null) => {
    setSelectedItemId(id);
    if (id) setActiveTab('explain');
  }, []);

  const badgeCount = useMemo(
    () => reviewQueue.filter(i => i.proposal.status === 'pending' && i.proposal.requiresApproval).length,
    [reviewQueue]
  );

  const value = useMemo<AssistantState>(() => ({
    isOpen, activeTab, executionMode, reviewQueue, selectedItemId, badgeCount,
    setOpen, toggle, setActiveTab, setMode: setExecutionMode,
    addToQueue, approveProposal, rejectProposal, selectItem,
  }), [isOpen, activeTab, executionMode, reviewQueue, selectedItemId, badgeCount,
    setOpen, toggle, addToQueue, approveProposal, rejectProposal, selectItem]);

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}

export function useAssistant() {
  const ctx = useContext(AssistantContext);
  if (!ctx) throw new Error('useAssistant must be used within AssistantProvider');
  return ctx;
}

// ── Demo Data ──

const DEMO_ITEMS: ReviewItem[] = [
  {
    proposal: {
      id: 'prop_revenue_scan',
      title: 'Revenue Leak Scan',
      summary: 'Scan CRM for 90-day dormant leads with >$5k lifetime value. Re-engage via policy-approved templates.',
      workflow: 'finance',
      riskTier: 'LOW',
      costCents: 8,
      executionMode: 'SIM',
      requiresApproval: false,
      status: 'pending',
      steps: [
        { id: 's1', description: 'Query CRM for dormant leads', status: 'completed' },
        { id: 's2', description: 'Filter by LTV threshold', status: 'completed' },
        { id: 's3', description: 'Draft re-engagement sequence', status: 'planned' },
      ],
      intendedTools: ['crm.query', 'email.draft'],
      sourcesUsed: [
        { id: 'src_crm', label: 'CRM contacts', type: 'crm' },
        { id: 'src_email', label: 'Email history', type: 'email' },
      ],
      createdAt: new Date(Date.now() - 1200000).toISOString(),
    },
    receipts: [
      { id: 'rcpt_001', type: 'query_result', correlationId: 'prop_revenue_scan', createdAt: new Date(Date.now() - 1100000).toISOString() },
    ],
    trace: [
      { ts: new Date(Date.now() - 1200000).toISOString(), type: 'policy_check', message: 'Policy: CRM read access — allowed' },
      { ts: new Date(Date.now() - 1150000).toISOString(), type: 'tool_call', message: 'crm.query(dormant > 90d, ltv > 5000)' },
      { ts: new Date(Date.now() - 1100000).toISOString(), type: 'receipt', message: 'Receipt generated: rcpt_001' },
    ],
  },
  {
    proposal: {
      id: 'prop_wire_transfer',
      title: 'Wire Transfer Draft',
      summary: 'Prepare wire transfer to vendor Acme Corp for $24,500. Requires dual-signature approval.',
      workflow: 'finance',
      riskTier: 'HIGH',
      costCents: 3,
      executionMode: 'SIM',
      requiresApproval: true,
      status: 'pending',
      steps: [
        { id: 's1', description: 'Verify vendor details', status: 'completed' },
        { id: 's2', description: 'Draft transfer instruction', status: 'completed' },
        { id: 's3', description: 'Submit for dual-signature', status: 'planned' },
      ],
      intendedTools: ['finance.verify_vendor', 'finance.draft_wire'],
      sourcesUsed: [
        { id: 'src_fin', label: 'Finance ledger', type: 'finance' },
        { id: 'src_pol', label: 'Wire transfer policy', type: 'policy' },
      ],
      createdAt: new Date(Date.now() - 600000).toISOString(),
    },
    receipts: [
      { id: 'rcpt_002', type: 'vendor_check', correlationId: 'prop_wire_transfer', createdAt: new Date(Date.now() - 550000).toISOString() },
    ],
    trace: [
      { ts: new Date(Date.now() - 600000).toISOString(), type: 'policy_check', message: 'Policy: Wire > $10k — requires dual-signature approval' },
      { ts: new Date(Date.now() - 580000).toISOString(), type: 'tool_call', message: 'finance.verify_vendor("Acme Corp")' },
      { ts: new Date(Date.now() - 550000).toISOString(), type: 'receipt', message: 'Receipt generated: rcpt_002' },
      { ts: new Date(Date.now() - 540000).toISOString(), type: 'approval', message: 'Awaiting dual-signature approval' },
    ],
  },
  {
    proposal: {
      id: 'prop_board_briefing',
      title: 'Board Briefing',
      summary: 'Compile weekly board briefing from finance, ops, and compliance sources. Shadow-mode comparison available.',
      workflow: 'operations',
      riskTier: 'MED',
      costCents: 22,
      executionMode: 'SHADOW',
      requiresApproval: true,
      status: 'pending',
      steps: [
        { id: 's1', description: 'Aggregate KPI data', status: 'completed' },
        { id: 's2', description: 'Generate narrative summary', status: 'completed' },
        { id: 's3', description: 'Shadow-compare with last week', status: 'completed' },
        { id: 's4', description: 'Format for distribution', status: 'planned' },
      ],
      intendedTools: ['analytics.kpi', 'ai.summarize', 'shadow.diff'],
      sourcesUsed: [
        { id: 'src_analytics', label: 'Analytics pipeline', type: 'finance' },
        { id: 'src_mem', label: 'Prior briefings', type: 'memory' },
      ],
      createdAt: new Date(Date.now() - 300000).toISOString(),
    },
    receipts: [
      { id: 'rcpt_003', type: 'kpi_snapshot', correlationId: 'prop_board_briefing', createdAt: new Date(Date.now() - 280000).toISOString() },
      { id: 'rcpt_004', type: 'summary_draft', correlationId: 'prop_board_briefing', createdAt: new Date(Date.now() - 260000).toISOString() },
    ],
    trace: [
      { ts: new Date(Date.now() - 300000).toISOString(), type: 'policy_check', message: 'Policy: Board data — read access allowed, distribution requires approval' },
      { ts: new Date(Date.now() - 290000).toISOString(), type: 'tool_call', message: 'analytics.kpi(weekly)' },
      { ts: new Date(Date.now() - 280000).toISOString(), type: 'receipt', message: 'Receipt generated: rcpt_003' },
      { ts: new Date(Date.now() - 270000).toISOString(), type: 'tool_call', message: 'ai.summarize(kpi_data)' },
      { ts: new Date(Date.now() - 260000).toISOString(), type: 'receipt', message: 'Receipt generated: rcpt_004' },
    ],
    shadowDiff: {
      severity: 'LOW',
      summary: 'Revenue up 3.2% vs last week. No anomalies detected. Compliance metrics stable.',
    },
  },
];
