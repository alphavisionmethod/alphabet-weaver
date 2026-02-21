import { Settings, ChevronDown, ChevronUp, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { DemoSettings, Persona, StressLevel, AutonomyScope, BudgetCap } from '../contracts';

interface DemoControlsProps {
  settings: DemoSettings;
  onUpdate: (settings: Partial<DemoSettings>) => void;
  burnoutMode: boolean;
  onToggleBurnout: () => void;
}

const PERSONAS: { value: Persona; label: string }[] = [
  { value: 'founder', label: 'Founder' },
  { value: 'professional', label: 'Professional' },
  { value: 'family_office', label: 'Family Office' },
  { value: 'neurodivergent', label: 'Clarity Mode' },
  { value: 'consumer', label: 'Personal' },
];

const STRESS_LEVELS: { value: StressLevel; label: string }[] = [
  { value: 'calm', label: 'Calm' },
  { value: 'overwhelmed', label: 'Overwhelmed' },
];

const AUTONOMY_LEVELS: { value: AutonomyScope; label: string }[] = [
  { value: 'observe', label: 'Observe' },
  { value: 'recommend', label: 'Recommend' },
  { value: 'execute_with_approval', label: 'Execute w/ Approval' },
  { value: 'delegated', label: 'Delegated' },
];

const BUDGETS: { value: BudgetCap; label: string }[] = [
  { value: '0.10', label: '$0.10' },
  { value: '1.00', label: '$1.00' },
  { value: '5.00', label: '$5.00' },
];

function PillGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1.5">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              value === opt.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function DemoControls({ settings, onUpdate, burnoutMode, onToggleBurnout }: DemoControlsProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="max-w-5xl mx-auto px-4">
        <div className="rounded-t-lg border border-b-0 border-border bg-card/95 backdrop-blur-sm">
          <Button
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-2 py-2 text-xs text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-3 w-3" />
            Demo Controls
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </Button>

          {expanded && (
            <div className="p-4 pt-0 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <PillGroup label="Persona" options={PERSONAS} value={settings.persona} onChange={(v) => onUpdate({ persona: v })} />
                <PillGroup label="Stress" options={STRESS_LEVELS} value={settings.stress} onChange={(v) => onUpdate({ stress: v })} />
                <PillGroup label="Autonomy" options={AUTONOMY_LEVELS} value={settings.autonomy} onChange={(v) => onUpdate({ autonomy: v })} />
                <PillGroup label="Budget Cap" options={BUDGETS} value={settings.budgetCap} onChange={(v) => onUpdate({ budgetCap: v })} />
              </div>
              <div className="border-t border-border pt-3">
                <button
                  onClick={onToggleBurnout}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    burnoutMode
                      ? 'bg-destructive/20 text-destructive border border-destructive/30'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Flame className="h-3 w-3" />
                  {burnoutMode ? 'Burnout Mode ON' : 'Burnout Mode'}
                </button>
                {burnoutMode && (
                  <p className="text-[10px] text-muted-foreground mt-1.5">
                    Non-critical goals paused. Cash protected. Decisions slowed.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
