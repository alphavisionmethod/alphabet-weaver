import { useAssistant } from '@/state/assistantStore';
import { Shield, Wrench, FileCheck, XCircle, CheckCircle, ChevronLeft } from 'lucide-react';
import type { TraceEvent, ReviewItem } from '@/types/assistant';

const EVENT_ICONS: Record<TraceEvent['type'], typeof Shield> = {
  policy_check: Shield,
  tool_call: Wrench,
  receipt: FileCheck,
  refusal: XCircle,
  approval: CheckCircle,
};

const EVENT_COLORS: Record<TraceEvent['type'], string> = {
  policy_check: 'text-primary',
  tool_call: 'text-muted-foreground',
  receipt: 'text-emerald-400',
  refusal: 'text-destructive',
  approval: 'text-amber-400',
};

export function ExplainTrace() {
  const { reviewQueue, selectedItemId, selectItem, setActiveTab } = useAssistant();

  const item: ReviewItem | undefined = selectedItemId
    ? reviewQueue.find(i => i.proposal.id === selectedItemId)
    : undefined;

  if (!item) {
    return (
      <div className="p-4 py-12 text-center">
        <p className="text-sm text-muted-foreground">Select an item from the Review tab to view its trace.</p>
      </div>
    );
  }

  const { proposal, receipts, trace, shadowDiff } = item;

  return (
    <div className="p-4 space-y-4">
      {/* Back + title */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => { selectItem(null); setActiveTab('review'); }}
          className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-medium text-foreground">{proposal.title}</h3>
      </div>

      {/* Policy summary */}
      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Policy Summary</p>
        <p className="text-xs text-foreground">
          {proposal.requiresApproval
            ? `This action requires explicit approval. Risk: ${proposal.riskTier}. Mode: ${proposal.executionMode}.`
            : `Auto-approved under ${proposal.executionMode} mode. Risk: ${proposal.riskTier}.`
          }
        </p>
      </div>

      {/* Shadow diff */}
      {shadowDiff && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1">
          <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Shadow Comparison</p>
          <p className="text-xs text-foreground">{shadowDiff.summary}</p>
        </div>
      )}

      {/* Trace timeline */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Trace Timeline</p>
        <div className="space-y-0">
          {trace.map((event, i) => {
            const Icon = EVENT_ICONS[event.type];
            const color = EVENT_COLORS[event.type];
            return (
              <div key={i} className="flex items-start gap-2 py-1.5">
                <div className="flex flex-col items-center">
                  <Icon className={`h-3.5 w-3.5 ${color} flex-shrink-0 mt-0.5`} />
                  {i < trace.length - 1 && <div className="w-px h-full min-h-4 bg-border mt-1" />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-foreground">{event.message}</p>
                  <p className="text-[10px] text-muted-foreground/60">
                    {new Date(event.ts).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Receipts */}
      {receipts.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Receipts · {receipts.length}
          </p>
          <div className="space-y-1">
            {receipts.map(r => (
              <div key={r.id} className="flex items-center gap-2 px-2 py-1.5 rounded border border-border bg-muted/30">
                <FileCheck className="h-3 w-3 text-emerald-400 flex-shrink-0" />
                <span className="text-[11px] text-foreground font-mono">{r.id}</span>
                <span className="text-[10px] text-muted-foreground ml-auto">{r.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tools used */}
      <div>
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Tools Used</p>
        <div className="flex flex-wrap gap-1">
          {proposal.intendedTools.map(tool => (
            <span key={tool} className="px-2 py-0.5 rounded-full text-[10px] bg-muted text-muted-foreground border border-border font-mono">
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
