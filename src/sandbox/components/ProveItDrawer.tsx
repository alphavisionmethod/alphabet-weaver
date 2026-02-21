import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Eye, Lock, Hash, Gauge } from 'lucide-react';
import type { DecisionPacket } from '../contracts';

interface ProveItDrawerProps {
  packet: DecisionPacket | null;
  open: boolean;
  onClose: () => void;
}

export function ProveItDrawer({ packet, open, onClose }: ProveItDrawerProps) {
  if (!packet) return null;

  const confidenceMap: Record<string, number> = {
    travel: 92, gifts: 88, leads: 78, insurance: 85, investing: 61,
  };
  const confidence = confidenceMap[packet.category] ?? 75;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Proof: {packet.title}
          </SheetTitle>
          <SheetDescription>Simulation inputs, assumptions, and policy gates</SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Simulation Inputs</p>
            <div className="p-3 rounded-md bg-muted/50 space-y-1">
              <p className="text-xs text-foreground">Category: {packet.category}</p>
              <p className="text-xs text-foreground">Data sources: Seeded RNG + Fake-world provider</p>
              <p className="text-xs text-foreground">Deterministic: Yes (same seed = same output)</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Assumptions</p>
            <div className="p-3 rounded-md bg-muted/50 space-y-1">
              <p className="text-xs text-foreground">• Market data is simulated, not real-time</p>
              <p className="text-xs text-foreground">• Pricing reflects typical ranges, not live quotes</p>
              <p className="text-xs text-foreground">• No external API calls made</p>
              <p className="text-xs text-foreground">• All executions are simulated</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Policy Gates</p>
            <div className="space-y-1.5">
              {packet.policyChecks.length > 0 ? packet.policyChecks.map((check) => (
                <div key={check.stepId} className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
                  <Lock className="h-3 w-3 text-primary flex-shrink-0" />
                  <p className="text-xs text-foreground">{check.reason}</p>
                </div>
              )) : (
                <p className="text-xs text-muted-foreground">No policy checks recorded yet</p>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Confidence Score</p>
            <div className="flex items-center gap-3 p-3 rounded-md bg-muted/50">
              <Gauge className="h-4 w-4 text-accent" />
              <div className="flex-1">
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-foreground">{confidence}%</span>
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Packet Hash ID</p>
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/50">
              <Hash className="h-3 w-3 text-muted-foreground" />
              <code className="text-[10px] text-foreground font-mono break-all">
                {packet.id}_v1_{packet.category}_{packet.status}
              </code>
            </div>
          </div>

          {packet.data && (
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Raw Data</p>
              <pre className="text-[10px] text-foreground font-mono bg-muted p-3 rounded overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto">
                {JSON.stringify(packet.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
