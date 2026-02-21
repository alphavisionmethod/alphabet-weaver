import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDemo } from '../../store';
import { generateDriftScenarios, generateExperiments } from '../../systemIntelligence';
import type { DriftScenario, Experiment } from '../../systemIntelligence';
import { Flame, Beaker, AlertOctagon, Play, Pause, Lock } from 'lucide-react';

function ScenarioCard({ scenario, onRun }: { scenario: DriftScenario; onRun: () => void }) {
  const [running, setRunning] = useState(false);

  const handleRun = useCallback(() => {
    setRunning(true);
    setTimeout(() => { setRunning(false); onRun(); }, 1200);
  }, [onRun]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-border/30 bg-card/40 p-2 space-y-1.5"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-foreground">{scenario.name}</span>
        <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${
          scenario.status === 'pass' ? 'bg-emerald-500/10 text-emerald-400' :
          scenario.status === 'warn' ? 'bg-amber-500/10 text-amber-400' :
          'bg-red-500/10 text-red-400'
        }`}>
          {scenario.status.toUpperCase()}
        </span>
      </div>

      <div className="flex items-center gap-3 text-[8px] text-muted-foreground">
        <span>Type: {scenario.type.replace('_', ' ')}</span>
        <span>Severity: {(scenario.severity * 100).toFixed(0)}%</span>
      </div>

      {/* Robustness bar */}
      <div className="flex items-center gap-2">
        <span className="text-[8px] text-muted-foreground w-16">Robustness</span>
        <div className="flex-1 h-1.5 rounded-full bg-muted/20 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${scenario.robustness_score > 0.7 ? 'bg-emerald-400/60' : scenario.robustness_score > 0.5 ? 'bg-amber-400/60' : 'bg-red-400/60'}`}
            initial={{ width: 0 }}
            animate={{ width: `${scenario.robustness_score * 100}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
        <span className="text-[8px] font-mono text-foreground">{(scenario.robustness_score * 100).toFixed(0)}%</span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[8px] text-muted-foreground">Worst-case regret: {(scenario.worst_case_regret * 100).toFixed(0)}%</span>
        <button
          onClick={handleRun}
          disabled={running}
          className="px-2 py-0.5 rounded bg-primary/5 border border-primary/15 text-[8px] text-primary font-semibold hover:bg-primary/10"
        >
          {running ? '⏳ Simulating…' : '▶ Stress Test'}
        </button>
      </div>
    </motion.div>
  );
}

export function AdversarialDriftPanel() {
  const { settings } = useDemo();
  const scenarios = generateDriftScenarios(settings.seed);
  const [testedCount, setTestedCount] = useState(0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-semibold text-foreground">Adversarial Drift Simulator</span>
        </div>
        <span className="text-[8px] text-muted-foreground">{testedCount}/{scenarios.length} tested</span>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {scenarios.map((s, i) => (
          <ScenarioCard key={s.id} scenario={s} onRun={() => setTestedCount(c => c + 1)} />
        ))}
      </div>

      {/* Robustness certificate */}
      {testedCount >= 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-2 text-center"
        >
          <span className="text-[9px] font-bold text-emerald-400">🏅 Robustness Certificate Issued</span>
          <p className="text-[8px] text-muted-foreground mt-0.5">Avg robustness: {(scenarios.reduce((s, sc) => s + sc.robustness_score, 0) / scenarios.length * 100).toFixed(0)}%</p>
        </motion.div>
      )}
    </div>
  );
}

function ExperimentCard({ experiment }: { experiment: Experiment }) {
  const statusConfig = {
    proposed: { icon: Play, color: 'text-muted-foreground', bg: 'bg-muted/10' },
    running: { icon: Play, color: 'text-primary', bg: 'bg-primary/5' },
    completed: { icon: Play, color: 'text-emerald-400', bg: 'bg-emerald-500/5' },
    frozen: { icon: Lock, color: 'text-red-400', bg: 'bg-red-500/5' },
  };
  const cfg = statusConfig[experiment.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border border-border/30 ${cfg.bg} p-2 space-y-1.5`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {experiment.circuit_breaker && <AlertOctagon className="h-3 w-3 text-red-400" />}
          <span className="text-[10px] font-medium text-foreground">{experiment.variable}</span>
        </div>
        <span className={`text-[8px] font-bold ${cfg.color}`}>{experiment.status.toUpperCase()}</span>
      </div>

      <div className="text-[9px] font-mono text-primary/70">{experiment.intervention}</div>

      <div className="grid grid-cols-3 gap-2 text-[8px]">
        <div>
          <span className="text-muted-foreground">Lift: </span>
          <span className={experiment.expected_lift >= 0 ? 'text-emerald-400' : 'text-red-400'}>
            {experiment.expected_lift >= 0 ? '+' : ''}{(experiment.expected_lift * 100).toFixed(0)}%
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Info: </span>
          <span className="text-foreground">{(experiment.info_gain * 100).toFixed(0)}%</span>
        </div>
        <div>
          <span className="text-muted-foreground">Risk: </span>
          <span className={experiment.risk_score > 0.3 ? 'text-red-400' : 'text-foreground'}>
            {(experiment.risk_score * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {experiment.circuit_breaker && (
        <div className="rounded bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 text-[8px] text-red-400 font-semibold">
          🔒 Circuit breaker tripped — intervention frozen
        </div>
      )}
    </motion.div>
  );
}

export function ExperimentPanel() {
  const { settings } = useDemo();
  const experiments = generateExperiments(settings.seed);

  const active = experiments.filter(e => e.status === 'running').length;
  const frozen = experiments.filter(e => e.circuit_breaker).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Beaker className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-semibold text-foreground">Safe Micro-Experiments</span>
        </div>
        <div className="flex gap-2 text-[8px]">
          <span className="text-primary">{active} active</span>
          {frozen > 0 && <span className="text-red-400">{frozen} frozen</span>}
        </div>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {experiments.map(e => (
          <ExperimentCard key={e.id} experiment={e} />
        ))}
      </div>
    </div>
  );
}
