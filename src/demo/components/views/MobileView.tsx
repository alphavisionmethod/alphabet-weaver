import { motion } from 'framer-motion';
import { AvatarRig } from '../avatar/AvatarRig';
import { WorkflowPanel } from '../workflows/WorkflowPanel';
import { useDemo } from '../../store';

export function MobileView() {
  const { receipts } = useDemo();

  return (
    <div className="h-full flex items-center justify-center p-8">
      {/* Blurred background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 pointer-events-none" />

      {/* Phone frame */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-[375px] h-[700px] rounded-[40px] border-[3px] border-border/60 bg-card/95 shadow-2xl overflow-hidden"
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-background rounded-b-2xl z-10" />

        {/* Status bar */}
        <div className="h-12 flex items-end justify-between px-6 pb-1">
          <span className="text-[9px] text-muted-foreground">9:42</span>
          <div className="flex items-center gap-1">
            <div className="h-2 w-4 rounded-sm border border-muted-foreground/30" />
          </div>
        </div>

        {/* App header */}
        <div className="px-5 pt-2 pb-3 flex items-center gap-2">
          <AvatarRig className="flex-shrink-0" />
          <span className="text-sm font-semibold text-foreground">SITA OS</span>
        </div>

        {/* Content */}
        <div className="px-5 pb-8 overflow-y-auto" style={{ height: 'calc(100% - 100px)' }}>
          <WorkflowPanel />
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-muted-foreground/20" />
      </motion.div>
    </div>
  );
}
