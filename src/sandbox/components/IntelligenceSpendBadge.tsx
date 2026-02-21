import { Cpu } from 'lucide-react';
import type { ActionCategory } from '../contracts';

const CATEGORY_COSTS: Record<ActionCategory, number> = {
  travel: 0.38,
  gifts: 0.14,
  leads: 0.12,
  insurance: 0.41,
  investing: 0.18,
};

interface IntelligenceSpendBadgeProps {
  category?: ActionCategory | null;
  totalSpent: number;
}

export function IntelligenceSpendBadge({ category, totalSpent }: IntelligenceSpendBadgeProps) {
  const categoryCost = category ? CATEGORY_COSTS[category] : null;

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border bg-card/80 text-xs">
      <Cpu className="h-3 w-3 text-accent" />
      {categoryCost !== null ? (
        <span className="text-muted-foreground">
          <span className="text-foreground font-medium">${categoryCost.toFixed(2)}</span> compute
        </span>
      ) : (
        <span className="text-muted-foreground">
          Total: <span className="text-foreground font-medium">${totalSpent.toFixed(2)}</span>
        </span>
      )}
    </div>
  );
}
