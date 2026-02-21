import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertOctagon, X, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RedTeamPopupProps {
  show: boolean;
  onDismiss: () => void;
}

export function RedTeamPopup({ show, onDismiss }: RedTeamPopupProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onDismiss} />
          <motion.div
            className="relative w-full max-w-md rounded-lg border border-destructive/30 bg-card p-5 space-y-4 shadow-lg"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-destructive">
                <AlertOctagon className="h-4 w-4" />
                <span className="text-sm font-semibold">Risk Advisor Disagrees</span>
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDismiss}>
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-md bg-primary/5 border border-primary/20">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Primary Recommendation</p>
                <p className="text-xs text-foreground">
                  Proceed with investment opportunity. Medium confidence, acceptable risk-reward ratio.
                </p>
              </div>

              <div className="p-3 rounded-md bg-destructive/5 border border-destructive/20">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Risk Critique</p>
                <p className="text-xs text-foreground">
                  Market volatility is 23% above 90-day average. Similar timing in Q3 2024 led to 15% drawdown.
                  Liquidity conditions unfavorable for this asset class.
                </p>
              </div>

              <div className="p-3 rounded-md bg-muted/50 border border-border">
                <div className="flex items-center gap-1.5 mb-1">
                  <Scale className="h-3 w-3 text-accent" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Weighted Outcome</p>
                </div>
                <p className="text-xs text-foreground">
                  Risk-adjusted recommendation: <span className="text-accent font-medium">Defer 14 days</span>.
                  Re-evaluate when volatility normalizes. No action taken.
                </p>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
              Multi-agent governance · Not a single model opinion
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
