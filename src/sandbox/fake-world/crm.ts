import type { SeededRNG } from '../utils/seeded-rng';

export interface RecoveredLead {
  id: string;
  company: string;
  contact: string;
  email: string;
  lastActivity: string;
  daysSilent: number;
  recoveryMethod: string;
  replied: boolean;
  replySnippet?: string;
  consentStatus: string;
  estimatedValue: number;
}

const COMPANIES = [
  'Acme Corp', 'TechNova', 'BrightPath', 'Zenith Labs', 'Pulse Digital',
  'NorthStar AI', 'Apex Solutions', 'FutureBridge', 'ClearView Analytics', 'OmniTech',
  'Stratosphere', 'Quantum Leap', 'BlueShift', 'DataForge', 'Nexus Systems',
  'PrimeScale', 'VectorFlow', 'CoreLogic', 'SkyVault', 'ArcReactor'
];

const NAMES = [
  'Sarah Chen', 'Marcus Johnson', 'Elena Rodriguez', 'James Park', 'Priya Sharma',
  'Tom Wilson', 'Amara Obi', 'David Kim', 'Lisa Zhang', 'Ryan O\'Brien',
  'Mei Lin', 'Carlos Diaz', 'Fatima Al-Hassan', 'Noah Fischer', 'Anika Patel',
  'Brandon Lee', 'Sophie Martin', 'Alex Turner', 'Kenji Tanaka', 'Rachel Green'
];

const RECOVERY_METHODS = [
  'Personalized re-engagement email',
  'Value-add content share',
  'Case study matching their industry',
  'Product update notification',
  'Seasonal check-in',
];

const REPLIES = [
  'Thanks for reaching out! Let\'s set up a call next week.',
  'Interesting timing — we were just discussing this internally.',
  'Can you send over the updated pricing?',
  'We\'re evaluating options for Q2. Add me to the shortlist.',
  'Not right now, but keep me posted on the enterprise tier.',
];

export function generateLeads(rng: SeededRNG): RecoveredLead[] {
  return Array.from({ length: 20 }, (_, i) => {
    const replied = rng.next() > 0.6;
    return {
      id: `lead_${i + 1}`,
      company: COMPANIES[i],
      contact: NAMES[i],
      email: `${NAMES[i].toLowerCase().replace(/[^a-z]/g, '.')}@${COMPANIES[i].toLowerCase().replace(/\s/g, '')}.com`,
      lastActivity: new Date(Date.now() - rng.int(30, 120) * 86400000).toISOString(),
      daysSilent: rng.int(30, 120),
      recoveryMethod: rng.pick(RECOVERY_METHODS),
      replied,
      replySnippet: replied ? rng.pick(REPLIES) : undefined,
      consentStatus: 'opted-in',
      estimatedValue: rng.int(5, 50) * 1000,
    };
  });
}
