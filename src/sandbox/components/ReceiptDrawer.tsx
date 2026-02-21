import type { Receipt } from '../contracts';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { CheckCircle, XCircle } from 'lucide-react';

interface ReceiptDrawerProps {
  receipt: Receipt | null;
  open: boolean;
  onClose: () => void;
}

export function ReceiptDrawer({ receipt, open, onClose }: ReceiptDrawerProps) {
  if (!receipt) return null;

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {receipt.verified ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-destructive" />
            )}
            Receipt #{receipt.chainIndex}
          </SheetTitle>
          <SheetDescription>
            {receipt.verified ? 'Hash chain verified' : 'VERIFICATION FAILED'}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Category</p>
            <p className="text-sm text-foreground capitalize">{receipt.category}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Summary</p>
            <p className="text-sm text-foreground">{receipt.summary}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Timestamp</p>
            <p className="text-sm text-foreground font-mono">{receipt.timestamp}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Hash</p>
            <p className="text-xs text-foreground font-mono break-all bg-muted p-2 rounded">{receipt.hash}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Previous Hash</p>
            <p className="text-xs text-foreground font-mono break-all bg-muted p-2 rounded">{receipt.previousHash}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Chain Position</p>
            <p className="text-sm text-foreground">{receipt.chainIndex}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Full Details</p>
            <pre className="text-xs text-foreground font-mono bg-muted p-3 rounded overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(receipt.details, null, 2)}
            </pre>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
