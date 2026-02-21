// Deterministic simulation engine — no randomness, consistent for demo reliability

export interface SimResult {
  id: string;
  type: 'lead_recovery' | 'insurance_quote' | 'gift' | 'travel' | 'investing';
  title: string;
  description: string;
  simulatedSavings?: number;
  confidence: number;
  timestamp: string;
  details: Record<string, unknown>;
  receiptHash: string;
  correlationId: string;
  policyVerdict: 'PASS' | 'REVIEW' | 'BLOCK';
}

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

function makeReceipt(id: string, type: SimResult['type']): Pick<SimResult, 'receiptHash' | 'correlationId' | 'policyVerdict'> {
  return {
    receiptHash: `0x${simpleHash(id + type + 'sita_os')}`,
    correlationId: `cor_${simpleHash(id).slice(0, 12)}`,
    policyVerdict: 'PASS',
  };
}

export function simulateLeadRecovery(): SimResult {
  const id = 'sim_leads_1';
  return {
    id,
    type: 'lead_recovery',
    title: '20 Leads Recovered',
    description: 'Re-engaged dormant contacts with personalized outreach. 8 have already replied. Consent suppression rules enforced.',
    simulatedSavings: 14800,
    confidence: 0.93,
    timestamp: new Date().toISOString(),
    details: { recovered: 20, replied: 8, potentialRevenue: 14800 },
    ...makeReceipt(id, 'lead_recovery'),
  };
}

export function simulateInsuranceQuotes(): SimResult {
  const id = 'sim_insurance_1';
  return {
    id,
    type: 'insurance_quote',
    title: '4 Insurance Quotes Compared',
    description: 'Requested quotes from 4 providers. Aegis Insurance recommended — saves $1,140/year with better coverage.',
    simulatedSavings: 1140,
    confidence: 0.89,
    timestamp: new Date().toISOString(),
    details: { providers: 4, bestSavings: 1140, recommended: 'Aegis Insurance' },
    ...makeReceipt(id, 'insurance_quote'),
  };
}

export function simulateGift(): SimResult {
  const id = 'sim_gift_1';
  return {
    id,
    type: 'gift',
    title: 'Anniversary in 9 Days',
    description: 'Three curated options prepared from calendar and partner preferences. Top pick: Private vineyard weekend.',
    simulatedSavings: undefined,
    confidence: 0.92,
    timestamp: new Date().toISOString(),
    details: { suggestion: 'Private vineyard weekend', budget: 850, daysUntil: 9 },
    ...makeReceipt(id, 'gift'),
  };
}

export function simulateTravelBooking(): SimResult {
  const id = 'sim_travel_1';
  return {
    id,
    type: 'travel',
    title: 'Italy Trip Optimized',
    description: 'Simulated 12 route combinations. Best option saves 32% vs. your usual booking pattern. NYC → Rome direct.',
    simulatedSavings: 2400,
    confidence: 0.95,
    timestamp: new Date().toISOString(),
    details: { route: 'NYC → Rome', savingsPercent: 32, savings: 2400 },
    ...makeReceipt(id, 'travel'),
  };
}

export function simulateInvestment(): SimResult {
  const id = 'sim_invest_1';
  return {
    id,
    type: 'investing',
    title: '2 Opportunities Flagged',
    description: 'AI Infrastructure ETF and sustainable energy fund aligned with your risk profile. Medium confidence. Informational only.',
    simulatedSavings: undefined,
    confidence: 0.87,
    timestamp: new Date().toISOString(),
    details: { asset: 'AI Infrastructure ETF', riskLevel: 'Medium', opportunities: 2 },
    ...makeReceipt(id, 'investing'),
  };
}

export function getGuidedSequence(): SimResult[] {
  return [
    simulateLeadRecovery(),
    simulateInsuranceQuotes(),
    simulateGift(),
    simulateInvestment(),
    simulateTravelBooking(),
  ];
}

export const GUIDED_VOICE_LINES = [
  'While you were sleeping, I recovered 20 leads.',
  'I requested 4 insurance quotes and found $1,140 in annual savings.',
  'Your anniversary is in 9 days. I prepared three options.',
  'I found 2 investment opportunities aligned with your risk profile.',
  'I optimized your travel to Italy for 32% savings.',
  'All of this happened while you slept.',
];

export const OPEN_ACTIONS = [
  { id: 'travel', label: 'Book Travel', description: 'Optimize routes and accommodations' },
  { id: 'leads', label: 'Recover Leads', description: 'Re-engage dormant contacts' },
  { id: 'insurance', label: 'Negotiate Insurance', description: 'Compare and switch providers' },
  { id: 'investing', label: 'Review Investments', description: 'Analyze opportunities' },
  { id: 'gift', label: 'Plan Anniversary', description: 'Curate meaningful gifts' },
  { id: 'board', label: 'Run Board Meeting', description: 'Compile advisor stances' },
] as const;
