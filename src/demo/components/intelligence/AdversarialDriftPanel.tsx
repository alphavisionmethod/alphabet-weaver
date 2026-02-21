import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDemo } from '../../store';
import { generateDriftScenarios, generateExperiments } from '../../systemIntelligence';
import type { DriftScenario, Experiment } from '../../systemIntelligence';
import { Flame, Beaker, AlertOctagon, Play, Lock, Check, TrendingUp, TrendingDown, Zap } from 'lucide-react';

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
        {scenarios.map((s) => (
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

// --- Interactive Experiment Results ---
interface ExperimentResult {
  observed_lift: number;
  significance: number;
  samples: number;
  verdict: 'significant' | 'inconclusive' | 'harmful';
}

function simulateResult(exp: Experiment, seed: number): ExperimentResult {
  // Deterministic simulation
  const x = Math.sin(seed * 9301 + exp.id.charCodeAt(4) * 49297) * 49297;
  const r = x - Math.floor(x);

  const noise = (r - 0.5) * 0.15;
  const observed_lift = exp.expected_lift + noise;
  const significance = 0.6 + r * 0.39;
  const samples = Math.floor(200 + r * 800);
  const verdict: ExperimentResult['verdict'] =
    observed_lift < -0.02 ? 'harmful' :
    significance > 0.85 ? 'significant' : 'inconclusive';

  return { observed_lift, significance, samples, verdict };
}

function InteractiveExperimentCard({ experiment, seed }: { experiment: Experiment; seed: number }) {
  const [status, setStatus] = useState(experiment.status);
  const [result, setResult] = useState<ExperimentResult | null>(null);
  const [circuitTripped, setCircuitTripped] = useState(experiment.circuit_breaker);

  const handleRun = useCallback(() => {
    if (status === 'frozen') return;
    setStatus('running');
    setTimeout(() => {
      const res = simulateResult(experiment, seed);
      setResult(res);
      if (res.verdict === 'harmful') {
        setCircuitTripped(true);
        setStatus('frozen');
      } else {
        setStatus('completed');
      }
    }, 1500);
  }, [experiment, seed, status]);

  const statusColors = {
    proposed: 'text-muted-foreground',
    running: 'text-primary',
    completed: 'text-emerald-400',
    frozen: 'text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg border border-border/30 p-2 space-y-1.5 ${
        circuitTripped ? 'bg-red-500/5' : status === 'completed' ? 'bg-emerald-500/5' : 'bg-card/40'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {circuitTripped && <AlertOctagon className="h-3 w-3 text-red-400" />}
          <span className="text-[10px] font-medium text-foreground">{experiment.variable}</span>
        </div>
        <span className={`text-[8px] font-bold ${statusColors[status]}`}>{status.toUpperCase()}</span>
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

      {/* Run button */}
      {status === 'proposed' && (
        <button
          onClick={handleRun}
          className="w-full py-1.5 rounded-lg bg-primary/5 border border-primary/15 text-[9px] font-semibold text-primary hover:bg-primary/10 transition-colors flex items-center justify-center gap-1"
        >
          <Play className="h-3 w-3" /> Run Experiment
        </button>
      )}

      {/* Running animation */}
      {status === 'running' && (
        <div className="flex items-center justify-center gap-2 py-1">
          <div className="h-3 w-3 border border-primary/40 border-t-primary rounded-full animate-spin" />
          <span className="text-[9px] text-primary">Collecting samples…</span>
        </div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-1.5"
          >
            <div className="rounded-lg border border-border/20 bg-muted/5 p-2 space-y-1">
              <p className="text-[8px] font-semibold text-muted-foreground uppercase tracking-wider">Experiment Results</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[8px]">
                <div className="flex items-center gap-1">
                  {result.observed_lift >= 0 ? <TrendingUp className="h-2.5 w-2.5 text-emerald-400" /> : <TrendingDown className="h-2.5 w-2.5 text-red-400" />}
                  <span className="text-muted-foreground">Observed Lift:</span>
                  <span className={`font-mono font-bold ${result.observed_lift >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {result.observed_lift >= 0 ? '+' : ''}{(result.observed_lift * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-2.5 w-2.5 text-primary" />
                  <span className="text-muted-foreground">Significance:</span>
                  <span className="font-mono text-foreground">{(result.significance * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Samples:</span>
                  <span className="font-mono text-foreground ml-1">{result.samples}</span>
                </div>
                <div>
                  <span className={`font-bold ${
                    result.verdict === 'significant' ? 'text-emerald-400' :
                    result.verdict === 'harmful' ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {result.verdict === 'significant' ? '✓ Significant' :
                     result.verdict === 'harmful' ? '✕ Harmful' : '~ Inconclusive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Lift comparison bar */}
            <div className="flex items-center gap-1 text-[8px]">
              <span className="text-muted-foreground w-16 flex-shrink-0">Expected</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted/20 overflow-hidden relative">
                <motion.div
                  className="h-full rounded-full bg-primary/40"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, experiment.expected_lift * 100 * 5)}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            <div className="flex items-center gap-1 text-[8px]">
              <span className="text-muted-foreground w-16 flex-shrink-0">Observed</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted/20 overflow-hidden relative">
                <motion.div
                  className={`h-full rounded-full ${result.observed_lift >= 0 ? 'bg-emerald-400/60' : 'bg-red-400/60'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(0, Math.abs(result.observed_lift) * 100 * 5)}%` }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {circuitTripped && (
        <div className="rounded bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 text-[8px] text-red-400 font-semibold flex items-center gap-1">
          <Lock className="h-2.5 w-2.5" /> Circuit breaker tripped — intervention frozen
        </div>
      )}
    </motion.div>
  );
}

export function ExperimentPanel() {
  const { settings } = useDemo();
  const experiments = generateExperiments(settings.seed);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Beaker className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-semibold text-foreground">Safe Micro-Experiments</span>
        </div>
        <div className="text-[8px] text-muted-foreground">Click "Run" to test</div>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {experiments.map(e => (
          <InteractiveExperimentCard key={e.id} experiment={e} seed={settings.seed} />
        ))}
      </div>
    </div>
  );
}
