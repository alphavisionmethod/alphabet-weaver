import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { verifyLedger, getLedgerBlocks } from '../../lib/investorSimEngine';
import type { InvestorLedgerBlock } from '../../contracts/investor';
import { CheckCircle, XCircle, Link as LinkIcon, RefreshCw } from 'lucide-react';

export function LedgerVerifier() {
  const [blocks, setBlocks] = useState<InvestorLedgerBlock[]>(getLedgerBlocks());
  const [valid, setValid] = useState<boolean | null>(null);
  const [brokenAt, setBrokenAt] = useState<number | undefined>();
  const [verifying, setVerifying] = useState(false);

  const verify = useCallback(async () => {
    setVerifying(true);
    const result = await verifyLedger();
    setBlocks(result.blocks);
    setValid(result.valid);
    setBrokenAt(result.brokenAt);
    setVerifying(false);
  }, []);

  const refresh = useCallback(() => {
    setBlocks(getLedgerBlocks());
    setValid(null);
    setBrokenAt(undefined);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Ledger Verifier</h3>
          <p className="text-sm text-muted-foreground">Hash-chain integrity check with merkle root computation.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={refresh} className="p-2 rounded-lg transition-colors hover:bg-muted">
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={verify}
            disabled={verifying || blocks.length === 0}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, hsl(270 91% 55%), hsl(38 95% 54%))', color: '#fff' }}
          >
            {verifying ? 'Verifying…' : 'Verify Chain'}
          </button>
        </div>
      </div>

      {valid !== null && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl p-4"
          style={{
            background: valid ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${valid ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.3)'}`,
          }}
        >
          {valid ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
          <span className="text-sm font-medium text-foreground">
            {valid ? `Chain valid — ${blocks.length} blocks verified` : `Chain broken at block ${brokenAt}`}
          </span>
        </motion.div>
      )}

      {blocks.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">No ledger blocks yet. Run pipeline or attack simulations to generate blocks.</p>
      ) : (
        <div className="space-y-2">
          {blocks.map((block, i) => (
            <motion.div
              key={block.blockNumber}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="rounded-xl p-4 flex items-start gap-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                  style={{ background: 'hsl(270 91% 55% / 0.15)', color: 'hsl(270 91% 65%)' }}>
                  {block.blockNumber}
                </div>
                {i < blocks.length - 1 && <LinkIcon className="w-3 h-3 text-muted-foreground" />}
              </div>
              <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
                <div><span className="text-muted-foreground">Type: </span><span className="text-foreground">{block.eventType}</span></div>
                <div><span className="text-muted-foreground">Time: </span><span className="text-foreground font-mono">{new Date(block.createdAt).toLocaleTimeString()}</span></div>
                <div className="sm:col-span-2"><span className="text-muted-foreground">Block Hash: </span><span className="text-foreground font-mono break-all">{block.blockHash.slice(0, 32)}…</span></div>
                <div className="sm:col-span-2"><span className="text-muted-foreground">Prev Hash: </span><span className="text-foreground font-mono break-all">{block.previousHash.slice(0, 32)}…</span></div>
                <div><span className="text-muted-foreground">Merkle: </span><span className="text-foreground font-mono">{block.merkleRoot.slice(0, 16)}…</span></div>
                <div><span className="text-muted-foreground">Sig: </span><span className="text-foreground font-mono">{block.signature.slice(0, 16)}…</span></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
