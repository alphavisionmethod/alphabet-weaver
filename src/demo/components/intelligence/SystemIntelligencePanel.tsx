import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DecisionLedgerPanel } from './DecisionLedgerPanel';
import { MetaReliabilityPanel } from './MetaReliabilityPanel';
import { RegimeGeometryPanel, ConfidenceDecayPanel } from './RegimeGeometryPanel';
import { AdversarialDriftPanel, ExperimentPanel } from './AdversarialDriftPanel';
import { Hash, Brain, Globe, TrendingDown, Flame, Beaker } from 'lucide-react';

const TABS = [
  { id: 'ledger', label: 'Ledger', icon: Hash },
  { id: 'meta', label: 'Reliability', icon: Brain },
  { id: 'regime', label: 'Regime', icon: Globe },
  { id: 'decay', label: 'Decay', icon: TrendingDown },
  { id: 'drift', label: 'Adversarial', icon: Flame },
  { id: 'experiments', label: 'Experiments', icon: Beaker },
] as const;

type TabId = typeof TABS[number]['id'];

export function SystemIntelligencePanel() {
  const [activeTab, setActiveTab] = useState<TabId>('meta');

  return (
    <div className="h-full flex flex-col">
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 px-2 pt-2 pb-1 border-b border-border/20 flex-shrink-0 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-medium transition-colors whitespace-nowrap ${
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/20'
              }`}
            >
              <Icon className="h-3 w-3" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 px-3 py-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'ledger' && <DecisionLedgerPanel />}
            {activeTab === 'meta' && <MetaReliabilityPanel />}
            {activeTab === 'regime' && <RegimeGeometryPanel />}
            {activeTab === 'decay' && <ConfidenceDecayPanel />}
            {activeTab === 'drift' && <AdversarialDriftPanel />}
            {activeTab === 'experiments' && <ExperimentPanel />}
          </motion.div>
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}
