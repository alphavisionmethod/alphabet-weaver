import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Users, Lock } from 'lucide-react';

export function TenantIsolationPreview() {
  const [bleedAttempted, setBleedAttempted] = useState(false);

  const TENANTS = [
    { id: 'tenant_alpha', name: 'Tenant Alpha', color: 'hsl(270 91% 65%)' },
    { id: 'tenant_beta', name: 'Tenant Beta', color: 'hsl(38 95% 54%)' },
    { id: 'tenant_gamma', name: 'Tenant Gamma', color: 'hsl(210 80% 60%)' },
  ];

  const RULES = [
    'Memory silo: Each tenant has isolated execution context',
    'Data boundary: No cross-tenant data access permitted',
    'Learning boundary: Model adaptations are anonymized and tenant-scoped',
    'Ledger isolation: Receipt chains are tenant-partitioned',
    'Key rotation: Tenant keys are independently rotated on 24h cycle',
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Tenant Isolation</h3>
        <p className="text-sm text-muted-foreground">Multi-tenant boundary enforcement. Zero cross-tenant data bleed.</p>
      </div>

      {/* Tenant visualization */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TENANTS.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-xl p-5 text-center"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${bleedAttempted && i > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            <div className="w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center"
              style={{ background: `${t.color}20`, color: t.color }}>
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-medium text-foreground mb-1">{t.name}</h4>
            <div className="flex items-center justify-center gap-1 text-xs text-emerald-400">
              <Lock className="w-3 h-3" />
              Isolated
            </div>
          </motion.div>
        ))}
      </div>

      {/* Rules */}
      <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <h4 className="text-sm font-medium text-foreground mb-3">Isolation Rules</h4>
        <ul className="space-y-2">
          {RULES.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: 'hsl(270 91% 65%)' }} />
              {r}
            </li>
          ))}
        </ul>
      </div>

      {/* Bleed test */}
      <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-foreground">Cross-Tenant Bleed Test</h4>
          <button
            onClick={() => setBleedAttempted(true)}
            disabled={bleedAttempted}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
            style={{
              background: bleedAttempted ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: bleedAttempted ? '#ef4444' : 'rgba(255,255,255,0.7)',
            }}
          >
            {bleedAttempted ? 'Blocked' : 'Simulate Bleed Attempt'}
          </button>
        </div>

        {bleedAttempted && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg p-4"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-sm font-medium text-red-400">BLOCKED</span>
            </div>
            <p className="text-xs text-red-300/70">
              Cross-tenant data access attempt from Tenant Alpha → Tenant Beta refused.
              Security receipt generated. Incident logged to audit ledger.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
