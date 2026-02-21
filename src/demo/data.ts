import type { Finding, Advisor, WireTransferData } from './types';

export const FINDINGS: Finding[] = [
  { id: 'f1', type: 'duplicate_charge', title: 'Duplicate SaaS Charge', amount: 2499, severity: 'high', vendor: 'Notion', description: 'Duplicate subscription billed on 2 cards since March.' },
  { id: 'f2', type: 'missing_invoice', title: 'Missing Invoice', amount: 18750, severity: 'critical', vendor: 'CloudFlare Enterprise', description: 'Q3 invoice missing. Vendor confirmed charge but no PDF on file.' },
  { id: 'f3', type: 'suspicious_fee', title: 'Suspicious Recurring Fee', amount: 349, severity: 'medium', vendor: 'Adobe Stock', description: 'Recurring charge for unused seat. No login activity in 180 days.' },
  { id: 'f4', type: 'vendor_mismatch', title: 'Vendor Name Mismatch', amount: 5200, severity: 'high', vendor: 'Acme Corp / ACME LLC', description: 'Same vendor invoicing under two legal entities. Tax exposure risk.' },
  { id: 'f5', type: 'timezone_anomaly', title: 'Timezone Billing Anomaly', amount: 890, severity: 'low', vendor: 'AWS', description: 'Billing timestamp mismatch between UTC and PST invoicing windows.' },
];

export const WIRE_TRANSFER: WireTransferData = {
  amount: 24500,
  currency: 'USD',
  recipient: 'Meridian Partners Ltd.',
  swiftCode: 'MERPGB2L',
  riskScore: 0.32,
  amlFlag: false,
  bank: 'Barclays UK',
  reference: 'INV-2025-Q4-0187',
};

export const ADVISORS: Advisor[] = [
  { id: 'a1', name: 'Dr. Sarah Chen', role: 'CFO Advisor', stance: 'approve', confidence: 0.92, riskFlags: [], recommendation: 'Proceed with Q4 allocation as planned.' },
  { id: 'a2', name: 'Marcus Webb', role: 'Legal Counsel', stance: 'caution', confidence: 0.78, riskFlags: ['regulatory_change'], recommendation: 'Review new SEC guidelines before proceeding.' },
  { id: 'a3', name: 'Priya Patel', role: 'Risk Officer', stance: 'approve', confidence: 0.85, riskFlags: [], recommendation: 'Risk within acceptable thresholds.' },
  { id: 'a4', name: 'James Okonkwo', role: 'Board Member', stance: 'approve', confidence: 0.88, riskFlags: [], recommendation: 'Aligned with strategic objectives.' },
  { id: 'a5', name: 'Elena Vasquez', role: 'Tax Advisor', stance: 'caution', confidence: 0.71, riskFlags: ['tax_deadline'], recommendation: 'Consider timing relative to Q1 filing.' },
  { id: 'a6', name: 'Dr. Wei Zhang', role: 'Technology', stance: 'approve', confidence: 0.94, riskFlags: [], recommendation: 'Infrastructure ready for expansion.' },
  { id: 'a7', name: 'Catherine Moore', role: 'Compliance', stance: 'approve', confidence: 0.89, riskFlags: [], recommendation: 'All compliance checks passed.' },
  { id: 'a8', name: 'Robert Tanaka', role: 'Operations', stance: 'caution', confidence: 0.65, riskFlags: ['capacity'], recommendation: 'Team bandwidth may be constrained.' },
  { id: 'a9', name: 'Amara Osei', role: 'Strategy', stance: 'approve', confidence: 0.91, riskFlags: [], recommendation: 'Market conditions favorable.' },
  { id: 'a10', name: 'David Kim', role: 'Finance', stance: 'approve', confidence: 0.87, riskFlags: [], recommendation: 'Cash flow projections support this.' },
  { id: 'a11', name: 'Lisa Andersson', role: 'ESG Advisor', stance: 'approve', confidence: 0.83, riskFlags: [], recommendation: 'Aligns with sustainability commitments.' },
  { id: 'a12', name: 'Hassan Al-Rashid', role: 'Investor Rep', stance: 'reject', confidence: 0.76, riskFlags: ['valuation_concern'], recommendation: 'Request updated valuation before committing.' },
];

export const FROZEN_TIMESTAMP = '2025-11-15T09:42:17.000Z';

export function generateReceiptId(seed: number, index: number): string {
  const base = ((seed * 2654435761) >>> 0).toString(16).padStart(8, '0');
  return `rcpt_${base}_${index.toString().padStart(3, '0')}`;
}

export function generateCorrelationId(workflow: string, seed: number): string {
  const hash = ((seed * 1597334677) >>> 0).toString(16).padStart(8, '0');
  return `cor_${workflow}_${hash}`;
}
