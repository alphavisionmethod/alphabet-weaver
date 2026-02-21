import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X, FileCheck } from "lucide-react";

interface VerificationReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const VerificationReceipt = ({ isOpen, onClose, email }: VerificationReceiptProps) => {
  const timestamp = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Receipt card */}
            <div className="glass-card p-6 border-accent/30">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Header */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2, damping: 15 }}
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-accent" />
                </motion.div>
                <h3 className="text-xl font-bold text-foreground mb-1">Verification Receipt</h3>
                <p className="text-sm text-muted-foreground">Your spot is confirmed</p>
              </div>

              {/* Receipt details */}
              <div className="space-y-4 border-t border-dashed border-border pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="flex items-center gap-2 text-sm font-medium text-accent">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    Confirmed
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="text-sm font-medium text-foreground text-right break-all max-w-[200px]">
                    {email}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Timestamp</span>
                  <span className="text-sm font-medium text-foreground">{timestamp}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Access Level</span>
                  <span className="text-sm font-medium gradient-text">Early Beta</span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-dashed border-border">
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <FileCheck className="w-4 h-4" />
                  <span>SITA OS • Governed Execution</span>
                </div>
              </div>

              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-accent/50 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-accent/50 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-accent/50 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-accent/50 rounded-br-lg" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VerificationReceipt;
