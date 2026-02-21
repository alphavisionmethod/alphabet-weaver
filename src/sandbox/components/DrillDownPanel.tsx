import { useState } from 'react';
import { motion } from 'framer-motion';
import type { DecisionPacket } from '../contracts';
import { ApprovalCard } from './ApprovalCard';
import { CounterfactualToggle } from './CounterfactualToggle';
import { IntelligenceSpendBadge } from './IntelligenceSpendBadge';
import { RegretMemory } from './RegretMemory';
import { ProveItDrawer } from './ProveItDrawer';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DrillDownPanelProps {
  packet: DecisionPacket;
  onApprove: (packetId: string, optionId?: string) => void;
  onDeny: (packetId: string) => void;
  onBack: () => void;
  loading?: boolean;
  totalSpent: number;
}

export function DrillDownPanel({ packet, onApprove, onDeny, onBack, loading, totalSpent }: DrillDownPanelProps) {
  const [showProof, setShowProof] = useState(false);

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 text-muted-foreground">
          <ArrowLeft className="h-3 w-3" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <IntelligenceSpendBadge category={packet.category} totalSpent={totalSpent} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowProof(true)}
            className="gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Eye className="h-3 w-3" /> Show Proof
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground">{packet.title}</h2>
        <p className="text-sm text-muted-foreground">{packet.summary}</p>
      </div>

      {/* Regret Memory */}
      <RegretMemory category={packet.category} />

      {/* Counterfactual */}
      <CounterfactualToggle category={packet.category} />

      {/* Policy Checks */}
      {packet.policyChecks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Policy Checks</h3>
          {packet.policyChecks.map((check) => (
            <motion.div
              key={check.stepId}
              className="flex items-start gap-2 p-2 rounded-md bg-muted/50"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {check.allowed ? (
                check.requiresApproval ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-accent mt-0.5 flex-shrink-0" />
                ) : (
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                )
              ) : (
                <XCircle className="h-3.5 w-3.5 text-destructive mt-0.5 flex-shrink-0" />
              )}
              <p className="text-xs text-muted-foreground">{check.reason}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Plan Steps */}
      {packet.planSteps.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Plan</h3>
          {packet.planSteps.map((step, i) => (
            <motion.div
              key={step.id}
              className="p-3 rounded-md border border-border bg-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-sm text-foreground">{step.description}</p>
              <div className="flex gap-3 mt-1.5">
                <span className="text-[10px] text-muted-foreground">Risk: {step.riskTier}</span>
                <span className="text-[10px] text-muted-foreground">Cost: ${step.estimatedCost.toFixed(2)}</span>
                <span className="text-[10px] text-muted-foreground">{step.reversible ? 'Reversible' : 'Irreversible'}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Approval Requests */}
      {packet.status === 'awaiting_approval' && packet.approvalRequests.map((req) => (
        <ApprovalCard
          key={req.id}
          request={req}
          onApprove={(optionId) => onApprove(packet.id, optionId)}
          onDeny={() => onDeny(packet.id)}
          disabled={loading}
        />
      ))}

      {/* Execution Results */}
      {packet.executionResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Execution Results</h3>
          {packet.executionResults.map((result, i) => (
            <motion.div
              key={i}
              className="p-3 rounded-md border border-green-500/30 bg-green-500/5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                <p className="text-sm text-foreground">{result.summary}</p>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Simulated at: {result.simulatedAt}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Category data */}
      {packet.category === 'leads' && packet.data?.leads && (
        <LeadsSummary leads={packet.data.leads as any[]} />
      )}
      {packet.category === 'insurance' && packet.data?.quotes && (
        <InsuranceSummary quotes={packet.data.quotes as any[]} />
      )}
      {packet.category === 'investing' && packet.data?.opportunities && (
        <InvestingSummary opportunities={packet.data.opportunities as any[]} />
      )}

      <ProveItDrawer packet={showProof ? packet : null} open={showProof} onClose={() => setShowProof(false)} />
    </motion.div>
  );
}

function LeadsSummary({ leads }: { leads: any[] }) {
  const replied = leads.filter((l: any) => l.replied);
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        Recovered Leads ({leads.length}) — {replied.length} replied
      </h3>
      <div className="max-h-60 overflow-y-auto space-y-1.5">
        {leads.slice(0, 10).map((lead: any) => (
          <div key={lead.id} className="p-2 rounded-md border border-border bg-card text-xs">
            <div className="flex justify-between">
              <span className="font-medium text-foreground">{lead.contact}</span>
              <span className="text-muted-foreground">{lead.company}</span>
            </div>
            {lead.replied && lead.replySnippet && (
              <p className="text-green-500 mt-1 italic">"{lead.replySnippet}"</p>
            )}
          </div>
        ))}
        {leads.length > 10 && (
          <p className="text-xs text-muted-foreground text-center">+ {leads.length - 10} more leads</p>
        )}
      </div>
    </div>
  );
}

function InsuranceSummary({ quotes }: { quotes: any[] }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Provider Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 text-muted-foreground font-medium">Provider</th>
              <th className="text-right py-2 text-muted-foreground font-medium">Monthly</th>
              <th className="text-right py-2 text-muted-foreground font-medium">Deductible</th>
              <th className="text-center py-2 text-muted-foreground font-medium">Rating</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((q: any) => (
              <tr key={q.id} className={`border-b border-border ${q.recommended ? 'bg-primary/5' : ''}`}>
                <td className="py-2 text-foreground">
                  {q.provider} {q.recommended && <span className="text-accent ml-1">★</span>}
                </td>
                <td className="text-right py-2 text-foreground">${q.monthlyPremium}</td>
                <td className="text-right py-2 text-muted-foreground">${q.deductible}</td>
                <td className="text-center py-2 text-muted-foreground">{q.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvestingSummary({ opportunities }: { opportunities: any[] }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Opportunities</h3>
      {opportunities.map((opp: any) => (
        <div key={opp.id} className="p-3 rounded-md border border-border bg-card space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-foreground">{opp.name}</p>
              <p className="text-xs text-muted-foreground">{opp.sector} · {opp.type}</p>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              opp.confidence === 'high' ? 'bg-green-500/10 text-green-500' :
              opp.confidence === 'medium' ? 'bg-accent/10 text-accent' :
              'bg-muted text-muted-foreground'
            }`}>
              {opp.confidence} confidence
            </span>
          </div>
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>Projected: {opp.projectedReturn}</p>
            <p>Risk: {opp.riskLevel}</p>
            <p>Min: ${opp.minimumInvestment.toLocaleString()} · {opp.timeHorizon}</p>
          </div>
          <ul className="text-xs text-muted-foreground space-y-0.5">
            {opp.riskNotes.map((note: string, i: number) => (
              <li key={i} className="flex items-start gap-1">
                <span className="text-accent mt-0.5">•</span> {note}
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-destructive/70 border-t border-border pt-1.5">{opp.disclaimer}</p>
        </div>
      ))}
    </div>
  );
}
