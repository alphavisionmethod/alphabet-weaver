import { motion } from "framer-motion";
import { Receipt, CheckCircle2 } from "lucide-react";

const receipts = [
  { id: "7721", action: "Bill Negotiation Executed", result: "$142.00 saved", policy: "Aggressive" },
  { id: "7722", action: "Lead Gen Pipeline Initialized", result: "40 verified targets found", policy: "Gated" },
  { id: "7723", action: "Expense Approval Processed", result: "$890.00 approved", policy: "Standard" },
  { id: "7724", action: "Vendor Contract Renewed", result: "12% discount negotiated", policy: "Conservative" },
  { id: "7725", action: "Payment Batch Executed", result: "8 invoices paid", policy: "Scheduled" },
  { id: "7726", action: "Travel Booking Confirmed", result: "SFO → NYC, $347 saved", policy: "Best Value" },
  { id: "7727", action: "Subscription Audit Complete", result: "3 unused services cancelled", policy: "Aggressive" },
  { id: "7728", action: "Pipeline Stage Automation", result: "24 leads advanced", policy: "Qualification" },
  { id: "7729", action: "Insurance Quote Comparison", result: "Best rate: $1,240/mo", policy: "Comprehensive" },
  { id: "7730", action: "Payroll Processing Complete", result: "42 employees paid", policy: "Standard" },
];

// Duplicate for seamless loop
const allReceipts = [...receipts, ...receipts];

const LiveReceiptMarquee = () => {
  return (
    <section className="relative py-8 overflow-hidden border-y border-border/50 bg-obsidian-light/50">
      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      {/* Marquee */}
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear",
        }}
        className="flex gap-8 whitespace-nowrap"
      >
        {allReceipts.map((receipt, index) => (
          <div
            key={`${receipt.id}-${index}`}
            className="inline-flex items-center gap-4 px-6 py-3 rounded-lg bg-secondary/50 border border-border/50"
          >
            <div className="flex items-center gap-2 text-accent">
              <Receipt className="w-4 h-4" />
              <span className="font-mono text-xs text-muted-foreground">
                RECEIPT #{receipt.id}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {receipt.action}.
            </span>
            <span className="text-sm text-accent font-semibold">
              {receipt.result}.
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="w-3 h-3 text-primary" />
              Policy: {receipt.policy}
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  );
};

export default LiveReceiptMarquee;
