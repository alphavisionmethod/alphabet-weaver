import { useState } from 'react';
import { useAssistant } from '@/state/assistantStore';
import { Sparkles, Play } from 'lucide-react';
import type { ReviewItem, ProposalStep, SourceRef } from '@/types/assistant';

export function ProposalComposer() {
  const { addToQueue, executionMode, setActiveTab } = useAssistant();
  const [input, setInput] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    if (!input.trim()) return;

    setGenerating(true);

    // Simulate generation delay
    setTimeout(() => {
      const proposal: ReviewItem = {
        proposal: {
          id: `prop_${Date.now().toString(36)}`,
          title: input.trim().slice(0, 60),
          summary: `Proposed action: ${input.trim()}. Simulated in ${executionMode} mode with policy verification.`,
          workflow: 'custom',
          riskTier: 'MED',
          costCents: Math.floor(Math.random() * 50) + 5,
          executionMode,
          requiresApproval: executionMode !== 'SIM',
          status: 'pending',
          steps: [
            { id: 's1', description: 'Verify intent and permissions', status: 'planned' } as ProposalStep,
            { id: 's2', description: 'Execute simulation', status: 'planned' } as ProposalStep,
            { id: 's3', description: 'Generate receipt', status: 'planned' } as ProposalStep,
          ],
          intendedTools: ['policy.check', 'sim.execute'],
          sourcesUsed: [
            { id: 'src_policy', label: 'Governance policy', type: 'policy' } as SourceRef,
          ],
          createdAt: new Date().toISOString(),
        },
        receipts: [],
        trace: [
          { ts: new Date().toISOString(), type: 'policy_check' as const, message: 'Policy check: pending' },
        ],
      };

      addToQueue(proposal);
      setInput('');
      setGenerating(false);
      setActiveTab('review');
    }, 800);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <label className="text-xs text-muted-foreground font-medium">
          What do you want to do?
        </label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Describe an action or workflow…"
          rows={3}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleGenerate}
          disabled={!input.trim() || generating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {generating ? (
            <div className="h-3 w-3 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
          ) : (
            <Sparkles className="h-3 w-3" />
          )}
          Generate Proposal
        </button>
        <button
          onClick={handleGenerate}
          disabled={!input.trim() || generating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Play className="h-3 w-3" />
          Simulate
        </button>
      </div>

      {/* Memory transparency */}
      <div className="pt-2 border-t border-border">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2">
          Sources available
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'CRM contacts', type: 'crm' },
            { label: 'Email history', type: 'email' },
            { label: 'Finance ledger', type: 'finance' },
            { label: 'Calendar events', type: 'calendar' },
            { label: 'Prior decisions', type: 'memory' },
          ].map(source => (
            <MemoryChip key={source.type} label={source.label} />
          ))}
        </div>
      </div>
    </div>
  );
}

function MemoryChip({ label }: { label: string }) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <span className="group inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground border border-border">
      {label}
      <button
        onClick={() => setVisible(false)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive/60 hover:text-destructive"
        title="Don't use this source"
      >
        ×
      </button>
    </span>
  );
}
