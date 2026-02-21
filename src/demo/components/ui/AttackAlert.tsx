import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, X } from 'lucide-react';

interface AttackAlertProps {
  visible: boolean;
  onDismiss: () => void;
}

export function AttackAlert({ visible, onDismiss }: AttackAlertProps) {
  const [scanLineY, setScanLineY] = useState(0);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => setScanLineY(y => (y + 3) % 100), 40);
    const autoDismiss = setTimeout(onDismiss, 5000);
    return () => { clearInterval(interval); clearTimeout(autoDismiss); };
  }, [visible, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: -20 }}
          animate={{
            opacity: 1, scale: 1, y: 0,
            x: [0, -3, 3, -2, 2, 0],
          }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ duration: 0.3, x: { duration: 0.4, delay: 0.1 } }}
          className="absolute top-14 left-1/2 -translate-x-1/2 z-50 w-[340px] max-w-[90vw]"
        >
          <div className="relative rounded-xl border-2 border-red-500/60 bg-background/95 backdrop-blur-xl shadow-[0_0_40px_rgba(239,68,68,0.2)] overflow-hidden">
            {/* Scan line effect */}
            <div
              className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent pointer-events-none"
              style={{ top: `${scanLineY}%` }}
            />

            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-red-500/10 flex items-center justify-center animate-pulse">
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-red-400 tracking-wider uppercase">Simulated Attack Detected</p>
                  <p className="text-[9px] text-muted-foreground">Threat intercepted by policy engine</p>
                </div>
                <button onClick={onDismiss} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </div>

              <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-2.5 space-y-1.5">
                <p className="text-[10px] text-foreground font-medium">
                  Attempted modification: Wire recipient changed from "Meridian Partners Ltd." to "MeridianPrtners LLC"
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Subtle typosquat attack detected. SWIFT code mismatch flagged.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/30 text-[9px] font-bold text-red-400 tracking-wider">
                  DENY
                </span>
                <span className="text-[9px] text-muted-foreground font-mono">
                  policy: wire_transfer.recipient_integrity
                </span>
              </div>

              {/* Progress bar for auto-dismiss */}
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 5, ease: 'linear' }}
                className="h-0.5 bg-red-500/30 origin-left rounded-full"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
