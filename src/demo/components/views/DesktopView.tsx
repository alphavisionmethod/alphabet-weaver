import { AvatarRig } from '../avatar/AvatarRig';
import { WorkflowPanel } from '../workflows/WorkflowPanel';
import { useDemo } from '../../store';
import { ReceiptCard } from '../ui/ReceiptCard';
import { MetricsPanel } from '../ui/MetricsPanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText } from 'lucide-react';
import { useState } from 'react';

export function DesktopView() {
  const { receipts } = useDemo();
  const [showLog, setShowLog] = useState(false);

  return (
    <div className="h-full flex">
      {/* Main content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <AvatarRig />
          <div className="h-px flex-1 bg-border/30" />
        </div>
        <div className="max-w-xl">
          <WorkflowPanel />
        </div>
      </div>

      {/* Right panel - Receipts log */}
      <div className={`border-l border-border/30 bg-card/30 transition-all duration-300 overflow-hidden ${showLog ? 'w-72' : 'w-10'}`}>
        <button
          onClick={() => setShowLog(s => !s)}
          className="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <FileText className="h-4 w-4" />
        </button>
        {showLog && (
          <ScrollArea className="h-[calc(100%-40px)] px-3 pb-3">
            <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">Receipts</h3>
            <div className="space-y-2">
              {receipts.length === 0 && <p className="text-[10px] text-muted-foreground">No receipts yet.</p>}
              {receipts.map(r => <ReceiptCard key={r.receiptId} receipt={r} />)}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Metrics panel */}
      <MetricsPanel />
    </div>
  );
}
