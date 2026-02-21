/**
 * Simulated System Intelligence Engine
 * Generates realistic-looking data for the 8-module self-auditing system demo.
 * All data is deterministic based on seed + workflow state.
 */

import type { WorkflowId, WorkflowStep, Receipt } from './types';

// --- Decision Ledger ---
export interface DecisionEvent {
  decision_id: string;
  ts: string;
  context_snapshot_id: string;
  features_version: string;
  model_versions: { task: string; meta: string; regime: string; drift: string };
  candidate_actions: string[];
  chosen_action: string;
  predicted_outcome: { mean: number; p10: number; p50: number; p90: number; calibrated_prob: number };
  uncertainty: { aleatoric: number; epistemic: number };
  risk_checks: { rule: string; result: 'pass' | 'warn' | 'fail' }[];
  autonomy_level: 0 | 1 | 2;
  prev_hash: string;
  row_hash: string;
}

// --- Meta-Reliability ---
export interface ReliabilityState {
  p_reliable: number;
  failure_mode: 'none' | 'calibration' | 'drift' | 'missing_data' | 'ood';
  autonomy_level: 0 | 1 | 2;
  factors: { name: string; value: number; impact: 'positive' | 'negative' | 'neutral' }[];
}

// --- Regime Geometry ---
export interface RegimePoint {
  x: number;
  y: number;
  velocity: number;
  curvature: number;
  label: string;
}

// --- Confidence Decay ---
export interface DecayPoint {
  horizon: number;
  p_reliable: number;
}

// --- Adversarial Drift ---
export interface DriftScenario {
  id: string;
  name: string;
  type: 'feature_shift' | 'missingness' | 'label_shift' | 'correlation_break';
  severity: number;
  robustness_score: number;
  worst_case_regret: number;
  status: 'pass' | 'warn' | 'fail';
}

// --- Micro-Experiments ---
export interface Experiment {
  id: string;
  intervention: string;
  variable: string;
  expected_lift: number;
  info_gain: number;
  risk_score: number;
  status: 'proposed' | 'running' | 'completed' | 'frozen';
  circuit_breaker: boolean;
}

// Deterministic hash
function simHash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function fullHash(input: string): string {
  return simHash(input) + simHash(input + 'a') + simHash(input + 'b') + simHash(input + 'c')
    + simHash(input + 'd') + simHash(input + 'e') + simHash(input + 'f') + simHash(input + 'g');
}

// Seeded pseudo-random
function seededRandom(seed: number, index: number): number {
  const x = Math.sin(seed * 9301 + index * 49297) * 49297;
  return x - Math.floor(x);
}

// --- Generators ---

export function generateDecisionLedger(
  workflows: Record<WorkflowId, { step: WorkflowStep; policyGates: { verdict: string; rule: string }[] }>,
  seed: number
): DecisionEvent[] {
  const events: DecisionEvent[] = [];
  let prevHash = '0'.repeat(64);
  let idx = 0;

  const workflowConfigs: Record<WorkflowId, { actions: string[]; chosen: string }> = {
    'revenue-leak': {
      actions: ['flag_duplicates', 'auto_reconcile', 'escalate_to_finance', 'ignore'],
      chosen: 'flag_duplicates',
    },
    'wire-transfer': {
      actions: ['approve_transfer', 'escalate_for_review', 'block_transfer', 'request_additional_verification'],
      chosen: 'escalate_for_review',
    },
    'board-briefing': {
      actions: ['compile_summary', 'request_more_input', 'schedule_vote', 'defer'],
      chosen: 'compile_summary',
    },
  };

  for (const wfId of ['revenue-leak', 'wire-transfer', 'board-briefing'] as WorkflowId[]) {
    const wf = workflows[wfId];
    if (wf.step === 'idle') continue;

    const cfg = workflowConfigs[wfId];
    const r = (i: number) => seededRandom(seed, idx * 100 + i);
    
    const event: DecisionEvent = {
      decision_id: `dec_${simHash(wfId + seed)}`,
      ts: '2025-11-15T09:42:17.000Z',
      context_snapshot_id: fullHash(`ctx_${wfId}_${seed}`),
      features_version: `a3f${simHash(wfId).slice(0, 4)}`,
      model_versions: {
        task: `v2.${Math.floor(r(0) * 9) + 1}.0`,
        meta: `v1.${Math.floor(r(1) * 5) + 3}.0`,
        regime: `v0.${Math.floor(r(2) * 8) + 1}.0`,
        drift: `v1.${Math.floor(r(3) * 4) + 1}.0`,
      },
      candidate_actions: cfg.actions,
      chosen_action: wf.step === 'receipt' ? cfg.chosen : cfg.actions[0],
      predicted_outcome: {
        mean: 0.72 + r(4) * 0.2,
        p10: 0.45 + r(5) * 0.15,
        p50: 0.68 + r(6) * 0.2,
        p90: 0.88 + r(7) * 0.1,
        calibrated_prob: 0.78 + r(8) * 0.15,
      },
      uncertainty: {
        aleatoric: 0.05 + r(9) * 0.1,
        epistemic: 0.03 + r(10) * 0.08,
      },
      risk_checks: wf.policyGates.map(g => ({
        rule: g.rule,
        result: g.verdict === 'PASS' ? 'pass' as const : g.verdict === 'DENY' ? 'fail' as const : 'warn' as const,
      })),
      autonomy_level: wfId === 'wire-transfer' ? 0 : wf.step === 'receipt' ? 2 : 1,
      prev_hash: prevHash,
      row_hash: fullHash(`${prevHash}_${wfId}_${wf.step}_${seed}`),
    };

    prevHash = event.row_hash;
    events.push(event);
    idx++;
  }

  return events;
}

export function generateReliabilityState(
  activeWorkflow: WorkflowId | null,
  workflows: Record<WorkflowId, { step: WorkflowStep }>,
  seed: number
): ReliabilityState {
  if (!activeWorkflow) {
    return { p_reliable: 0.94, failure_mode: 'none', autonomy_level: 2, factors: [
      { name: 'Calibration Error', value: 0.02, impact: 'positive' },
      { name: 'Data Freshness', value: 0.95, impact: 'positive' },
      { name: 'Distribution Shift', value: 0.04, impact: 'neutral' },
      { name: 'Model Convergence', value: 0.98, impact: 'positive' },
    ]};
  }

  const step = workflows[activeWorkflow].step;
  const r = (i: number) => seededRandom(seed, i);

  const stepReliability: Record<WorkflowStep, number> = {
    idle: 0.94,
    scanning: 0.88,
    findings: 0.82 + r(20) * 0.1,
    approval: 0.65,
    approved: 0.91,
    receipt: 0.96,
  };

  const p = stepReliability[step];
  const autonomy: 0 | 1 | 2 = p > 0.85 ? 2 : p > 0.7 ? 1 : 0;
  const failureMode = p < 0.7 ? 'drift' : p < 0.8 ? 'calibration' : 'none';

  return {
    p_reliable: p,
    failure_mode: failureMode as ReliabilityState['failure_mode'],
    autonomy_level: autonomy,
    factors: [
      { name: 'Calibration Error', value: 0.15 - p * 0.1, impact: p > 0.85 ? 'positive' : 'negative' },
      { name: 'Data Freshness', value: 0.6 + p * 0.35, impact: p > 0.8 ? 'positive' : 'neutral' },
      { name: 'Distribution Shift', value: 0.3 - p * 0.2, impact: p > 0.85 ? 'positive' : 'negative' },
      { name: 'Ensemble Variance', value: 0.2 - p * 0.15, impact: p > 0.8 ? 'positive' : 'negative' },
      { name: 'Regime Velocity', value: activeWorkflow === 'wire-transfer' && step === 'approval' ? 0.42 : 0.08, impact: activeWorkflow === 'wire-transfer' && step === 'approval' ? 'negative' : 'positive' },
    ],
  };
}

export function generateRegimeTrajectory(
  activeWorkflow: WorkflowId | null,
  workflows: Record<WorkflowId, { step: WorkflowStep }>,
  seed: number
): RegimePoint[] {
  const points: RegimePoint[] = [];
  const numPoints = 30;

  for (let i = 0; i < numPoints; i++) {
    const t = i / numPoints;
    const r = (j: number) => seededRandom(seed, i * 10 + j);
    
    // Base spiral trajectory
    let x = Math.cos(t * Math.PI * 2.5) * (0.3 + t * 0.5) + r(0) * 0.08;
    let y = Math.sin(t * Math.PI * 2.5) * (0.3 + t * 0.5) + r(1) * 0.08;

    // Perturb based on active workflow
    if (activeWorkflow === 'wire-transfer' && i > 20) {
      x += 0.3 * (i - 20) / 10;
      y -= 0.2 * (i - 20) / 10;
    }

    const prev = points[i - 1];
    const velocity = prev ? Math.sqrt((x - prev.x) ** 2 + (y - prev.y) ** 2) : 0;
    const prevPrev = points[i - 2];
    const prevVel = prevPrev && prev ? Math.sqrt((prev.x - prevPrev.x) ** 2 + (prev.y - prevPrev.y) ** 2) : velocity;
    const curvature = Math.abs(velocity - prevVel);

    points.push({
      x: x * 100 + 150,
      y: y * 100 + 150,
      velocity,
      curvature,
      label: i === numPoints - 1 ? 'NOW' : i === 0 ? 'T-30' : '',
    });
  }

  return points;
}

export function generateConfidenceDecay(
  reliability: number,
  activeWorkflow: WorkflowId | null,
  seed: number
): DecayPoint[] {
  const points: DecayPoint[] = [];
  for (let h = 0; h <= 50; h += 2) {
    const r = seededRandom(seed, h);
    let decay = reliability;
    
    // Steeper decay for lower reliability states
    if (reliability < 0.75) {
      decay = reliability * Math.exp(-h * 0.04) + r * 0.02;
    } else {
      decay = reliability * Math.exp(-h * 0.008) + r * 0.01;
    }
    
    // Wire transfer approval causes steeper decay
    if (activeWorkflow === 'wire-transfer') {
      decay *= Math.exp(-h * 0.01);
    }

    points.push({ horizon: h, p_reliable: Math.max(0.1, Math.min(1, decay)) });
  }
  return points;
}

export function generateDriftScenarios(seed: number): DriftScenario[] {
  return [
    {
      id: 'drift_1',
      name: 'Price Sensitivity +30%',
      type: 'feature_shift',
      severity: 0.65,
      robustness_score: 0.82,
      worst_case_regret: 0.12,
      status: 'pass',
    },
    {
      id: 'drift_2',
      name: 'Intent Score Dropout',
      type: 'missingness',
      severity: 0.78,
      robustness_score: 0.61,
      worst_case_regret: 0.28,
      status: 'warn',
    },
    {
      id: 'drift_3',
      name: 'Base Rate Collapse (-40%)',
      type: 'label_shift',
      severity: 0.91,
      robustness_score: 0.44,
      worst_case_regret: 0.41,
      status: 'fail',
    },
    {
      id: 'drift_4',
      name: 'Channel Mix Inversion',
      type: 'correlation_break',
      severity: 0.52,
      robustness_score: 0.88,
      worst_case_regret: 0.07,
      status: 'pass',
    },
    {
      id: 'drift_5',
      name: 'Tracking Pixel Failure',
      type: 'missingness',
      severity: 0.83,
      robustness_score: 0.55,
      worst_case_regret: 0.33,
      status: 'warn',
    },
  ];
}

export function generateExperiments(seed: number): Experiment[] {
  return [
    {
      id: 'exp_1',
      intervention: 'do(cta_variant="B")',
      variable: 'CTA Wording',
      expected_lift: 0.12,
      info_gain: 0.34,
      risk_score: 0.08,
      status: 'completed',
      circuit_breaker: false,
    },
    {
      id: 'exp_2',
      intervention: 'do(price_anchor="+15%")',
      variable: 'Price Anchor',
      expected_lift: 0.08,
      info_gain: 0.28,
      risk_score: 0.22,
      status: 'running',
      circuit_breaker: false,
    },
    {
      id: 'exp_3',
      intervention: 'do(guarantee="extended")',
      variable: 'Guarantee Phrasing',
      expected_lift: 0.15,
      info_gain: 0.41,
      risk_score: 0.05,
      status: 'proposed',
      circuit_breaker: false,
    },
    {
      id: 'exp_4',
      intervention: 'do(followup_delay="-2d")',
      variable: 'Follow-up Schedule',
      expected_lift: -0.03,
      info_gain: 0.18,
      risk_score: 0.45,
      status: 'frozen',
      circuit_breaker: true,
    },
    {
      id: 'exp_5',
      intervention: 'do(channel="sms")',
      variable: 'Channel Routing',
      expected_lift: 0.06,
      info_gain: 0.22,
      risk_score: 0.15,
      status: 'proposed',
      circuit_breaker: false,
    },
  ];
}
