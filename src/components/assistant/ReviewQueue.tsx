import { useAssistant } from '@/state/assistantStore';
import { ProposalCard } from './ProposalCard';

export function ReviewQueue() {
  const { reviewQueue, approveProposal, rejectProposal, selectItem, setActiveTab } = useAssistant();

  const pending = reviewQueue.filter(i => i.proposal.status === 'pending');
  const resolved = reviewQueue.filter(i => i.proposal.status !== 'pending');

  return (
    <div className="p-4 space-y-6">
      {pending.length === 0 && resolved.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">No items in queue.</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Proposals will appear here for review.</p>
        </div>
      )}

      {pending.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Pending · {pending.length}
          </h3>
          {pending.map(item => (
            <ProposalCard
              key={item.proposal.id}
              proposal={item.proposal}
              onApprove={() => approveProposal(item.proposal.id)}
              onReject={() => rejectProposal(item.proposal.id)}
              onViewDetails={() => selectItem(item.proposal.id)}
              onEdit={() => setActiveTab('propose')}
            />
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Resolved · {resolved.length}
          </h3>
          {resolved.map(item => (
            <ProposalCard
              key={item.proposal.id}
              proposal={item.proposal}
              onViewDetails={() => selectItem(item.proposal.id)}
              compact
            />
          ))}
        </div>
      )}
    </div>
  );
}
