export type ExecutionMode = 'SIM' | 'SHADOW' | 'SUPERVISED';

export type RiskTier = 'LOW' | 'MED' | 'HIGH' | 'CRITICAL';

export type ProposalStatus = 'pending' | 'approved' | 'rejected';

export interface ProposalStep {
  id: string;
  description: string;
  status: 'planned' | 'completed' | 'failed';
}

export interface SourceRef {
  id: string;
  label: string;
  type: 'calendar' | 'email' | 'crm' | 'finance' | 'memory' | 'policy';
}

export interface Proposal {
  id: string;
  title: string;
  summary: string;
  workflow: string;
  riskTier: RiskTier;
  costCents: number;
  executionMode: ExecutionMode;
  requiresApproval: boolean;
  steps: ProposalStep[];
  intendedTools: string[];
  sourcesUsed: SourceRef[];
  status: ProposalStatus;
  createdAt: string;
}

export interface ReceiptRef {
  id: string;
  type: string;
  correlationId: string;
  createdAt: string;
}

export interface TraceEvent {
  ts: string;
  type: 'policy_check' | 'tool_call' | 'receipt' | 'refusal' | 'approval';
  message: string;
  data?: Record<string, unknown>;
}

export interface ShadowDiff {
  severity: RiskTier;
  summary: string;
}

export interface ReviewItem {
  proposal: Proposal;
  receipts: ReceiptRef[];
  trace: TraceEvent[];
  shadowDiff?: ShadowDiff;
}
