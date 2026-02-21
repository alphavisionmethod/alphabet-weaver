import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { runAdvisorConsensus } from '../../lib/investorSimEngine';
import type { ConsensusReport, AdvisorProposal } from '../../contracts/investor';
import { Users, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const ADVISOR_META: Record<string, { title: string; color: string }> = {
  cfo: { title: 'CFO Advisor', color: 'hsl(270 91% 65%)' },
  risk: { title: 'Risk Officer', color: 'hsl(38 95% 54%)' },
  compliance: { title: 'Compliance Counsel', color: 'hsl(210 80% 60%)' },
  growth: { title: 'Growth Advisor', color: 'hsl(150 60% 50%)' },
  concierge: { title: 'Concierge Advisor', color: 'hsl(330 70% 60%)' },
  red_team: { title: 'Red Team', color: 'hsl(0 70% 55%)' },
};

const REC_ICONS: Record<string, React.ReactNode> = {
  APPROVE: <CheckCircle className="w-4 h-4 text-emerald-400" />,
  CAUTION: <AlertTriangle className="w-4 h-4 text-amber-400" />,
  REJECT: <XCircle className="w-4 h-4 text-red-400" />,
};

function AdvisorCard({ proposal }: { proposal: AdvisorProposal }) {
  const meta = ADVISOR_META[proposal.advisorId];
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
        <span className="text-sm font-medium text-foreground">{meta.title}</span>
        <span className="ml-auto">{REC_ICONS[proposal.recommendation]}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3">
        <span className="text-muted-foreground">Verdict</span>
        <span className="text-foreground">{proposal.recommendation}</span>
        <span className="text-muted-foreground">Confidence</span>
        <span className="text-foreground">{(proposal.confidence * 100).toFixed(0)}%</span>
        <span className="text-muted-foreground">Risk</span>
        <span className="text-foreground">{proposal.riskTier}</span>
        <span className="text-muted-foreground">Cost Est.</span>
        <span className="text-foreground">${proposal.costEstimateUsd}</span>
        <span className="text-muted-foreground">Vote Weight</span>
        <span className="text-foreground">{(proposal.voteWeight * 100).toFixed(0)}%</span>
      </div>
      <ul className="space-y-1">
        {proposal.rationaleBullets.map((b, i) => (
          <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
            <span className="mt-1 w-1 h-1 rounded-full bg-muted-foreground/40 flex-shrink-0" />
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdvisorBoardRoom() {
  const [report, setReport] = useState<ConsensusReport | null>(null);
  const [running, setRunning] = useState(false);

  const run = useCallback(async () => {
    setRunning(true);
    const r = await runAdvisorConsensus();
    setReport(r);
    setRunning(false);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Board of Advisors</h3>
          <p className="text-sm text-muted-foreground">6 advisors deliberate. Weighted consensus drives final decision.</p>
        </div>
        <button
          onClick={run}
          disabled={running}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, hsl(270 91% 55%), hsl(38 95% 54%))', color: '#fff' }}
        >
          <Users className="w-4 h-4 inline mr-1.5" />
          {running ? 'Deliberating…' : 'Run Consensus'}
        </button>
      </div>

      {report && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {report.proposals.map(p => <AdvisorCard key={p.advisorId} proposal={p} />)}
          </div>

          {/* Disagreement gauge */}
          <div className="rounded-xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h4 className="text-sm font-medium text-foreground mb-3">Consensus Result</h4>
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Disagreement</span>
                <span className="text-foreground">{(report.disagreementScore * 100).toFixed(0)}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${report.disagreementScore * 100}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full rounded-full"
                  style={{ background: report.disagreementScore > 0.35 ? '#ef4444' : report.disagreementScore > 0.2 ? '#f59e0b' : '#22c55e' }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
              <span className="text-muted-foreground">Winner</span>
              <span className="text-foreground">{ADVISOR_META[report.winnerAdvisorId]?.title}</span>
              <span className="text-muted-foreground">Approval Required</span>
              <span className="text-foreground">{report.requiredApproval}</span>
            </div>
            <div className="mt-3">
              <span className="text-xs text-muted-foreground">Plan:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {report.finalPlanSteps.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 rounded text-xs" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}>
                    {i + 1}. {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
