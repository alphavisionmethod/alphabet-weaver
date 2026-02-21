import { useState, useMemo, useCallback, useEffect } from 'react';
import { IntentSelector, type PainPoint } from './IntentSelector';
import type { Persona } from '../contracts';
import { motion, AnimatePresence } from 'framer-motion';
import { useSandboxSession } from '../hooks/useSandboxSession';
import { useVoice } from '../hooks/useVoice';
import { SimulationBadge } from './SimulationBadge';
import { AvatarPanel } from './AvatarPanel';
import { WhileYouSleptBoard } from './WhileYouSleptBoard';
import { DrillDownPanel } from './DrillDownPanel';
import { ReceiptTimeline } from './ReceiptTimeline';
import { ReceiptDrawer } from './ReceiptDrawer';
import { DemoControls } from './DemoControls';
import { ChaosOverlay } from './ChaosScene';
import { TrustMeter } from './TrustMeter';
import { FutureWalkSlider } from './FutureWalkSlider';
import { RedTeamPopup } from './RedTeamPopup';
import { IntelligenceSpendBadge } from './IntelligenceSpendBadge';
import { FinalSummary } from './FinalSummary';
import { PartnerView } from './PartnerView';
import { BoardMode } from './BoardMode';
import { StrategyDNA } from './StrategyDNA';
import { AlertTriangle, Heart, LayoutDashboard, User } from 'lucide-react';
import type { Receipt } from '../contracts';

type ViewMode = 'default' | 'partner' | 'board';

export function SandboxPage() {
  const { state, loading, ledgerValid, drillDown, approve, deny, updateSettings, goBack, initSession } = useSandboxSession();
  const { isSpeaking, muted, speak, toggleMute, setVoiceOptions } = useVoice();
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showIntent, setShowIntent] = useState(true);
  const [showChaos, setShowChaos] = useState(false);
  const [burnoutMode, setBurnoutMode] = useState(false);
  const [showRedTeam, setShowRedTeam] = useState(false);
  const [redTeamShown, setRedTeamShown] = useState(false);
  const [interactionCount, setInteractionCount] = useState(0);
  const [showFinalSummary, setShowFinalSummary] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('default');

  const activePacket = useMemo(() => {
    if (!state?.activeCategory) return null;
    return state.packets.find(p => p.category === state.activeCategory) ?? null;
  }, [state?.activeCategory, state?.packets]);

  useEffect(() => {
    if (state) {
      const isRisky = activePacket?.category === 'investing';
      setVoiceOptions({ stress: state.settings.stress, isRisky });
    }
  }, [state?.settings.stress, activePacket?.category, setVoiceOptions, state]);

  useEffect(() => {
    if (activePacket?.category === 'investing' && !redTeamShown) {
      const timer = setTimeout(() => {
        setShowRedTeam(true);
        setRedTeamShown(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activePacket?.category, redTeamShown]);

  const currentVoiceLines = useMemo(() => {
    if (activePacket) return activePacket.voiceLines;
    if (state && !state.activeCategory) {
      const approvalCount = state.packets.filter(p => p.status === 'awaiting_approval').length;
      return [
        `I handled ${state.packets.length} things while you slept. ${approvalCount > 0 ? `${approvalCount} require approval.` : 'All clear.'}`,
      ];
    }
    return [];
  }, [activePacket, state]);

  const { approvedCount, deniedCount } = useMemo(() => {
    if (!state) return { approvedCount: 0, deniedCount: 0 };
    return {
      approvedCount: state.packets.filter(p => p.status === 'executed').length,
      deniedCount: state.packets.filter(p => p.status === 'denied').length,
    };
  }, [state]);

  const trustLevel = useMemo(() => {
    return Math.min(5, Math.max(0, 2.0 + approvedCount * 0.4 - deniedCount * 0.1));
  }, [approvedCount, deniedCount]);

  const totalActions = useMemo(() => {
    if (!state) return 0;
    return state.packets.length + state.receipts.length;
  }, [state]);

  const handleDrillDown = useCallback((category: any) => {
    setInteractionCount(c => c + 1);
    drillDown(category);
  }, [drillDown]);

  const handleApprove = useCallback((packetId: string, optionId?: string) => {
    setInteractionCount(c => c + 1);
    approve(packetId, optionId);
  }, [approve]);

  const handleDeny = useCallback((packetId: string) => {
    setInteractionCount(c => c + 1);
    deny(packetId);
  }, [deny]);

  useEffect(() => {
    if (!state) return;
    const allResolved = state.packets.every(p => p.status === 'executed' || p.status === 'denied' || p.status === 'pending');
    if (allResolved && interactionCount > 0 && !showFinalSummary) {
      const timer = setTimeout(() => setShowFinalSummary(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [state, interactionCount, showFinalSummary]);

  if (!state) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Initializing session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <AnimatePresence>
        {showIntent && (
          <IntentSelector onComplete={(persona: Persona, painPoint?: PainPoint) => {
            initSession({ persona }, painPoint);
            setShowIntent(false);
            setShowChaos(true);
          }} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showChaos && <ChaosOverlay onComplete={() => setShowChaos(false)} />}
      </AnimatePresence>

      <SimulationBadge />

      {!ledgerValid && (
        <div className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs">
          <AlertTriangle className="h-3 w-3" />
          Ledger integrity compromised. Session frozen.
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 pt-16">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <TrustMeter approvedCount={approvedCount} deniedCount={deniedCount} />
            {/* View mode switcher */}
            <div className="flex items-center gap-1 rounded-md border border-border bg-card p-0.5">
              {([
                { mode: 'default' as ViewMode, icon: User, label: 'Default' },
                { mode: 'partner' as ViewMode, icon: Heart, label: 'Partner' },
                { mode: 'board' as ViewMode, icon: LayoutDashboard, label: 'Board' },
              ]).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <IntelligenceSpendBadge category={null} totalSpent={state.budgetSpent} />
            <span className="text-xs text-muted-foreground">
              Budget: ${state.budgetSpent.toFixed(2)} / ${state.settings.budgetCap}
            </span>
          </div>
        </div>

        {burnoutMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 rounded-lg border border-destructive/20 bg-destructive/5"
          >
            <p className="text-xs text-foreground">
              <span className="font-medium text-destructive">Burnout Mode active.</span> Non-critical goals paused. Only urgent items visible. Cash outflows halted.
            </p>
          </motion.div>
        )}

        {/* Board Mode */}
        {viewMode === 'board' && (
          <BoardMode show packets={state.packets} budgetSpent={state.budgetSpent} trustLevel={trustLevel} />
        )}

        {/* Partner View */}
        {viewMode === 'partner' && (
          <PartnerView show packets={state.packets} onDrillDown={handleDrillDown} />
        )}

        {/* Default View */}
        {viewMode === 'default' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {activePacket ? (
                  <DrillDownPanel
                    key={activePacket.id}
                    packet={activePacket}
                    onApprove={handleApprove}
                    onDeny={handleDeny}
                    onBack={goBack}
                    loading={loading}
                    totalSpent={state.budgetSpent}
                  />
                ) : (
                  <motion.div
                    key="board"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <WhileYouSleptBoard
                      packets={burnoutMode ? state.packets.filter(p => p.planSteps.some(s => s.riskTier === 'high' || s.riskTier === 'critical') || p.status === 'awaiting_approval') : state.packets}
                      onDrillDown={handleDrillDown}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-4">
              <AvatarPanel
                voiceLines={currentVoiceLines}
                isSpeaking={isSpeaking}
                muted={muted}
                onToggleMute={toggleMute}
                onSpeak={speak}
              />
              <StrategyDNA />
              <FutureWalkSlider />
              <ReceiptTimeline
                receipts={state.receipts}
                onViewReceipt={setSelectedReceipt}
              />
            </div>
          </div>
        )}
      </div>

      <DemoControls
        settings={state.settings}
        onUpdate={updateSettings}
        burnoutMode={burnoutMode}
        onToggleBurnout={() => setBurnoutMode(b => !b)}
      />

      <ReceiptDrawer
        receipt={selectedReceipt}
        open={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      <RedTeamPopup show={showRedTeam} onDismiss={() => setShowRedTeam(false)} />
      <FinalSummary show={showFinalSummary} interactionCount={interactionCount} actionCount={totalActions} />
    </div>
  );
}
