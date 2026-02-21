import { motion } from 'framer-motion';
import type { SimResult } from '../../lib/simulationEngine';
import { CheckCircle, Hash, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

const TYPE_ICONS: Record<string, string> = {
  lead_recovery: '👥',
  insurance_quote: '🛡️',
  gift: '🎁',
  investing: '📊',
  travel: '✈️',
};

interface ReceiptTimelinePremiumProps {
  receipts: SimResult[];
}

export function ReceiptTimelinePremium({ receipts }: ReceiptTimelinePremiumProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (receipts.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Receipt Timeline
      </h3>
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

        <div className="space-y-3">
          {receipts.map((receipt, i) => {
            const expanded = expandedId === receipt.id;
            return (
              <motion.button
                key={receipt.id}
                onClick={() => setExpandedId(expanded ? null : receipt.id)}
                className="w-full text-left pl-10 relative"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <div className="absolute left-3.5 top-3 w-3 h-3 rounded-full border-2 bg-card"
                  style={{ borderColor: 'hsl(270 91% 55%)' }} />

                <div className={`rounded-2xl p-3.5 transition-all border ${expanded ? 'bg-card border-border shadow-md' : 'bg-muted/50 border-transparent'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{TYPE_ICONS[receipt.type] || '📋'}</span>
                      <span className="text-sm font-medium text-foreground">{receipt.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" style={{ color: 'hsl(150 60% 45%)' }} />
                        <span className="text-[10px] font-medium" style={{ color: 'hsl(150 60% 45%)' }}>
                          {Math.round(receipt.confidence * 100)}%
                        </span>
                      </div>
                      {expanded ? (
                        <ChevronUp className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 pt-3 space-y-2 border-t border-border"
                    >
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {receipt.description}
                      </p>

                      {/* Policy verdict */}
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="h-3 w-3" style={{ color: 'hsl(270 91% 55%)' }} />
                        <span className="text-[10px] font-semibold uppercase" style={{ color: 'hsl(270 91% 55%)' }}>
                          Policy: {receipt.policyVerdict}
                        </span>
                      </div>

                      {receipt.simulatedSavings && (
                        <p className="text-xs font-medium" style={{ color: 'hsl(38 95% 54%)' }}>
                          Estimated savings: ${receipt.simulatedSavings.toLocaleString()}
                        </p>
                      )}

                      {/* Receipt hash + correlation */}
                      <div className="space-y-1 mt-1">
                        <div className="flex items-center gap-1">
                          <Hash className="h-2.5 w-2.5 text-muted-foreground" />
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {receipt.receiptHash}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-mono text-muted-foreground ml-3.5">
                            cor: {receipt.correlationId}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
