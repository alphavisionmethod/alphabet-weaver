import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Receipt } from '../../types';
import { FileCheck, Shield } from 'lucide-react';
import { ProveItDrawer } from './ProveItDrawer';

interface ReceiptCardProps {
  receipt: Receipt;
}

export function ReceiptCard({ receipt }: ReceiptCardProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/40 bg-card/60 p-3 space-y-2"
      >
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <FileCheck className="h-3 w-3 text-emerald-400" />
          </div>
          <span className="text-xs font-medium text-foreground">Receipt Minted</span>
          <span className="ml-auto text-[9px] text-muted-foreground font-mono">{receipt.mode}</span>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
          <div><span className="text-muted-foreground">ID:</span> <span className="text-foreground font-mono">{receipt.receiptId.slice(0, 18)}…</span></div>
          <div><span className="text-muted-foreground">Cost:</span> <span className="text-foreground">${(receipt.costCents / 100).toFixed(2)}</span></div>
          <div><span className="text-muted-foreground">Correlation:</span> <span className="text-foreground font-mono">{receipt.correlationId.slice(0, 16)}…</span></div>
          <div><span className="text-muted-foreground">Capability:</span> <span className="text-foreground font-mono">{receipt.capabilityId}</span></div>
        </div>

        <p className="text-[10px] text-muted-foreground">{receipt.summary}</p>

        {/* Prove It button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-full py-1.5 rounded-lg bg-primary/5 border border-primary/15 text-primary text-[10px] font-semibold hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5"
        >
          <Shield className="h-3 w-3" />
          Prove It
        </button>
      </motion.div>

      <ProveItDrawer receipt={receipt} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
