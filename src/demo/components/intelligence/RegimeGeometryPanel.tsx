import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDemo } from '../../store';
import { generateRegimeTrajectory, generateConfidenceDecay, generateReliabilityState } from '../../systemIntelligence';
import { Globe, TrendingDown } from 'lucide-react';

export function RegimeGeometryPanel() {
  const { activeWorkflow, workflows, settings } = useDemo();

  const points = useMemo(
    () => generateRegimeTrajectory(activeWorkflow, workflows, settings.seed),
    [activeWorkflow, workflows, settings.seed]
  );

  const lastPoint = points[points.length - 1];
  const velocity = lastPoint?.velocity ?? 0;
  const curvature = lastPoint?.curvature ?? 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <Globe className="h-3.5 w-3.5 text-primary" />
        <span className="text-[11px] font-semibold text-foreground">Regime Geometry</span>
      </div>

      {/* 2D Embedding Visualization */}
      <div className="relative h-40 rounded-lg bg-muted/10 border border-border/20 overflow-hidden">
        <svg viewBox="0 0 300 300" className="w-full h-full">
          {/* Grid */}
          {[50, 100, 150, 200, 250].map(v => (
            <g key={v}>
              <line x1={v} y1={0} x2={v} y2={300} className="stroke-border/10" strokeWidth="0.5" />
              <line x1={0} y1={v} x2={300} y2={v} className="stroke-border/10" strokeWidth="0.5" />
            </g>
          ))}

          {/* Trajectory path */}
          <motion.path
            d={points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')}
            fill="none"
            strokeWidth="1.5"
            className="stroke-primary/40"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: 'easeOut' }}
          />

          {/* Points */}
          {points.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={i === points.length - 1 ? 5 : 1.5}
              className={i === points.length - 1 ? 'fill-primary' : 'fill-primary/20'}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            />
          ))}

          {/* Current position label */}
          {lastPoint && (
            <text x={lastPoint.x + 8} y={lastPoint.y - 8} className="fill-primary text-[10px] font-mono font-bold">
              NOW
            </text>
          )}

          {/* Velocity vector */}
          {points.length > 1 && lastPoint && (
            <motion.line
              x1={lastPoint.x}
              y1={lastPoint.y}
              x2={lastPoint.x + (lastPoint.x - points[points.length - 2].x) * 15}
              y2={lastPoint.y + (lastPoint.y - points[points.length - 2].y) * 15}
              className="stroke-amber-400"
              strokeWidth="1.5"
              strokeDasharray="3 2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ delay: 1.5 }}
              markerEnd="url(#arrowhead)"
            />
          )}

          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" className="fill-amber-400" />
            </marker>
          </defs>
        </svg>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-card/40 border border-border/20 p-2">
          <span className="text-[8px] text-muted-foreground">Velocity |v|</span>
          <p className={`text-sm font-bold font-mono ${velocity > 0.1 ? 'text-amber-400' : 'text-foreground'}`}>
            {velocity.toFixed(3)}
          </p>
        </div>
        <div className="rounded-lg bg-card/40 border border-border/20 p-2">
          <span className="text-[8px] text-muted-foreground">Curvature κ</span>
          <p className={`text-sm font-bold font-mono ${curvature > 0.05 ? 'text-red-400' : 'text-foreground'}`}>
            {curvature.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function ConfidenceDecayPanel() {
  const { activeWorkflow, workflows, settings } = useDemo();

  const reliability = useMemo(
    () => generateReliabilityState(activeWorkflow, workflows, settings.seed),
    [activeWorkflow, workflows, settings.seed]
  );

  const decay = useMemo(
    () => generateConfidenceDecay(reliability.p_reliable, activeWorkflow, settings.seed),
    [reliability.p_reliable, activeWorkflow, settings.seed]
  );

  const minP = Math.min(...decay.map(d => d.p_reliable));
  const steepDecay = decay[decay.length - 1].p_reliable < 0.5;

  // SVG chart
  const width = 280;
  const height = 100;
  const padding = { top: 10, right: 10, bottom: 20, left: 30 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const pathD = decay.map((d, i) => {
    const x = padding.left + (d.horizon / 50) * chartW;
    const y = padding.top + (1 - d.p_reliable) * chartH;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Threshold line at 0.7
  const thresholdY = padding.top + (1 - 0.7) * chartH;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <TrendingDown className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-semibold text-foreground">Confidence Decay Forecast</span>
        </div>
        {steepDecay && (
          <span className="text-[8px] text-red-400 font-semibold animate-pulse">⚠ STEEP DECAY</span>
        )}
      </div>

      <div className="rounded-lg bg-muted/10 border border-border/20 p-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
          {/* Threshold line */}
          <line x1={padding.left} y1={thresholdY} x2={width - padding.right} y2={thresholdY}
            className="stroke-red-400/30" strokeWidth="1" strokeDasharray="4 3" />
          <text x={width - padding.right - 2} y={thresholdY - 3} textAnchor="end" className="fill-red-400/40 text-[7px]">
            L1 threshold
          </text>

          {/* Decay curve */}
          <motion.path
            d={pathD}
            fill="none"
            strokeWidth="2"
            className={steepDecay ? 'stroke-red-400' : 'stroke-primary'}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />

          {/* Fill area */}
          <motion.path
            d={`${pathD} L ${width - padding.right} ${padding.top + chartH} L ${padding.left} ${padding.top + chartH} Z`}
            className={steepDecay ? 'fill-red-400/5' : 'fill-primary/5'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          />

          {/* Axes labels */}
          <text x={padding.left} y={height - 2} className="fill-muted-foreground text-[7px]">0</text>
          <text x={width - padding.right} y={height - 2} textAnchor="end" className="fill-muted-foreground text-[7px]">+50 decisions</text>
          <text x={2} y={padding.top + 3} className="fill-muted-foreground text-[7px]">1.0</text>
          <text x={2} y={padding.top + chartH} className="fill-muted-foreground text-[7px]">0.0</text>
        </svg>
      </div>

      <div className="flex items-center gap-3 text-[9px]">
        <div>
          <span className="text-muted-foreground">Now: </span>
          <span className="font-bold text-foreground">{(reliability.p_reliable * 100).toFixed(0)}%</span>
        </div>
        <div>
          <span className="text-muted-foreground">+20 dec: </span>
          <span className="font-bold text-foreground">{(decay.find(d => d.horizon === 20)?.p_reliable ?? 0 * 100).toFixed(0)}%</span>
        </div>
        <div>
          <span className="text-muted-foreground">+50 dec: </span>
          <span className={`font-bold ${decay[decay.length - 1].p_reliable < 0.5 ? 'text-red-400' : 'text-foreground'}`}>
            {(decay[decay.length - 1].p_reliable * 100).toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}
