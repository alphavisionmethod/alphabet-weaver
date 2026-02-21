import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSandboxStore } from '../store/useSandboxStore';
import { NameEntry } from './premium/NameEntry';
import { GuidedExperience } from './premium/GuidedExperience';
import { OpenControlPanel } from './premium/OpenControlPanel';
import { ReceiptTimelinePremium } from './premium/ReceiptTimelinePremium';
import { InvestorStatusPanel } from './premium/InvestorStatusPanel';
import { EmailCaptureModal } from './premium/EmailCaptureModal';
import { OrbAvatar } from './premium/OrbAvatar';
import { useVoice } from '../hooks/useVoice';
import type { SimResult } from '../lib/simulationEngine';
import {
  simulateLeadRecovery, simulateInsuranceQuotes, simulateGift,
  simulateTravelBooking, simulateInvestment,
} from '../lib/simulationEngine';
import { Shield, RotateCcw, Volume2, VolumeX, Home, Monitor } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import sitaLogo from '@/assets/sita-logo.jpeg';

type Phase = 'name' | 'guided' | 'open';

export function PremiumSandboxPage() {
  const {
    session, receipts, hasSession, createSession, completeGuided,
    triggerWow, resetSession, addReceipt, setAllReceipts, incrementActions,
  } = useSandboxStore();
  const { isSpeaking, muted, speak, toggleMute } = useVoice();
  const [phase, setPhase] = useState<Phase>(() => {
    if (!hasSession) return 'name';
    if (session?.completedGuided) return 'open';
    return 'guided';
  });
  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleNameComplete = useCallback((name: string) => {
    createSession(name);
    setPhase('guided');
  }, [createSession]);

  const handleGuidedComplete = useCallback((guidedReceipts: SimResult[]) => {
    setAllReceipts(guidedReceipts);
    completeGuided();
    setShowEmailModal(false);
    setPhase('open');
  }, [completeGuided, setAllReceipts]);

  const handleWowMoment = useCallback(() => {
    triggerWow();
    setTimeout(() => setShowEmailModal(true), 2500);
  }, [triggerWow]);

  const handleAction = useCallback((actionId: string) => {
    const sims: Record<string, () => SimResult> = {
      travel: simulateTravelBooking,
      leads: simulateLeadRecovery,
      insurance: simulateInsuranceQuotes,
      investing: simulateInvestment,
      gift: simulateGift,
      board: () => ({
        id: `sim_board_${Date.now()}`,
        type: 'lead_recovery' as const,
        title: 'Board Meeting Compiled',
        description: '12 advisor stances compiled into actionable recommendation. 8 approve, 3 caution, 1 reject.',
        confidence: 0.91,
        timestamp: new Date().toISOString(),
        details: { advisors: 12, approve: 8, caution: 3, reject: 1 },
        receiptHash: `0x${Date.now().toString(16)}`,
        correlationId: `cor_board_${Date.now().toString(36)}`,
        policyVerdict: 'PASS' as const,
      }),
    };

    const sim = sims[actionId];
    if (sim) {
      const result = sim();
      result.id = `${result.id}_${Date.now()}`;
      addReceipt(result);
      incrementActions();
      if (!muted) {
        speak([`Done. ${result.title}. ${result.description.split('.')[0]}.`]);
      }
    }
  }, [muted, speak, addReceipt, incrementActions]);

  const handleReset = useCallback(() => {
    resetSession();
    setPhase('name');
    setShowEmailModal(false);
  }, [resetSession]);

  if (phase === 'name') {
    return <NameEntry onComplete={handleNameComplete} />;
  }

  if (phase === 'guided' && session) {
    return (
      <>
        <GuidedExperience
          name={session.name}
          onComplete={handleGuidedComplete}
          onWowMoment={handleWowMoment}
        />
        <EmailCaptureModal
          show={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          onSubmit={() => {}}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="sticky top-0 z-30 backdrop-blur-xl border-b border-border bg-background/85">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={sitaLogo} alt="SITA" className="w-8 h-8 rounded-lg" />
            <OrbAvatar speaking={isSpeaking} size="sm" />
            <div>
              <span className="text-sm font-medium text-foreground">SITA OS</span>
              <span className="text-xs ml-2 text-muted-foreground">— {session?.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link to="/" className="p-2 rounded-full transition-colors hover:bg-muted" title="Home">
              <Home className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link to="/demo" className="p-2 rounded-full transition-colors hover:bg-muted" title="Multi-View Demo">
              <Monitor className="h-4 w-4 text-muted-foreground" />
            </Link>
            <ThemeToggle />
            <button onClick={toggleMute} className="p-2 rounded-full transition-colors hover:bg-muted">
              {muted ? (
                <VolumeX className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Volume2 className="h-4 w-4 text-foreground" />
              )}
            </button>
            <button onClick={handleReset} className="p-2 rounded-full transition-colors hover:bg-muted" title="Reset demo">
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ background: 'hsl(38 95% 54% / 0.1)', color: 'hsl(38 95% 54%)' }}>
              <Shield className="h-3 w-3" />
              Simulation
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <AnimatePresence mode="wait">
              <OpenControlPanel onAction={handleAction} />
            </AnimatePresence>
          </div>
          <div className="space-y-6">
            <InvestorStatusPanel
              receipts={receipts}
              autonomyLevel={session?.autonomyLevel || 2}
            />
            <ReceiptTimelinePremium receipts={receipts} />
          </div>
        </div>

        {/* Investor CTA Banner */}
        <div
          className="mt-12 rounded-2xl p-8 text-center"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
            style={{ background: 'linear-gradient(90deg, hsl(270 91% 55%), hsl(38 95% 54%))' }}
          />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Interested in what's under the hood?
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-lg mx-auto">
            See the governance architecture, attack simulation, and audit ledger that powers SITA OS.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/investor"
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, hsl(270 91% 55%), hsl(38 95% 54%))', color: '#fff' }}
            >
              Investor Deep Dive
            </Link>
            <Link
              to="/fund"
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}
            >
              Fund Our Project
            </Link>
          </div>
        </div>
      </div>

      <EmailCaptureModal
        show={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onSubmit={() => {}}
      />
    </div>
  );
}
