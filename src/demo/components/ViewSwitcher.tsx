import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Smartphone, Glasses, Lightbulb, Sparkles, Eye } from 'lucide-react';
import { useDemo } from '../store';
import type { ViewMode } from '../types';

const MODES: { id: ViewMode; label: string; icon: typeof Monitor }[] = [
  { id: 'auto', label: 'Auto', icon: Sparkles },
  { id: 'desktop', label: 'Desktop', icon: Monitor },
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
  { id: 'glasses', label: 'Glasses', icon: Glasses },
  { id: 'hologram', label: 'Hologram', icon: Lightbulb },
];

export function ViewSwitcher() {
  const { viewMode, chooseMode } = useDemo();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/60 bg-card/50 backdrop-blur-sm text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-border transition-colors"
      >
        <Eye className="h-3 w-3" />
        View
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-44 rounded-xl border border-border/60 bg-card/95 backdrop-blur-md shadow-xl overflow-hidden z-50"
          >
            {MODES.map(mode => {
              const Icon = mode.icon;
              const active = viewMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => { chooseMode(mode.id); setOpen(false); }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs transition-colors ${
                    active ? 'text-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="font-medium">{mode.label}</span>
                  {active && <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
