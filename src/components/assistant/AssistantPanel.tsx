import { motion, AnimatePresence } from 'framer-motion';
import { X, ClipboardList, PenLine, Info, Shield } from 'lucide-react';
import { useAssistant } from '@/state/assistantStore';
import { ReviewQueue } from './ReviewQueue';
import { ProposalComposer } from './ProposalComposer';
import { ExplainTrace } from './ExplainTrace';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const TABS = [
  { id: 'review' as const, label: 'Review', icon: ClipboardList },
  { id: 'propose' as const, label: 'Propose', icon: PenLine },
  { id: 'explain' as const, label: 'Explain', icon: Info },
] as const;

export function AssistantPanel() {
  const { isOpen, setOpen, activeTab, setActiveTab, executionMode, setMode, badgeCount } = useAssistant();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[61] bg-background/20 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            className="fixed top-0 right-0 bottom-0 z-[62] w-[min(480px,100vw)] bg-card border-l border-border flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-foreground">Assistant</span>

                {/* Execution mode pill */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        const modes: typeof executionMode[] = ['SIM', 'SHADOW', 'SUPERVISED'];
                        const next = modes[(modes.indexOf(executionMode) + 1) % modes.length];
                        setMode(next);
                      }}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider border transition-colors ${
                        executionMode === 'SIM'
                          ? 'border-muted-foreground/30 text-muted-foreground bg-muted/50'
                          : executionMode === 'SHADOW'
                            ? 'border-primary/30 text-primary bg-primary/10'
                            : 'border-primary text-primary-foreground bg-primary'
                      }`}
                    >
                      {executionMode}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-[240px] text-xs">
                    {executionMode === 'SIM' && 'Simulation only. No real actions taken.'}
                    {executionMode === 'SHADOW' && 'Shadow mode. Actions simulated alongside real data for comparison.'}
                    {executionMode === 'SUPERVISED' && 'Supervised execution. All actions require explicit approval.'}
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Shield className="h-3 w-3" />
                      <span>No background actions</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    All actions require explicit review. Nothing runs without your knowledge.
                  </TooltipContent>
                </Tooltip>

                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              {TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors relative ${
                    activeTab === id
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                  {id === 'review' && badgeCount > 0 && (
                    <span className="ml-1 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold flex items-center justify-center">
                      {badgeCount}
                    </span>
                  )}
                  {activeTab === id && (
                    <motion.div
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                      layoutId="assistant-tab-indicator"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {activeTab === 'review' && (
                  <motion.div key="review" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <ReviewQueue />
                  </motion.div>
                )}
                {activeTab === 'propose' && (
                  <motion.div key="propose" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <ProposalComposer />
                  </motion.div>
                )}
                {activeTab === 'explain' && (
                  <motion.div key="explain" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
                    <ExplainTrace />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
