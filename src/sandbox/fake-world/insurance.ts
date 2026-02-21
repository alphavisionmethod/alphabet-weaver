import type { SeededRNG } from '../utils/seeded-rng';

export interface InsuranceQuote {
  id: string;
  provider: string;
  monthlyPremium: number;
  annualPremium: number;
  coverage: string;
  deductible: number;
  rating: number;
  pros: string[];
  cons: string[];
  recommended: boolean;
  negotiationSnippet: string;
}

export function generateInsuranceQuotes(rng: SeededRNG): InsuranceQuote[] {
  const quotes: InsuranceQuote[] = [
    {
      id: 'ins_1',
      provider: 'Shield Protect',
      monthlyPremium: 180 + rng.int(0, 30),
      annualPremium: 0,
      coverage: '$2M comprehensive',
      deductible: 500,
      rating: 4.6,
      pros: ['Lowest deductible', '24/7 claims support', 'No rate increases for 3 years'],
      cons: ['Higher monthly premium', 'Limited international coverage'],
      recommended: false,
      negotiationSnippet: '"We can match any competitor within 5% if you commit annually."',
    },
    {
      id: 'ins_2',
      provider: 'Aegis Insurance',
      monthlyPremium: 145 + rng.int(0, 20),
      annualPremium: 0,
      coverage: '$2M comprehensive',
      deductible: 1000,
      rating: 4.4,
      pros: ['Best price-to-coverage ratio', 'Strong digital claims process'],
      cons: ['Higher deductible', 'Phone wait times reported'],
      recommended: true,
      negotiationSnippet: '"For annual prepayment, we offer an additional 8% discount."',
    },
    {
      id: 'ins_3',
      provider: 'Fortress Mutual',
      monthlyPremium: 210 + rng.int(0, 25),
      annualPremium: 0,
      coverage: '$3M comprehensive',
      deductible: 750,
      rating: 4.8,
      pros: ['Highest coverage', 'Top-rated customer satisfaction', 'Global coverage'],
      cons: ['Premium pricing', 'Complex policy documents'],
      recommended: false,
      negotiationSnippet: '"Our platinum tier includes identity theft protection at no extra cost."',
    },
    {
      id: 'ins_4',
      provider: 'QuickCover',
      monthlyPremium: 110 + rng.int(0, 15),
      annualPremium: 0,
      coverage: '$1.5M basic',
      deductible: 2000,
      rating: 3.9,
      pros: ['Lowest premium', 'Simple enrollment', 'Month-to-month flexibility'],
      cons: ['Lower coverage cap', 'High deductible', 'Limited add-ons'],
      recommended: false,
      negotiationSnippet: '"We\'re the fastest to activate — coverage starts in 24 hours."',
    },
  ];
  return quotes.map(q => ({ ...q, annualPremium: q.monthlyPremium * 12 }));
}
