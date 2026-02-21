import type { DemoSettings, Persona } from '../../contracts';
import type { FakeWorldData } from '../../fake-world';
import type { DecisionPacket } from '../../contracts';

function voiceForPersona(persona: Persona, lines: Record<Persona, string[]>): string[] {
  return lines[persona] || lines.founder;
}

export function generateInitialPackets(
  data: FakeWorldData,
  settings: DemoSettings
): DecisionPacket[] {
  const repliedCount = data.leads.filter(l => l.replied).length;
  const totalLeadValue = data.leads.reduce((s, l) => s + l.estimatedValue, 0);
  const recommendedInsurance = data.insurance.find(q => q.recommended);

  const packets: DecisionPacket[] = [
    {
      id: 'pkt_travel',
      category: 'travel',
      title: 'Travel Itinerary Ready',
      summary: `Two itineraries simulated. Option A: $${data.travel[0].totalCost.toLocaleString()} (cost). Option B: $${data.travel[1].totalCost.toLocaleString()} (comfort).`,
      planSteps: [{
        id: 'step_travel_1',
        description: 'Compare flight and hotel combinations',
        category: 'travel',
        riskTier: 'medium',
        estimatedCost: 0.02,
        reversible: true,
      }],
      policyChecks: [],
      approvalRequests: [{
        id: 'approval_travel',
        stepId: 'step_travel_1',
        category: 'travel',
        description: 'Select and book a travel itinerary',
        estimatedCost: data.travel[0].totalCost,
        riskTier: 'medium',
        options: data.travel.map(t => ({
          id: t.id,
          label: t.label,
          description: t.description,
          cost: t.totalCost,
        })),
      }],
      executionResults: [],
      receipts: [],
      voiceLines: voiceForPersona(settings.persona, {
        founder: [
          'I simulated two itineraries. Option A optimizes cost. Option B optimizes comfort.',
          'Both include direct or one-stop flights and 3-night hotel stays.',
        ],
        professional: [
          'Two travel options prepared. Saved you 45 minutes of comparison.',
          'Option A is efficient. Option B maximizes comfort with fewer stops.',
        ],
        family_office: [
          'Two travel arrangements prepared for review.',
          'Option A minimizes spend. Option B maximizes productivity with direct routing.',
        ],
        neurodivergent: [
          'Two travel options. Pick one.',
          'Option A: cheaper. Option B: more comfortable.',
        ],
        consumer: [
          'I found two travel options for your trip.',
          'Option A is budget-friendly. Option B is more relaxing.',
        ],
      }),
      data: { itineraries: data.travel },
      status: 'awaiting_approval',
    },
    {
      id: 'pkt_gifts',
      category: 'gifts',
      title: 'Anniversary in 10 Days',
      summary: `Three gift options prepared within budget. Sourced from calendar events and partner preferences.`,
      planSteps: [{
        id: 'step_gifts_1',
        description: 'Curate gift options from memory sources',
        category: 'gifts',
        riskTier: 'low',
        estimatedCost: 0.01,
        reversible: true,
      }],
      policyChecks: [],
      approvalRequests: [{
        id: 'approval_gifts',
        stepId: 'step_gifts_1',
        category: 'gifts',
        description: 'Select and purchase anniversary gift',
        estimatedCost: data.gifts[0].price,
        riskTier: 'low',
        options: data.gifts.map(g => ({
          id: g.id,
          label: g.name,
          description: `${g.description} — $${g.price}`,
          cost: g.price,
        })),
      }],
      executionResults: [],
      receipts: [],
      voiceLines: voiceForPersona(settings.persona, {
        founder: [
          'Anniversary is in 10 days. I prepared three gift options within your budget.',
          'Each option is sourced from your calendar and partner preference notes.',
        ],
        professional: [
          'Anniversary reminder: 10 days. Three options ready.',
          'All sourced from your preferences. No research time needed.',
        ],
        family_office: [
          'Personal reminder: anniversary in 10 days.',
          'Three curated options ready. All within discretionary allocation.',
        ],
        neurodivergent: [
          'Anniversary in 10 days. Three gifts ready.',
          'Pick one. All within budget.',
        ],
        consumer: [
          'Your anniversary is coming up in 10 days!',
          'I found three thoughtful gifts based on your shared memories.',
        ],
      }),
      data: { gifts: data.gifts },
      status: 'awaiting_approval',
    },
    {
      id: 'pkt_leads',
      category: 'leads',
      title: `${data.leads.length} Leads Recovered`,
      summary: `${repliedCount} have replied. Total pipeline value: $${totalLeadValue.toLocaleString()}. Consent suppression rules applied.`,
      planSteps: [{
        id: 'step_leads_1',
        description: 'Re-engage dormant leads with personalized outreach',
        category: 'leads',
        riskTier: 'low',
        estimatedCost: 0.03,
        reversible: true,
      }],
      policyChecks: [],
      approvalRequests: [],
      executionResults: [{
        stepId: 'step_leads_1',
        success: true,
        summary: `${data.leads.length} leads contacted. ${repliedCount} replied. Consent rules enforced.`,
        details: { totalLeads: data.leads.length, replied: repliedCount, pipelineValue: totalLeadValue },
        simulatedAt: new Date().toISOString(),
      }],
      receipts: [],
      voiceLines: voiceForPersona(settings.persona, {
        founder: [
          `Recovered ${data.leads.length} leads without spamming. Consent suppression rules applied.`,
          `${repliedCount} have already replied. Pipeline value is $${totalLeadValue.toLocaleString()}.`,
        ],
        professional: [
          `${data.leads.length} contacts reconnected. ${repliedCount} replied.`,
          `No action needed from you. Pipeline value: $${totalLeadValue.toLocaleString()}.`,
        ],
        family_office: [
          `${data.leads.length} portfolio contacts re-engaged. ${repliedCount} responses received.`,
          `Estimated pipeline value: $${totalLeadValue.toLocaleString()}.`,
        ],
        neurodivergent: [
          `${data.leads.length} contacts reached. ${repliedCount} replied.`,
          'No action needed.',
        ],
        consumer: [
          `Your business had ${data.leads.length} dormant contacts. I reached out respectfully.`,
          `${repliedCount} are interested in reconnecting.`,
        ],
      }),
      data: { leads: data.leads },
      status: 'executed',
    },
    {
      id: 'pkt_insurance',
      category: 'insurance',
      title: '4 Insurance Quotes Ready',
      summary: `Compared 4 providers. ${recommendedInsurance?.provider || 'Aegis Insurance'} recommended for best value.`,
      planSteps: [{
        id: 'step_insurance_1',
        description: 'Request and compare insurance quotes',
        category: 'insurance',
        riskTier: 'low',
        estimatedCost: 0.02,
        reversible: true,
      }],
      policyChecks: [],
      approvalRequests: [{
        id: 'approval_insurance',
        stepId: 'step_insurance_1',
        category: 'insurance',
        description: 'Select insurance provider',
        estimatedCost: 0,
        riskTier: 'low',
        options: data.insurance.map(q => ({
          id: q.id,
          label: q.provider,
          description: `$${q.monthlyPremium}/mo — ${q.coverage}`,
          cost: q.annualPremium,
        })),
      }],
      executionResults: [],
      receipts: [],
      voiceLines: voiceForPersona(settings.persona, {
        founder: [
          'Requested four insurance quotes. Two are meaningfully cheaper. Recommendation ready.',
          `${recommendedInsurance?.provider} offers the best price-to-coverage ratio.`,
        ],
        professional: [
          `Four quotes compared. Saves $95/month switching to ${recommendedInsurance?.provider}.`,
          'No paperwork needed from you yet. Just a yes.',
        ],
        family_office: [
          'Four insurance quotes analyzed. Cost-benefit matrix prepared.',
          `Recommendation: ${recommendedInsurance?.provider} for optimal risk-adjusted coverage.`,
        ],
        neurodivergent: [
          'Four insurance options. One is clearly best.',
          `${recommendedInsurance?.provider}. Cheapest good option.`,
        ],
        consumer: [
          'I compared four insurance options for your family.',
          `${recommendedInsurance?.provider} looks like the best fit for your needs.`,
        ],
      }),
      data: { quotes: data.insurance },
      status: 'awaiting_approval',
    },
    {
      id: 'pkt_investing',
      category: 'investing',
      title: '2 Opportunities Flagged',
      summary: 'Medium confidence. Non-trivial risk. No guarantees — simulation only.',
      planSteps: [{
        id: 'step_investing_1',
        description: 'Flag investment opportunities with risk analysis',
        category: 'investing',
        riskTier: 'high',
        estimatedCost: 0.04,
        reversible: false,
      }],
      policyChecks: [],
      approvalRequests: [],
      executionResults: [],
      receipts: [],
      voiceLines: voiceForPersona(settings.persona, {
        founder: [
          'Two investing opportunities flagged. Confidence is medium. Risk is non-trivial.',
          'These are informational only. No action taken without explicit approval.',
        ],
        professional: [
          'Two investment opportunities worth reviewing when you have time.',
          'Medium confidence. No commitments made. Review at your pace.',
        ],
        family_office: [
          'Two opportunities surfaced from deal flow monitoring.',
          'Confidence: medium. Risk profiles attached. Liquidity assessment included.',
        ],
        neurodivergent: [
          'Two investment opportunities. Medium confidence.',
          'No action taken. Review when ready.',
        ],
        consumer: [
          'I noticed two potential investment opportunities.',
          'Both carry meaningful risk. Sharing for awareness only.',
        ],
      }),
      data: { opportunities: data.investing },
      status: 'pending',
    },
  ];

  return packets;
}
