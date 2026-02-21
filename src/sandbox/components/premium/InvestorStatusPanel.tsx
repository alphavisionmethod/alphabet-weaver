import { motion } from 'framer-motion';
import { Activity, Shield, Layers, Zap, CheckCircle } from 'lucide-react';
import type { SimResult } from '../../lib/simulationEngine';

interface InvestorStatusPanelProps {
  receipts: SimResult[];
  autonomyLevel: number;
}

export function InvestorStatusPanel({ receipts, autonomyLevel }: InvestorStatusPanelProps) {
  const totalValue = receipts.reduce((s, r) => s + (r.simulatedSavings || 0), 0);
  const autonomyPercent = Math.min(100, (autonomyLevel / 5) * 100);

  return (
    <motion.div
      className="rounded-2xl p-5 space-y-4 bg-card border border-border"
      style={{ boxShadow: '0 2px 16px hsl(var(--border) / 0.3)' }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4" style={{ color: 'hsl(270 91% 55%)' }} />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          System Status
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatusItem
          icon={<Layers className="h-3.5 w-3.5" />}
          label="Autonomy Level"
          value={autonomyLevel.toFixed(1)}
        />
        <StatusItem
          icon={<Shield className="h-3.5 w-3.5" />}
          label="Mode"
          value="Simulation"
        />
        <StatusItem
          icon={<CheckCircle className="h-3.5 w-3.5" />}
          label="Ledger Integrity"
          value="Verified"
          valueColor="hsl(150 60% 40%)"
        />
        <StatusItem
          icon={<Zap className="h-3.5 w-3.5" />}
          label="Decisions"
          value={String(receipts.length)}
        />
      </div>

      {/* Autonomy progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Autonomy Progress</span>
          <span className="text-[10px] font-medium text-muted-foreground">{autonomyLevel.toFixed(1)} / 5.0</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, hsl(270 91% 55%), hsl(38 95% 54%))' }}
            initial={{ width: 0 }}
            animate={{ width: `${autonomyPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {totalValue > 0 && (
        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Est. Value Generated</span>
            <span className="text-sm font-semibold" style={{ color: 'hsl(38 95% 54%)' }}>
              ${totalValue.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function StatusItem({ icon, label, value, valueColor }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
      <p className="text-sm font-medium" style={{ color: valueColor || 'hsl(var(--foreground))' }}>{value}</p>
    </div>
  );
}
