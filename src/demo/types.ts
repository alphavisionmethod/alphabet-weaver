export type ViewMode = 'auto' | 'desktop' | 'mobile' | 'glasses' | 'hologram';
export type AvatarSkinState = 'IDLE' | 'LISTENING' | 'THINKING' | 'CONFIRMING' | 'WARNING' | 'REFUSAL';
export type WorkflowId = 'revenue-leak' | 'wire-transfer' | 'board-briefing';
export type WorkflowStep = 'idle' | 'scanning' | 'findings' | 'approval' | 'approved' | 'receipt';
export type PolicyVerdict = 'PASS' | 'DENY' | 'ESCALATE';
export type ConnectorMode = 'SIM' | 'SHADOW' | 'REAL';

export interface Receipt {
  receiptId: string;
  correlationId: string;
  capabilityId: string;
  mode: ConnectorMode;
  costCents: number;
  timestamp: string;
  workflow: WorkflowId;
  summary: string;
}

export interface PolicyGate {
  verdict: PolicyVerdict;
  rule: string;
  timestamp: string;
}

export interface ToolCall {
  id: string;
  tool: string;
  args: Record<string, unknown>;
  result: string;
  timestamp: string;
}

export interface WorkflowState {
  id: WorkflowId;
  step: WorkflowStep;
  data: Record<string, unknown>;
  policyGates: PolicyGate[];
  toolCalls: ToolCall[];
  receipts: Receipt[];
}

export interface Finding {
  id: string;
  type: string;
  title: string;
  amount: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  vendor: string;
  description: string;
}

export interface Advisor {
  id: string;
  name: string;
  role: string;
  stance: 'approve' | 'caution' | 'reject';
  confidence: number;
  riskFlags: string[];
  recommendation: string;
}

export interface WireTransferData {
  amount: number;
  currency: string;
  recipient: string;
  swiftCode: string;
  riskScore: number;
  amlFlag: boolean;
  bank: string;
  reference: string;
}

export type IntelTabId = 'ledger' | 'meta' | 'regime' | 'decay' | 'drift' | 'experiments';

export interface DemoSettings {
  seed: number;
  frozenTime: boolean;
  debugOverlay: boolean;
  connectorMode: ConnectorMode;
  shadowMode: boolean;
}
