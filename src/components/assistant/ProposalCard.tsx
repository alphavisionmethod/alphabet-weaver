import type { RiskTier, ExecutionMode, Proposal } from '@/types/assistant';
import { Check, X, Eye, Pencil, AlertTriangle, Shield, Zap } from 'lucide-react';

interface ProposalCardProps {
  proposal: Proposal;
  onApprove?: () => void;
  onReject?: () => void;
  onViewDetails?: () => void;
  onEdit?: () => void;
  compact?: boolean;
}

const RISK_STYLES: Record<RiskTier, { bg: string; text: string; label: string }> = {
  LOW: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Low' },
  MED: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Med' },
  HIGH: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'High' },
  CRITICAL: { bg: 'bg-destructive/20', text: 'text-destructive', label: 'Critical' },
};

const MODE_STYLES: Record<ExecutionMode, string> = {
  SIM: 'text-muted-foreground border-muted-foreground/30',
  SHADOW: 'text-primary border-primary/30',
  SUPERVISED: 'text-primary border-primary',
};

export function ProposalCard({ proposal, onApprove, onReject, onViewDetails, onEdit, compact }: ProposalCardProps) {
  const risk = RISK_STYLES[proposal.riskTier];
  const isResolved = proposal.status !== 'pending';

  return (
    <div className={`rounded-xl border transition-colors ${
      isResolved
        ? 'border-border/50 bg-card/50 opacity-60'
        : proposal.riskTier === 'HIGH' || proposal.riskTier === 'CRITICAL'
          ? 'border-destructive/20 bg-card'
          : 'border-border bg-card'
    }`}>
      <div className="p-4 space-y-3">
        {/* Title row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {(proposal.riskTier === 'HIGH' || proposal.riskTier === 'CRITICAL') && (
              <AlertTriangle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
            )}
            <h4 className="text-sm font-medium text-foreground truncate">{proposal.title}</h4>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${risk.bg} ${risk.text}`}>
              {risk.label}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium border ${MODE_STYLES[proposal.executionMode]}`}>
              {proposal.executionMode}
            </span>
          </div>
        </div>

        {/* Summary */}
        {!compact && (
          <p className="text-xs text-muted-foreground leading-relaxed">{proposal.summary}</p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Zap className="h-2.5 w-2.5" />
            ${(proposal.costCents / 100).toFixed(2)}
          </span>
          {proposal.requiresApproval && (
            <span className="flex items-center gap-1">
              <Shield className="h-2.5 w-2.5" />
              Requires approval
            </span>
          )}
          {isResolved && (
            <span className={`font-medium ${proposal.status === 'approved' ? 'text-emerald-400' : 'text-destructive'}`}>
              {proposal.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
            </span>
          )}
        </div>

        {/* Actions */}
        {!isResolved && (
          <div className="flex items-center gap-1.5 pt-1">
            <button
              onClick={onViewDetails}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Eye className="h-3 w-3" />
              Details
            </button>
            {proposal.requiresApproval && onApprove && (
              <button
                onClick={onApprove}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              >
                <Check className="h-3 w-3" />
                Approve
              </button>
            )}
            {onReject && (
              <button
                onClick={onReject}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-destructive hover:bg-destructive/10 transition-colors"
              >
                <X className="h-3 w-3" />
                Reject
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors ml-auto"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
