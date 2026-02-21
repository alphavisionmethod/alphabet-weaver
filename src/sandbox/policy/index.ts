import type { AutonomyScope, DemoSettings, PlanStep, PolicyCheck, RiskTier } from '../contracts';

const RISK_WEIGHTS: Record<RiskTier, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

function requiresApproval(
  riskTier: RiskTier,
  autonomy: AutonomyScope,
  stress: string
): boolean {
  if (autonomy === 'observe') return true;
  if (autonomy === 'recommend') return true;
  if (autonomy === 'execute_with_approval') {
    return RISK_WEIGHTS[riskTier] >= 2;
  }
  // delegated
  if (stress === 'overwhelmed') return RISK_WEIGHTS[riskTier] >= 3;
  return RISK_WEIGHTS[riskTier] >= 4; // only critical needs approval in calm+delegated
}

export function evaluatePolicy(
  step: PlanStep,
  settings: DemoSettings,
  budgetSpent: number
): PolicyCheck {
  const budgetLimit = parseFloat(settings.budgetCap);
  const remaining = Math.max(0, budgetLimit - budgetSpent);
  const withinBudget = step.estimatedCost <= remaining;
  const needsApproval = requiresApproval(step.riskTier, settings.autonomy, settings.stress);
  const allowed = withinBudget;

  return {
    stepId: step.id,
    allowed,
    requiresApproval: allowed && needsApproval,
    reason: !withinBudget
      ? `Exceeds budget cap ($${budgetLimit.toFixed(2)}). Remaining: $${remaining.toFixed(2)}`
      : needsApproval
        ? `${step.riskTier} risk action requires approval under ${settings.autonomy} autonomy`
        : `Auto-approved: ${step.riskTier} risk under ${settings.autonomy} autonomy`,
    budgetRemaining: remaining,
    autonomyLevel: settings.autonomy,
  };
}
