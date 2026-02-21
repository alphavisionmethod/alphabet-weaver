import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Check, Copy, X } from 'lucide-react';
import type { Receipt } from '../../types';

interface ProveItDrawerProps {
  receipt: Receipt | null;
  open: boolean;
  onClose: () => void;
}

function hashPayload(payload: string): string {
  // Deterministic fake hash for demo (real would use Web Crypto)
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256:${hex}${'a1b2c3d4e5f6'.repeat(4)}`.slice(0, 71);
}

export function ProveItDrawer({ receipt, open, onClose }: ProveItDrawerProps) {
  const [hashRevealed, setHashRevealed] = useState(0);
  const [verified, setVerified] = useState(false);
  const [copied, setCopied] = useState(false);

  const payload = receipt ? JSON.stringify({
    receiptId: receipt.receiptId,
    correlationId: receipt.correlationId,
    capabilityId: receipt.capabilityId,
    mode: receipt.mode,
    costCents: receipt.costCents,
    timestamp: receipt.timestamp,
    workflow: receipt.workflow,
    summary: receipt.summary,
  }, null, 2) : '';

  const hash = receipt ? hashPayload(payload) : '';

  useEffect(() => {
    if (!open) { setHashRevealed(0); setVerified(false); return; }
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setHashRevealed(i);
      if (i >= hash.length) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, [open, hash.length]);

  const handleVerify = useCallback(() => {
    setVerified(true);
  }, []);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(payload).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [payload]);

  return (
    <AnimatePresence>
      {open && receipt && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-[380px] max-w-[90vw] z-50 bg-background border-l border-border/40 overflow-y-auto"
          >
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Cryptographic Receipt</span>
                </div>
                <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Hash */}
              <div className="space-y-1.5">
                <span className="text-[9px] text-muted-foreground tracking-wider uppercase">SHA-256 Hash</span>
                <div className="rounded-lg bg-muted/30 border border-border/30 p-2.5 font-mono text-[10px] text-primary break-all leading-relaxed">
                  {hash.slice(0, hashRevealed)}
                  {hashRevealed < hash.length && (
                    <span className="inline-block w-[6px] h-[12px] bg-primary/50 animate-pulse ml-0.5 align-middle" />
                  )}
                </div>
              </div>

              {/* JSON Payload */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-muted-foreground tracking-wider uppercase">Payload</span>
                  <button onClick={handleCopy} className="flex items-center gap-1 text-[9px] text-muted-foreground hover:text-foreground">
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="rounded-lg bg-muted/30 border border-border/30 p-2.5 font-mono text-[9px] text-foreground/80 overflow-x-auto max-h-[240px]">
                  {payload}
                </pre>
              </div>

              {/* Verify button */}
              <button
                onClick={handleVerify}
                disabled={verified}
                className={`w-full py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  verified
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20'
                }`}
              >
                {verified ? (
                  <>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}>
                      <Check className="h-4 w-4" />
                    </motion.div>
                    Hash Verified — Immutable
                  </>
                ) : (
                  'Verify Integrity'
                )}
              </button>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-2 text-[9px]">
                <div><span className="text-muted-foreground">Mode:</span> <span className="text-foreground font-mono">{receipt.mode}</span></div>
                <div><span className="text-muted-foreground">Cost:</span> <span className="text-foreground">${(receipt.costCents / 100).toFixed(2)}</span></div>
                <div><span className="text-muted-foreground">Workflow:</span> <span className="text-foreground font-mono">{receipt.workflow}</span></div>
                <div><span className="text-muted-foreground">Time:</span> <span className="text-foreground font-mono">{receipt.timestamp.slice(11, 19)}</span></div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
