import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { simulateAttack } from '../../lib/investorSimEngine';
import type { AttackAttempt, AttackType } from '../../contracts/investor';
import { AlertTriangle, ShieldOff, Repeat, Edit3, Ban, DollarSign, WifiOff, UserX } from 'lucide-react';

const ATTACKS: { type: AttackType; label: string; icon: React.ReactNode; description: string }[] = [
  { type: 'prompt_injection', label: 'Prompt Injection', icon: <AlertTriangle className="w-4 h-4" />, description: 'Inject malicious instruction to bypass rules' },
  { type: 'replay', label: 'Replay Attack', icon: <Repeat className="w-4 h-4" />, description: 'Resubmit an already-executed ticket' },
  { type: 'tamper', label: 'Tampered Signature', icon: <Edit3 className="w-4 h-4" />, description: 'Modify payload but keep original signature' },
  { type: 'sanctions', label: 'Sanctions Recipient', icon: <Ban className="w-4 h-4" />, description: 'Send payment to OFAC-listed entity' },
  { type: 'budget_exceeded', label: 'Budget Exceeded', icon: <DollarSign className="w-4 h-4" />, description: 'Action cost exceeds policy budget cap' },
  { type: 'connector_down', label: 'Connector Down', icon: <WifiOff className="w-4 h-4" />, description: 'Target connector unreachable' },
  { type: 'insider', label: 'Insider Bypass', icon: <UserX className="w-4 h-4" />, description: 'Direct connector call skipping pipeline' },
];

const SEVERITY_COLORS: Record<string, string> = {
  LOW: 'text-emerald-400',
  MEDIUM: 'text-amber-400',
  HIGH: 'text-orange-400',
  CRITICAL: 'text-red-400',
};

export function AttackSimulator() {
  const [results, setResults] = useState<AttackAttempt[]>([]);
  const [running, setRunning] = useState<string | null>(null);

  const handleAttack = useCallback(async (type: AttackType) => {
    setRunning(type);
    const result = await simulateAttack(type);
    setResults(prev => [result, ...prev]);
    setRunning(null);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Attack Simulator</h3>
        <p className="text-sm text-muted-foreground">Test 7 attack vectors. Every attempt produces a REFUSED receipt and ledger block.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {ATTACKS.map(atk => (
          <button
            key={atk.type}
            onClick={() => handleAttack(atk.type)}
            disabled={running === atk.type}
            className="text-left rounded-xl p-4 transition-all hover:scale-[1.02]"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-400">{atk.icon}</span>
              <span className="text-sm font-medium text-foreground">{atk.label}</span>
            </div>
            <p className="text-xs text-muted-foreground">{atk.description}</p>
            {running === atk.type && (
              <div className="mt-2 text-xs text-amber-400 animate-pulse">Running…</div>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Attack</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Verdict</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Severity</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Latency</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <motion.tr
                      key={r.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <td className="px-4 py-3 text-foreground font-medium">{r.attackType.replace('_', ' ')}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-400">{r.verdict}</span>
                      </td>
                      <td className={`px-4 py-3 text-xs font-medium ${SEVERITY_COLORS[r.severity]}`}>{r.severity}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{r.latencyMs}ms</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs">{r.reason}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
