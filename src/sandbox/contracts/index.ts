import { z } from 'zod';

// ── Enums ──
export const PersonaSchema = z.enum(['founder', 'professional', 'family_office', 'neurodivergent', 'consumer']);
export type Persona = z.infer<typeof PersonaSchema>;

export const StressLevelSchema = z.enum(['calm', 'overwhelmed']);
export type StressLevel = z.infer<typeof StressLevelSchema>;

export const AutonomyScopeSchema = z.enum(['observe', 'recommend', 'execute_with_approval', 'delegated']);
export type AutonomyScope = z.infer<typeof AutonomyScopeSchema>;

export const BudgetCapSchema = z.enum(['0.10', '1.00', '5.00']);
export type BudgetCap = z.infer<typeof BudgetCapSchema>;

export const RiskTierSchema = z.enum(['low', 'medium', 'high', 'critical']);
export type RiskTier = z.infer<typeof RiskTierSchema>;

export const ActionCategorySchema = z.enum(['travel', 'gifts', 'leads', 'insurance', 'investing']);
export type ActionCategory = z.infer<typeof ActionCategorySchema>;

export const UserActionTypeSchema = z.enum(['drill_down', 'approve', 'deny', 'edit', 'select_option', 'change_settings']);
export type UserActionType = z.infer<typeof UserActionTypeSchema>;

// ── Core Data Types ──

export const PlanStepSchema = z.object({
  id: z.string(),
  description: z.string(),
  category: ActionCategorySchema,
  riskTier: RiskTierSchema,
  estimatedCost: z.number(),
  reversible: z.boolean(),
});
export type PlanStep = z.infer<typeof PlanStepSchema>;

export const PolicyCheckSchema = z.object({
  stepId: z.string(),
  allowed: z.boolean(),
  requiresApproval: z.boolean(),
  reason: z.string(),
  budgetRemaining: z.number(),
  autonomyLevel: AutonomyScopeSchema,
});
export type PolicyCheck = z.infer<typeof PolicyCheckSchema>;

export const ApprovalRequestSchema = z.object({
  id: z.string(),
  stepId: z.string(),
  category: ActionCategorySchema,
  description: z.string(),
  estimatedCost: z.number(),
  riskTier: RiskTierSchema,
  options: z.array(z.object({
    id: z.string(),
    label: z.string(),
    description: z.string(),
    cost: z.number().optional(),
  })).optional(),
});
export type ApprovalRequest = z.infer<typeof ApprovalRequestSchema>;

export const ExecutionResultSchema = z.object({
  stepId: z.string(),
  success: z.boolean(),
  summary: z.string(),
  details: z.record(z.unknown()),
  simulatedAt: z.string(),
});
export type ExecutionResult = z.infer<typeof ExecutionResultSchema>;

export const ReceiptSchema = z.object({
  id: z.string(),
  chainIndex: z.number(),
  timestamp: z.string(),
  category: ActionCategorySchema,
  actionType: z.string(),
  summary: z.string(),
  details: z.record(z.unknown()),
  hash: z.string(),
  previousHash: z.string(),
  verified: z.boolean(),
});
export type Receipt = z.infer<typeof ReceiptSchema>;

export const DecisionPacketSchema = z.object({
  id: z.string(),
  category: ActionCategorySchema,
  title: z.string(),
  summary: z.string(),
  planSteps: z.array(PlanStepSchema),
  policyChecks: z.array(PolicyCheckSchema),
  approvalRequests: z.array(ApprovalRequestSchema),
  executionResults: z.array(ExecutionResultSchema),
  receipts: z.array(ReceiptSchema),
  voiceLines: z.array(z.string()),
  data: z.record(z.unknown()).optional(),
  status: z.enum(['pending', 'awaiting_approval', 'approved', 'denied', 'executed']),
});
export type DecisionPacket = z.infer<typeof DecisionPacketSchema>;

export const IntentEnvelopeSchema = z.object({
  sessionId: z.string(),
  timestamp: z.string(),
  action: UserActionTypeSchema,
  category: ActionCategorySchema.optional(),
  packetId: z.string().optional(),
  optionId: z.string().optional(),
  payload: z.record(z.unknown()).optional(),
});
export type IntentEnvelope = z.infer<typeof IntentEnvelopeSchema>;

export const AuditEventSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  timestamp: z.string(),
  type: z.string(),
  data: z.record(z.unknown()),
  hash: z.string(),
  previousHash: z.string(),
  chainIndex: z.number(),
});
export type AuditEvent = z.infer<typeof AuditEventSchema>;

// ── Demo State ──

export const DemoSettingsSchema = z.object({
  persona: PersonaSchema,
  stress: StressLevelSchema,
  autonomy: AutonomyScopeSchema,
  budgetCap: BudgetCapSchema,
});
export type DemoSettings = z.infer<typeof DemoSettingsSchema>;

export const DemoStateSchema = z.object({
  sessionId: z.string(),
  seed: z.number(),
  settings: DemoSettingsSchema,
  currentPhase: z.string(),
  packets: z.array(DecisionPacketSchema),
  receipts: z.array(ReceiptSchema),
  budgetSpent: z.number(),
  activeCategory: ActionCategorySchema.nullable(),
  frozen: z.boolean(),
});
export type DemoState = z.infer<typeof DemoStateSchema>;

export const CapabilityManifestSchema = z.object({
  travel: z.object({ enabled: z.boolean(), maxBudget: z.number() }),
  gifts: z.object({ enabled: z.boolean(), maxBudget: z.number() }),
  leads: z.object({ enabled: z.boolean(), maxRecoveries: z.number() }),
  insurance: z.object({ enabled: z.boolean(), maxQuotes: z.number() }),
  investing: z.object({ enabled: z.boolean(), disclaimer: z.string() }),
});
export type CapabilityManifest = z.infer<typeof CapabilityManifestSchema>;
