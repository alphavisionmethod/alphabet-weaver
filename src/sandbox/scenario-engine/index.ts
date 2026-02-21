import type { DemoState, DemoSettings, DecisionPacket, IntentEnvelope, Receipt, ActionCategory } from '../contracts';
import { SeededRNG } from '../utils/seeded-rng';
import { generateFakeWorld, type FakeWorldData } from '../fake-world';
import { evaluatePolicy } from '../policy';
import { generateInitialPackets } from './scenarios/day-in-life';
import { canonicalJsonStringify } from '../utils/canonical-json';
import { sha256 } from '../utils/hash';
import type { PainPoint } from '../components/IntentSelector';

// Maps pain points to categories that should appear first
const PAIN_PRIORITY: Record<PainPoint, ActionCategory[]> = {
  stress: ['gifts', 'travel', 'insurance', 'leads', 'investing'],
  admin: ['leads', 'insurance', 'travel', 'gifts', 'investing'],
  missed_opportunities: ['leads', 'investing', 'insurance', 'travel', 'gifts'],
  financial_anxiety: ['insurance', 'investing', 'leads', 'travel', 'gifts'],
  time_pressure: ['leads', 'travel', 'insurance', 'gifts', 'investing'],
};

export class ScenarioEngine {
  private rng: SeededRNG;
  private fakeWorld: FakeWorldData;
  private state: DemoState;

  constructor(sessionId: string, seed: number, settings: DemoSettings, painPoint?: PainPoint) {
    this.rng = new SeededRNG(seed);
    this.fakeWorld = generateFakeWorld(this.rng);

    let packets = generateInitialPackets(this.fakeWorld, settings);

    // Reorder packets based on pain point priority
    if (painPoint && PAIN_PRIORITY[painPoint]) {
      const order = PAIN_PRIORITY[painPoint];
      packets = [...packets].sort((a, b) => order.indexOf(a.category) - order.indexOf(b.category));
    }

    this.state = {
      sessionId,
      seed,
      settings,
      currentPhase: 'while_you_slept',
      packets,
      receipts: [],
      budgetSpent: 0.12,
      activeCategory: null,
      frozen: false,
    };

    // Run initial policy checks
    this.state.packets.forEach(pkt => {
      pkt.policyChecks = pkt.planSteps.map(step =>
        evaluatePolicy(step, settings, this.state.budgetSpent)
      );
    });
  }

  getState(): DemoState {
    return this.state;
  }

  getFakeWorld(): FakeWorldData {
    return this.fakeWorld;
  }

  updateSettings(settings: DemoSettings): void {
    this.state.settings = settings;
    // Re-evaluate all policy checks
    this.state.packets.forEach(pkt => {
      pkt.policyChecks = pkt.planSteps.map(step =>
        evaluatePolicy(step, this.state.settings, this.state.budgetSpent)
      );
    });
  }

  freeze(): void {
    this.state.frozen = true;
  }

  async processAction(intent: IntentEnvelope): Promise<DemoState> {
    if (this.state.frozen) return this.state;

    switch (intent.action) {
      case 'drill_down':
        this.state.activeCategory = (intent.category as ActionCategory) ?? null;
        break;

      case 'approve': {
        const packet = this.state.packets.find(p => p.id === intent.packetId);
        if (!packet) break;
        packet.status = 'approved';

        const result = this.simulateExecution(packet, intent.optionId);
        packet.executionResults.push(result);
        packet.status = 'executed';

        const receipt = await this.createReceipt(packet, result);
        packet.receipts.push(receipt);
        this.state.receipts.push(receipt);

        this.state.budgetSpent += packet.planSteps.reduce((s, step) => s + step.estimatedCost, 0);
        break;
      }

      case 'deny': {
        const packet = this.state.packets.find(p => p.id === intent.packetId);
        if (packet) packet.status = 'denied';
        break;
      }

      case 'change_settings': {
        if (intent.payload) {
          const newSettings = { ...this.state.settings, ...intent.payload } as DemoSettings;
          this.updateSettings(newSettings);
        }
        break;
      }
    }

    return this.state;
  }

  private simulateExecution(packet: DecisionPacket, optionId?: string): {
    stepId: string;
    success: boolean;
    summary: string;
    details: Record<string, unknown>;
    simulatedAt: string;
  } {
    const selectedOption = optionId
      ? packet.approvalRequests[0]?.options?.find(o => o.id === optionId)
      : undefined;

    const summaries: Record<string, string> = {
      travel: `Simulated booking: ${selectedOption?.label || 'Travel itinerary'} confirmed.`,
      gifts: `Simulated purchase: ${selectedOption?.label || 'Gift'} ordered for delivery.`,
      leads: `Lead recovery campaign executed. Consent rules enforced.`,
      insurance: `Simulated enrollment: ${selectedOption?.label || 'Insurance plan'} selected.`,
      investing: `Opportunity flagged for review. No commitment made.`,
    };

    return {
      stepId: packet.planSteps[0]?.id || packet.id,
      success: true,
      summary: summaries[packet.category] || 'Simulated execution complete.',
      details: {
        category: packet.category,
        selectedOption: selectedOption?.label,
        selectedOptionId: optionId,
        simulatedCost: selectedOption?.cost || 0,
      },
      simulatedAt: new Date().toISOString(),
    };
  }

  private async createReceipt(
    packet: DecisionPacket,
    result: { stepId: string; success: boolean; summary: string; details: Record<string, unknown>; simulatedAt: string }
  ): Promise<Receipt> {
    const chainIndex = this.state.receipts.length;
    const previousHash = chainIndex > 0
      ? this.state.receipts[chainIndex - 1].hash
      : '0'.repeat(64);

    const receiptData = {
      id: `rcpt_${packet.category}_${Date.now().toString(36)}`,
      chainIndex,
      timestamp: new Date().toISOString(),
      category: packet.category,
      actionType: `${packet.category}_execution`,
      summary: result.summary,
      details: result.details,
      previousHash,
    };

    const hash = await sha256(previousHash + canonicalJsonStringify(receiptData));

    return {
      ...receiptData,
      hash,
      verified: true,
    };
  }
}
