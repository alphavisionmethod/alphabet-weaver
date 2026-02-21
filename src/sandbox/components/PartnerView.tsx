import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Shield, Plane, Gift, Users } from 'lucide-react';
import type { DecisionPacket, ActionCategory } from '../contracts';

const PARTNER_SUMMARIES: Record<ActionCategory, { title: string; summary: string; icon: React.ElementType }> = {
  travel: { title: 'Trip Planned', summary: 'Two options ready. Both family-friendly. Pick your preference.', icon: Plane },
  gifts: { title: 'Anniversary Gift', summary: 'Three thoughtful options picked. All within budget. Your call.', icon: Gift },
  leads: { title: 'Business Update', summary: '20 contacts reconnected. 4 replied. No action needed from you.', icon: Users },
  insurance: { title: 'Insurance Sorted', summary: 'Best quote found. Saves $95/month. Just needs a yes.', icon: Shield },
  investing: { title: 'Money Note', summary: 'Two opportunities spotted. Nothing committed. Review when ready.', icon: Shield },
};

interface PartnerViewProps {
  show: boolean;
  packets: DecisionPacket[];
  onDrillDown: (category: ActionCategory) => void;
}

export function PartnerView({ show, packets, onDrillDown }: PartnerViewProps) {
  if (!show) return null;

  const approvalCount = packets.filter(p => p.status === 'awaiting_approval').length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2">
        <Heart className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Partner View</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Simplified view. {approvalCount > 0 ? `${approvalCount} thing${approvalCount > 1 ? 's' : ''} need${approvalCount === 1 ? 's' : ''} your input.` : 'Everything handled.'}
      </p>

      <div className="grid gap-3">
        {packets.map((packet, i) => {
          const info = PARTNER_SUMMARIES[packet.category];
          const Icon = info.icon;
          return (
            <motion.button
              key={packet.id}
              onClick={() => onDrillDown(packet.category)}
              className="w-full text-left p-4 rounded-lg border border-border bg-card hover:bg-card/80 transition-colors"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{info.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{info.summary}</p>
                </div>
                {packet.status === 'awaiting_approval' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent flex-shrink-0">
                    Needs input
                  </span>
                )}
                {packet.status === 'executed' && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 flex-shrink-0">
                    Done
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
