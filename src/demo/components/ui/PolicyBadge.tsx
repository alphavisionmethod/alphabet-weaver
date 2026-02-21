import { motion } from 'framer-motion';
import type { PolicyVerdict } from '../../types';
import { Shield, ShieldAlert, ShieldX } from 'lucide-react';

interface PolicyBadgeProps {
  verdict: PolicyVerdict;
  rule?: string;
  compact?: boolean;
}

const VERDICT_CONFIG: Record<PolicyVerdict, { icon: typeof Shield; label: string; colorClass: string }> = {
  PASS: { icon: Shield, label: 'Pass', colorClass: 'text-emerald-400/80 bg-emerald-400/10 border-emerald-400/20' },
  ESCALATE: { icon: ShieldAlert, label: 'Escalate', colorClass: 'text-amber-400/80 bg-amber-400/10 border-amber-400/20' },
  DENY: { icon: ShieldX, label: 'Deny', colorClass: 'text-red-400/80 bg-red-400/10 border-red-400/20' },
};

export function PolicyBadge({ verdict, rule, compact }: PolicyBadgeProps) {
  const cfg = VERDICT_CONFIG[verdict];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 ${cfg.colorClass}`}
    >
      <Icon className={compact ? 'h-2.5 w-2.5' : 'h-3 w-3'} />
      <span className={`font-medium ${compact ? 'text-[9px]' : 'text-[10px]'}`}>{cfg.label}</span>
      {rule && !compact && <span className="text-[9px] opacity-60">· {rule}</span>}
    </motion.div>
  );
}
