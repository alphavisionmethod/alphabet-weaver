import { z } from 'zod';

// ── Attack Types ──
export const AttackTypeSchema = z.enum([
  'prompt_injection', 'replay', 'tamper', 'sanctions',
  'budget_exceeded', 'connector_down', 'insider',
]);
export type AttackType = z.infer<typeof AttackTypeSchema>;

export const AttackAttemptSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  attackType: AttackTypeSchema,
  payload: z.string(),
  verdict: z.enum(['REFUSED', 'FAILED', 'BLOCKED']),
  reason: z.string(),
  receiptId: z.string(),
  ledgerBlockIndex: z.number(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  latencyMs: z.number(),
});
export type AttackAttempt = z.infer<typeof AttackAttemptSchema>;

// ── Pipeline Stages ──
export const PipelineStageSchema = z.enum([
  'intent', 'policy_gate', 'ticket', 'preflight', 'execution', 'receipt', 'ledger_block',
]);
export type PipelineStage = z.infer<typeof PipelineStageSchema>;

export const PipelineStageResultSchema = z.object({
  stage: PipelineStageSchema,
  status: z.enum(['PASS', 'FAIL', 'PENDING', 'SKIPPED']),
  schemaValid: z.boolean(),
  riskTier: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  verdict: z.string(),
  idempotencyHit: z.boolean(),
  compliancePass: z.boolean(),
  signatureValid: z.boolean(),
  latencyMs: z.number(),
  details: z.record(z.unknown()).optional(),
});
export type PipelineStageResult = z.infer<typeof PipelineStageResultSchema>;

export const PipelineRunSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  category: z.string(),
  stages: z.array(PipelineStageResultSchema),
  finalStatus: z.enum(['EXECUTED', 'REFUSED', 'FAILED']),
  receiptHash: z.string(),
  totalLatencyMs: z.number(),
});
export type PipelineRun = z.infer<typeof PipelineRunSchema>;

// ── Advisors ──
export const AdvisorIdSchema = z.enum(['cfo', 'risk', 'compliance', 'growth', 'concierge', 'red_team']);
export type AdvisorId = z.infer<typeof AdvisorIdSchema>;

export const AdvisorProposalSchema = z.object({
  advisorId: AdvisorIdSchema,
  recommendation: z.enum(['APPROVE', 'CAUTION', 'REJECT']),
  riskTier: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  confidence: z.number(),
  costEstimateUsd: z.number(),
  rationaleBullets: z.array(z.string()),
  voteWeight: z.number(),
});
export type AdvisorProposal = z.infer<typeof AdvisorProposalSchema>;

export const ConsensusReportSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  proposals: z.array(AdvisorProposalSchema),
  winnerAdvisorId: AdvisorIdSchema,
  disagreementScore: z.number(),
  requiredApproval: z.enum(['NONE', 'USER', 'MULTI_SIG']),
  finalPlanSteps: z.array(z.string()),
  receiptHash: z.string(),
});
export type ConsensusReport = z.infer<typeof ConsensusReportSchema>;

// ── LLM Gateway ──
export const LLMProviderSchema = z.enum(['local', 'openai', 'anthropic']);
export type LLMProvider = z.infer<typeof LLMProviderSchema>;

export const LLMCallReportSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  provider: LLMProviderSchema,
  model: z.string(),
  tokensIn: z.number(),
  tokensOut: z.number(),
  costUsd: z.number(),
  latencyMs: z.number(),
  cached: z.boolean(),
  fallbackUsed: z.boolean(),
  riskTier: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  purpose: z.string(),
});
export type LLMCallReport = z.infer<typeof LLMCallReportSchema>;

// ── Panic Mode ──
export const PanicEventSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  trigger: z.string(),
  severity: z.enum(['HIGH', 'CRITICAL']),
  action: z.enum(['LOCKDOWN', 'CRYPTO_SHRED', 'TOMBSTONE']),
  receiptHash: z.string(),
  details: z.string(),
});
export type PanicEvent = z.infer<typeof PanicEventSchema>;

// ── Ledger Block (extended for investor) ──
export const InvestorLedgerBlockSchema = z.object({
  blockNumber: z.number(),
  blockHash: z.string(),
  previousHash: z.string(),
  receiptHash: z.string(),
  merkleRoot: z.string(),
  createdAt: z.string(),
  signature: z.string(),
  eventType: z.string(),
});
export type InvestorLedgerBlock = z.infer<typeof InvestorLedgerBlockSchema>;
