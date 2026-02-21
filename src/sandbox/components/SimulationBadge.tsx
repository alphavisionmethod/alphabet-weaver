import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

export function SimulationBadge() {
  return (
    <Badge
      variant="outline"
      className="fixed top-4 right-4 z-50 border-accent/40 bg-accent/10 text-accent gap-1.5 px-3 py-1.5 text-xs font-medium backdrop-blur-sm"
    >
      <Shield className="h-3 w-3" />
      Simulation Mode
    </Badge>
  );
}
