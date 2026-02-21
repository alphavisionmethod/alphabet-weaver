import type { SeededRNG } from '../utils/seeded-rng';
import { generateTravelOptions, type TravelItinerary } from './travel';
import { generateGiftOptions, type GiftOption } from './gifts';
import { generateLeads, type RecoveredLead } from './crm';
import { generateInsuranceQuotes, type InsuranceQuote } from './insurance';
import { generateInvestingOpportunities, type InvestingOpportunity } from './investing';

export interface FakeWorldData {
  travel: TravelItinerary[];
  gifts: GiftOption[];
  leads: RecoveredLead[];
  insurance: InsuranceQuote[];
  investing: InvestingOpportunity[];
}

export function generateFakeWorld(rng: SeededRNG): FakeWorldData {
  return {
    travel: generateTravelOptions(rng),
    gifts: generateGiftOptions(rng),
    leads: generateLeads(rng),
    insurance: generateInsuranceQuotes(rng),
    investing: generateInvestingOpportunities(rng),
  };
}

export type { TravelItinerary, GiftOption, RecoveredLead, InsuranceQuote, InvestingOpportunity };
