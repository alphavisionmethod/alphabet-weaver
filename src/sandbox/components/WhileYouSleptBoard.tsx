import { motion } from 'framer-motion';
import type { DecisionPacket } from '../contracts';
import { Plane, Gift, Users, Shield, TrendingUp } from 'lucide-react';
import type { ActionCategory } from '../contracts';

const ICONS: Record<ActionCategory, React.ElementType> = {
  travel: Plane,
  gifts: Gift,
  leads: Users,
  insurance: Shield,
  investing: TrendingUp,
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'border-muted-foreground/30',
  awaiting_approval: 'border-accent/50',
  approved: 'border-primary/50',
  denied: 'border-destructive/50',
  executed: 'border-green-500/50',
};

interface WhileYouSleptBoardProps {
  packets: DecisionPacket[];
  onDrillDown: (category: ActionCategory) => void;
}

export function WhileYouSleptBoard({ packets, onDrillDown }: WhileYouSleptBoardProps) {
  const approvalCount = packets.filter(p => p.status === 'awaiting_approval').length;

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-lg font-semibold text-foreground">While you slept</h2>
        <p className="text-sm text-muted-foreground">
          I handled {packets.length} things. {approvalCount > 0 ? `${approvalCount} require${approvalCount === 1 ? 's' : ''} approval.` : 'All clear.'}
        </p>
      </motion.div>

      <div className="grid gap-3">
        {packets.map((packet, i) => {
          const Icon = ICONS[packet.category];
          return (
            <motion.button
              key={packet.id}
              onClick={() => onDrillDown(packet.category)}
              className={`w-full text-left p-4 rounded-lg border ${STATUS_COLORS[packet.status] || 'border-border'} bg-card hover:bg-card/80 transition-colors`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{packet.title}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full capitalize flex-shrink-0 ${
                      packet.status === 'awaiting_approval' ? 'bg-accent/10 text-accent' :
                      packet.status === 'executed' ? 'bg-green-500/10 text-green-500' :
                      packet.status === 'denied' ? 'bg-destructive/10 text-destructive' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {packet.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{packet.summary}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
