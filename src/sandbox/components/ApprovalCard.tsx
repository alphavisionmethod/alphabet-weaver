import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import type { ApprovalRequest } from '../contracts';

interface ApprovalCardProps {
  request: ApprovalRequest;
  onApprove: (optionId?: string) => void;
  onDeny: () => void;
  disabled?: boolean;
}

export function ApprovalCard({ request, onApprove, onDeny, disabled }: ApprovalCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">{request.description}</p>
          {request.estimatedCost > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Estimated cost: ${request.estimatedCost.toLocaleString()}
            </p>
          )}
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent capitalize">
          {request.riskTier} risk
        </span>
      </div>

      {request.options && request.options.length > 0 ? (
        <div className="space-y-2">
          {request.options.map(option => (
            <button
              key={option.id}
              onClick={() => onApprove(option.id)}
              disabled={disabled}
              className="w-full text-left p-3 rounded-md border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors disabled:opacity-50"
            >
              <p className="text-sm font-medium text-foreground">{option.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
              {option.cost !== undefined && option.cost > 0 && (
                <p className="text-xs text-accent mt-1">${option.cost.toLocaleString()}</p>
              )}
            </button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeny}
            disabled={disabled}
            className="w-full text-muted-foreground"
          >
            <X className="h-3 w-3 mr-1" /> Decline
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onApprove()} disabled={disabled} className="flex-1">
            <Check className="h-3 w-3 mr-1" /> Approve
          </Button>
          <Button variant="ghost" size="sm" onClick={onDeny} disabled={disabled} className="flex-1">
            <X className="h-3 w-3 mr-1" /> Deny
          </Button>
        </div>
      )}
    </div>
  );
}
