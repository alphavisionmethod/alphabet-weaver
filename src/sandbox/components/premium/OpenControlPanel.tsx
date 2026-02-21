import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OPEN_ACTIONS } from '../../lib/simulationEngine';
import { Plane, Users, Shield, TrendingUp, Gift, LayoutDashboard, ArrowRight, ShieldCheck, X, Play } from 'lucide-react';
import type { ReactElement } from 'react';

const ACTION_ICONS: Record<string, ReactElement> = {
  travel: <Plane className="h-5 w-5" />,
  leads: <Users className="h-5 w-5" />,
  insurance: <Shield className="h-5 w-5" />,
  investing: <TrendingUp className="h-5 w-5" />,
  gift: <Gift className="h-5 w-5" />,
  board: <LayoutDashboard className="h-5 w-5" />,
};

const ACTION_PREVIEWS: Record<string, string> = {
  travel: 'Will simulate 12 route combinations for Italy trip, comparing airlines, layovers, and pricing against your historical booking patterns.',
  leads: 'Will scan CRM for contacts dormant >90 days, draft personalized re-engagement messages, and enforce consent suppression rules.',
  insurance: 'Will request quotes from 4+ providers, compare coverage tiers, deductibles, and premiums against your current policy.',
  investing: 'Will scan market data for opportunities aligned with your risk profile. Informational only — no trades executed.',
  gift: 'Will cross-reference calendar events with partner preferences and curate 3 gift options within budget parameters.',
  board: 'Will compile stances from all 12 advisors on pending decisions, aggregate confidence scores, and flag dissenting views.',
};

interface OpenControlPanelProps {
  onAction: (actionId: string) => void;
}

export function OpenControlPanel({ onAction }: OpenControlPanelProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleExecute = () => {
    if (selectedAction) {
      onAction(selectedAction);
      setSelectedAction(null);
    }
  };

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div>
        <h2 className="text-lg font-medium text-foreground">
          What would you like me to do?
        </h2>
        <p className="text-sm mt-1 text-muted-foreground">
          Select an action to preview execution.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {OPEN_ACTIONS.map((action, i) => (
          <motion.button
            key={action.id}
            onClick={() => setSelectedAction(action.id)}
            className="text-left p-4 rounded-2xl group transition-all duration-300 bg-card border border-border"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            whileHover={{
              y: -2,
              boxShadow: '0 8px 30px hsl(270 91% 55% / 0.1), 0 0 0 1px hsl(270 91% 55% / 0.2)',
            }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 rounded-xl"
                  style={{ background: 'hsl(270 91% 55% / 0.1)' }}>
                  <span style={{ color: 'hsl(270 91% 55%)' }}>{ACTION_ICONS[action.id]}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{action.label}</p>
                  <p className="text-xs mt-0.5 text-muted-foreground">{action.description}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 mt-1 opacity-0 group-hover:opacity-60 transition-opacity"
                style={{ color: 'hsl(270 91% 55%)' }} />
            </div>
          </motion.button>
        ))}
      </div>

      {/* Action Detail Sheet */}
      <AnimatePresence>
        {selectedAction && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setSelectedAction(null)}
            />
            <motion.div
              className="relative w-full max-w-md rounded-3xl p-6 space-y-5 bg-card border border-border"
              style={{ boxShadow: '0 25px 60px hsl(var(--border) / 0.4)' }}
              initial={{ opacity: 0, y: 60, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                onClick={() => setSelectedAction(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-muted"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl"
                  style={{ background: 'hsl(270 91% 55% / 0.1)' }}>
                  <span style={{ color: 'hsl(270 91% 55%)' }}>{ACTION_ICONS[selectedAction]}</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {OPEN_ACTIONS.find(a => a.id === selectedAction)?.label}
                  </p>
                  <p className="text-xs text-muted-foreground">Execution Preview</p>
                </div>
              </div>

              <div className="rounded-2xl p-4 bg-muted/50 border border-border">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {ACTION_PREVIEWS[selectedAction]}
                </p>
              </div>

              <div className="flex items-center gap-2 px-1">
                <ShieldCheck className="h-4 w-4" style={{ color: 'hsl(150 60% 45%)' }} />
                <span className="text-xs font-medium" style={{ color: 'hsl(150 60% 45%)' }}>
                  Policy Gate: PASS — No approval escalation required
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedAction(null)}
                  className="flex-1 py-2.5 rounded-2xl text-sm font-medium text-muted-foreground bg-muted transition-colors hover:bg-muted/80"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleExecute}
                  className="flex-1 py-2.5 rounded-2xl text-sm font-medium text-white inline-flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, hsl(270 91% 55%), hsl(38 95% 54%))',
                    boxShadow: '0 4px 16px hsl(270 91% 55% / 0.3)',
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Play className="h-3.5 w-3.5" />
                  Execute
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
