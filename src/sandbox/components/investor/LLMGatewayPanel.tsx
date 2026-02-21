import { motion } from 'framer-motion';
import { getLLMCalls, getLLMTotals } from '../../lib/investorSimEngine';
import { Cpu, Cloud, Zap, DollarSign } from 'lucide-react';

const PROVIDER_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  local: { label: 'Local (sita-7b)', icon: <Cpu className="w-4 h-4" />, color: 'hsl(270 91% 65%)' },
  openai: { label: 'OpenAI', icon: <Cloud className="w-4 h-4" />, color: 'hsl(150 60% 50%)' },
  anthropic: { label: 'Anthropic', icon: <Zap className="w-4 h-4" />, color: 'hsl(38 95% 54%)' },
};

export function LLMGatewayPanel() {
  const calls = getLLMCalls();
  const totals = getLLMTotals();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">LLM Gateway</h3>
        <p className="text-sm text-muted-foreground">Intelligent routing: local → OpenAI → Anthropic. Cost tracking, caching, and fallback simulation.</p>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Calls', value: totals.totalCalls.toString() },
          { label: 'Total Cost', value: `$${totals.totalCost.toFixed(4)}` },
          { label: 'Cache Hits', value: totals.cacheHits.toString() },
          { label: 'Budget Left', value: `$${totals.budgetRemaining.toFixed(2)}` },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
            <div className="text-lg font-semibold text-foreground">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Calls table */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                {['Provider', 'Model', 'Purpose', 'Tokens', 'Cost', 'Latency', 'Cached', 'Fallback'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calls.map((c, i) => {
                const pm = PROVIDER_META[c.provider];
                return (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5" style={{ color: pm.color }}>
                        {pm.icon}<span className="text-xs">{pm.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-foreground font-mono">{c.model}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.purpose}</td>
                    <td className="px-4 py-3 text-xs text-foreground font-mono">{c.tokensIn}→{c.tokensOut}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{c.costUsd > 0 ? `$${c.costUsd.toFixed(4)}` : 'Free'}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{c.latencyMs}ms</td>
                    <td className="px-4 py-3">{c.cached && <span className="px-1.5 py-0.5 rounded text-xs bg-emerald-500/10 text-emerald-400">HIT</span>}</td>
                    <td className="px-4 py-3">{c.fallbackUsed && <span className="px-1.5 py-0.5 rounded text-xs bg-amber-500/10 text-amber-400">YES</span>}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <DollarSign className="w-3.5 h-3.5" />
        Avg latency: {totals.avgLatency}ms · Fallbacks: {totals.fallbacks} · Tokens: {totals.totalTokensIn + totals.totalTokensOut} total
      </div>
    </div>
  );
}
