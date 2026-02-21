import { describe, it, expect } from 'vitest';
import { Ledger } from '../sandbox/ledger';
import { ScenarioEngine } from '../sandbox/scenario-engine';
import { evaluatePolicy } from '../sandbox/policy';
import type { DemoSettings, PlanStep } from '../sandbox/contracts';

const DEFAULT_SETTINGS: DemoSettings = {
  persona: 'founder',
  stress: 'calm',
  autonomy: 'execute_with_approval',
  budgetCap: '5.00',
};

describe('Ledger hash chain integrity', () => {
  it('should produce valid chain with sequential events', async () => {
    const ledger = new Ledger();
    await ledger.append('sess1', 'init', { seed: 123 });
    await ledger.append('sess1', 'action', { type: 'approve' });
    await ledger.append('sess1', 'action', { type: 'deny' });

    const result = await ledger.verify();
    expect(result.valid).toBe(true);
    expect(ledger.getEvents()).toHaveLength(3);
  });

  it('should have sequential chain indices', async () => {
    const ledger = new Ledger();
    await ledger.append('sess1', 'a', {});
    await ledger.append('sess1', 'b', {});
    await ledger.append('sess1', 'c', {});

    const events = ledger.getEvents();
    expect(events[0].chainIndex).toBe(0);
    expect(events[1].chainIndex).toBe(1);
    expect(events[2].chainIndex).toBe(2);
  });

  it('should chain hashes: each event references previous hash', async () => {
    const ledger = new Ledger();
    await ledger.append('sess1', 'a', {});
    await ledger.append('sess1', 'b', {});

    const events = ledger.getEvents();
    expect(events[0].previousHash).toBe('0'.repeat(64));
    expect(events[1].previousHash).toBe(events[0].hash);
  });
});

describe('Scenario engine determinism', () => {
  it('should produce same initial state from same seed', () => {
    const engine1 = new ScenarioEngine('sess1', 42, DEFAULT_SETTINGS);
    const engine2 = new ScenarioEngine('sess2', 42, DEFAULT_SETTINGS);

    const state1 = engine1.getState();
    const state2 = engine2.getState();

    expect(state1.packets.length).toBe(state2.packets.length);
    expect(state1.packets.map(p => p.category)).toEqual(state2.packets.map(p => p.category));
  });

  it('should produce different data from different seeds', () => {
    const engine1 = new ScenarioEngine('sess1', 42, DEFAULT_SETTINGS);
    const engine2 = new ScenarioEngine('sess2', 999, DEFAULT_SETTINGS);

    const world1 = engine1.getFakeWorld();
    const world2 = engine2.getFakeWorld();

    // Travel costs should differ with different seeds (seeded RNG affects pricing)
    const cost1 = world1.travel[0].totalCost;
    const cost2 = world2.travel[0].totalCost;
    expect(cost1).not.toBe(cost2);
  });

  it('should produce 5 initial packets', () => {
    const engine = new ScenarioEngine('sess1', 42, DEFAULT_SETTINGS);
    const state = engine.getState();
    expect(state.packets).toHaveLength(5);
    const categories = state.packets.map(p => p.category).sort();
    expect(categories).toEqual(['gifts', 'insurance', 'investing', 'leads', 'travel']);
  });
});

describe('Policy gating', () => {
  const lowRiskStep: PlanStep = {
    id: 'step1',
    description: 'Low risk action',
    category: 'gifts',
    riskTier: 'low',
    estimatedCost: 0.01,
    reversible: true,
  };

  const highRiskStep: PlanStep = {
    id: 'step2',
    description: 'High risk action',
    category: 'investing',
    riskTier: 'high',
    estimatedCost: 0.04,
    reversible: false,
  };

  it('should auto-approve low risk in delegated mode', () => {
    const settings: DemoSettings = { ...DEFAULT_SETTINGS, autonomy: 'delegated' };
    const result = evaluatePolicy(lowRiskStep, settings, 0);
    expect(result.allowed).toBe(true);
    expect(result.requiresApproval).toBe(false);
  });

  it('should require approval for high risk in execute_with_approval mode', () => {
    const result = evaluatePolicy(highRiskStep, DEFAULT_SETTINGS, 0);
    expect(result.allowed).toBe(true);
    expect(result.requiresApproval).toBe(true);
  });

  it('should require approval for everything in observe mode', () => {
    const settings: DemoSettings = { ...DEFAULT_SETTINGS, autonomy: 'observe' };
    const result = evaluatePolicy(lowRiskStep, settings, 0);
    expect(result.allowed).toBe(true);
    expect(result.requiresApproval).toBe(true);
  });

  it('should block actions exceeding budget', () => {
    const settings: DemoSettings = { ...DEFAULT_SETTINGS, budgetCap: '0.10' };
    const result = evaluatePolicy(lowRiskStep, settings, 0.10);
    expect(result.allowed).toBe(false);
  });

  it('should require approval for high risk in delegated+overwhelmed', () => {
    const settings: DemoSettings = { ...DEFAULT_SETTINGS, autonomy: 'delegated', stress: 'overwhelmed' };
    const result = evaluatePolicy(highRiskStep, settings, 0);
    expect(result.allowed).toBe(true);
    expect(result.requiresApproval).toBe(true);
  });
});

describe('Integration: approve flow produces receipt', () => {
  it('should produce a receipt when approving travel', async () => {
    const engine = new ScenarioEngine('sess1', 42, DEFAULT_SETTINGS);
    const state = engine.getState();
    const travelPacket = state.packets.find(p => p.category === 'travel');
    expect(travelPacket).toBeDefined();
    expect(travelPacket!.status).toBe('awaiting_approval');

    const optionId = travelPacket!.approvalRequests[0]?.options?.[0]?.id;
    const newState = await engine.processAction({
      sessionId: 'sess1',
      timestamp: new Date().toISOString(),
      action: 'approve',
      packetId: travelPacket!.id,
      optionId,
    });

    const updated = newState.packets.find(p => p.category === 'travel');
    expect(updated!.status).toBe('executed');
    expect(updated!.receipts).toHaveLength(1);
    expect(updated!.receipts[0].hash).toBeTruthy();
    expect(updated!.receipts[0].verified).toBe(true);
    expect(newState.receipts).toHaveLength(1);
  });
});
