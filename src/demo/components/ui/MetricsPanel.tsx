import { motion, AnimatePresence } from 'framer-motion';
import { useDemo } from '../../store';
import { BarChart3, Shield, Wrench, Receipt, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useMemo } from 'react';

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="tabular-nums font-bold text-foreground"
    >
      {value}{suffix}
    </motion.span>
  );
}

function MiniSparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const w = 48;
  const h = 16;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');

  return (
    <svg width={w} height={h} className="opacity-50">
      <polyline
        points={points}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MetricsPanel() {
  const [open, setOpen] = useState(false);
  const { workflows, receipts, activityLog } = useDemo();

  const metrics = useMemo(() => {
    const allGates = Object.values(workflows).flatMap(w => w.policyGates);
    const allTools = Object.values(workflows).flatMap(w => w.toolCalls);
    const totalCost = receipts.reduce((s, r) => s + r.costCents, 0);
    const passed = allGates.filter(g => g.verdict === 'PASS').length;
    const escalated = allGates.filter(g => g.verdict === 'ESCALATE').length;
    const denied = allGates.filter(g => g.verdict === 'DENY').length;

    return {
      totalCost,
      gatesPassed: passed,
      gatesEscalated: escalated,
      gatesDenied: denied,
      toolCalls: allTools.length,
      receiptsMinted: receipts.length,
    };
  }, [workflows, receipts]);

  // Build sparkline data from activity log
  const sparkData = useMemo(() => {
    const chunks: number[] = [];
    const chunkSize = Math.max(1, Math.floor(activityLog.length / 8));
    for (let i = 0; i < activityLog.length; i += chunkSize) {
      chunks.push(activityLog.slice(i, i + chunkSize).length);
    }
    return chunks.length > 1 ? chunks : [0, 0];
  }, [activityLog]);

  return (
    <div className="border-l border-border/20">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        title="Metrics"
      >
        <BarChart3 className="h-4 w-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden px-3 pb-3"
          >
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Live Metrics
            </h3>
            <div className="space-y-3">
              {/* Cost */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Receipt className="w-3 h-3" />
                  <span>Cost</span>
                </div>
                <AnimatedCounter value={metrics.totalCost} suffix="¢" />
              </div>

              {/* Policy Gates */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Shield className="w-3 h-3" />
                  <span>Gates</span>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <span className="text-emerald-400">{metrics.gatesPassed}✓</span>
                  {metrics.gatesEscalated > 0 && <span className="text-amber-400">{metrics.gatesEscalated}⚠</span>}
                  {metrics.gatesDenied > 0 && <span className="text-red-400">{metrics.gatesDenied}✕</span>}
                </div>
              </div>

              {/* Tool Calls */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Wrench className="w-3 h-3" />
                  <span>Tools</span>
                </div>
                <AnimatedCounter value={metrics.toolCalls} />
              </div>

              {/* Receipts */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Receipt className="w-3 h-3" />
                  <span>Receipts</span>
                </div>
                <AnimatedCounter value={metrics.receiptsMinted} />
              </div>

              {/* Sparkline */}
              <div className="pt-1 border-t border-border/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[9px] text-muted-foreground">Activity</span>
                </div>
                <MiniSparkline data={sparkData} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
