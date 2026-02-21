import { motion } from 'framer-motion';
import { LayoutDashboard, TrendingUp, DollarSign, Shield, AlertTriangle } from 'lucide-react';
import type { DecisionPacket } from '../contracts';

interface BoardModeProps {
  show: boolean;
  packets: DecisionPacket[];
  budgetSpent: number;
  trustLevel: number;
}

export function BoardMode({ show, packets, budgetSpent, trustLevel }: BoardModeProps) {
  if (!show) return null;

  const executed = packets.filter(p => p.status === 'executed').length;
  const pending = packets.filter(p => p.status === 'awaiting_approval').length;
  const denied = packets.filter(p => p.status === 'denied').length;
  const totalPipeline = 34200;
  const totalSavings = 1480;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2">
        <LayoutDashboard className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-semibold text-foreground">Board Summary</h2>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary ml-auto">Enterprise View</span>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Actions Executed', value: `${executed}/${packets.length}`, icon: TrendingUp, color: 'text-green-500' },
          { label: 'Pending Approval', value: String(pending), icon: AlertTriangle, color: 'text-accent' },
          { label: 'Intelligence Spend', value: `$${budgetSpent.toFixed(2)}`, icon: DollarSign, color: 'text-primary' },
          { label: 'Trust Level', value: `${trustLevel.toFixed(1)}/5`, icon: Shield, color: 'text-primary' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <motion.div
              key={kpi.label}
              className="p-3 rounded-lg border border-border bg-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`h-3 w-3 ${kpi.color}`} />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
              </div>
              <p className="text-lg font-semibold text-foreground">{kpi.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Pipeline & Savings */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          className="p-4 rounded-lg border border-border bg-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Pipeline Value</span>
          <p className="text-2xl font-bold text-primary mt-1">${totalPipeline.toLocaleString()}</p>
          <p className="text-[10px] text-green-500 mt-0.5">↑ 86% from dormant recovery</p>
        </motion.div>
        <motion.div
          className="p-4 rounded-lg border border-border bg-card"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Projected Annual Savings</span>
          <p className="text-2xl font-bold text-green-500 mt-1">${totalSavings.toLocaleString()}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Insurance + travel optimization</p>
        </motion.div>
      </div>

      {/* Action Log */}
      <div className="space-y-2">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Action Log</span>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-medium">Category</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Status</th>
                <th className="text-left py-2 text-muted-foreground font-medium">Risk</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Compute</th>
              </tr>
            </thead>
            <tbody>
              {packets.map(p => (
                <tr key={p.id} className="border-b border-border">
                  <td className="py-2 text-foreground capitalize">{p.category}</td>
                  <td className="py-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      p.status === 'executed' ? 'bg-green-500/10 text-green-500' :
                      p.status === 'awaiting_approval' ? 'bg-accent/10 text-accent' :
                      p.status === 'denied' ? 'bg-destructive/10 text-destructive' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {p.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2 text-muted-foreground capitalize">{p.planSteps[0]?.riskTier || '—'}</td>
                  <td className="py-2 text-right text-muted-foreground">${p.planSteps[0]?.estimatedCost.toFixed(2) || '0.00'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Governance */}
      <motion.div
        className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <p className="text-xs text-foreground">
          {denied > 0 ? `${denied} action${denied > 1 ? 's' : ''} declined. ` : ''}
          All executions simulated. Full audit trail available. Zero unauthorized actions.
        </p>
      </motion.div>
    </motion.div>
  );
}
