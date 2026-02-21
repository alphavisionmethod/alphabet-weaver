import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { triggerPanic, cryptoShred, resetInvestorLedger } from '../../lib/investorSimEngine';
import type { PanicEvent } from '../../contracts/investor';
import { AlertOctagon, Skull, ShieldOff } from 'lucide-react';

export function PanicModePanel() {
  const [panicActive, setPanicActive] = useState(false);
  const [events, setEvents] = useState<PanicEvent[]>([]);
  const [shredded, setShredded] = useState(false);

  const handlePanic = useCallback(async () => {
    const evt = await triggerPanic('Manual activation');
    setEvents(prev => [evt, ...prev]);
    setPanicActive(true);
  }, []);

  const handleShred = useCallback(async () => {
    const evt = await cryptoShred();
    setEvents(prev => [evt, ...prev]);
    setShredded(true);
    setTimeout(() => {
      resetInvestorLedger();
    }, 1500);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Panic Mode</h3>
        <p className="text-sm text-muted-foreground">Kill switch simulation. Lock all outbound execution instantly.</p>
      </div>

      <AnimatePresence>
        {panicActive && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0 }}
            className="rounded-xl p-5 text-center"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)' }}
          >
            <AlertOctagon className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <h4 className="text-base font-bold text-red-400 mb-1">PANIC MODE: OUTBOUND LOCKED</h4>
            <p className="text-xs text-red-300/70">All execution suspended. Only REFUSED receipts permitted. Manual override required.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        <button
          onClick={handlePanic}
          disabled={panicActive}
          className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
          style={{
            background: panicActive ? 'rgba(239,68,68,0.1)' : 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#ef4444',
          }}
        >
          <ShieldOff className="w-4 h-4" />
          {panicActive ? 'Panic Active' : 'Activate Kill Switch'}
        </button>

        {panicActive && !shredded && (
          <motion.button
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleShred}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'rgba(239,68,68,0.25)',
              border: '1px solid rgba(239,68,68,0.5)',
              color: '#fca5a5',
            }}
          >
            <Skull className="w-4 h-4" />
            Crypto-Shred & Tombstone
          </motion.button>
        )}
      </div>

      {shredded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl p-5 text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Skull className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Session keys destroyed. Ledger sealed. All local data purged.</p>
        </motion.div>
      )}

      {events.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Event Log</h4>
          {events.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl p-3 text-xs"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-medium">{e.action}</span>
                <span className="text-muted-foreground">{e.severity}</span>
                <span className="ml-auto text-muted-foreground font-mono">{new Date(e.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-muted-foreground">{e.details}</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
