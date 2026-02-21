import { motion } from 'framer-motion';
import type { Receipt } from '../contracts';
import { CheckCircle, Hash } from 'lucide-react';

interface ReceiptTimelineProps {
  receipts: Receipt[];
  onViewReceipt: (receipt: Receipt) => void;
}

export function ReceiptTimeline({ receipts, onViewReceipt }: ReceiptTimelineProps) {
  if (receipts.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-xs text-muted-foreground text-center">No receipts yet. Approve actions to generate receipts.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Receipt Chain</h3>
      <div className="space-y-2">
        {receipts.map((receipt, i) => (
          <motion.button
            key={receipt.id}
            onClick={() => onViewReceipt(receipt)}
            className="w-full text-left p-3 rounded-md border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-xs font-medium text-foreground capitalize">{receipt.category}</span>
              </div>
              <span className="text-xs text-muted-foreground">#{receipt.chainIndex}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">{receipt.summary}</p>
            <div className="flex items-center gap-1 mt-1.5">
              <Hash className="h-2.5 w-2.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-mono">{receipt.hash.slice(0, 16)}...</span>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
