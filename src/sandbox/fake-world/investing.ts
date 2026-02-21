import type { SeededRNG } from '../utils/seeded-rng';

export interface InvestingOpportunity {
  id: string;
  name: string;
  sector: string;
  type: string;
  confidence: 'low' | 'medium' | 'high';
  projectedReturn: string;
  riskLevel: string;
  riskNotes: string[];
  minimumInvestment: number;
  timeHorizon: string;
  disclaimer: string;
}

export function generateInvestingOpportunities(rng: SeededRNG): InvestingOpportunity[] {
  return [
    {
      id: 'inv_1',
      name: 'GreenGrid Energy Fund',
      sector: 'Clean Energy',
      type: 'Private Equity Fund',
      confidence: 'medium',
      projectedReturn: `${12 + rng.int(0, 6)}%-${18 + rng.int(0, 5)}% IRR (simulated)`,
      riskLevel: 'Moderate-High',
      riskNotes: [
        'Regulatory environment shifting — subsidy dependency',
        'Technology risk in battery storage component',
        'Fund is 60% deployed; remaining capital in pipeline',
      ],
      minimumInvestment: 25000,
      timeHorizon: '5-7 years',
      disclaimer: 'SIMULATION ONLY. This is not investment advice. Past performance does not guarantee future results. All figures are simulated for demonstration purposes.',
    },
    {
      id: 'inv_2',
      name: 'MedTech Diagnostics Series B',
      sector: 'Healthcare Technology',
      type: 'Venture Capital',
      confidence: 'medium',
      projectedReturn: `${20 + rng.int(0, 10)}%-${35 + rng.int(0, 10)}% IRR (simulated)`,
      riskLevel: 'High',
      riskNotes: [
        'Pre-revenue company; FDA approval pending',
        'Strong IP portfolio but competitive landscape intensifying',
        'Lead investor has strong track record in sector',
      ],
      minimumInvestment: 50000,
      timeHorizon: '7-10 years',
      disclaimer: 'SIMULATION ONLY. This is not investment advice. Venture capital investments carry significant risk of total loss. All figures are simulated.',
    },
  ];
}
