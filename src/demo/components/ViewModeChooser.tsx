import { motion } from 'framer-motion';
import { Monitor, Smartphone, Glasses, Lightbulb, Sparkles } from 'lucide-react';
import { useDemo } from '../store';
import type { ViewMode } from '../types';

const MODES: { id: ViewMode; label: string; icon: typeof Monitor; desc: string; best: string }[] = [
  { id: 'auto', label: 'Auto', icon: Sparkles, desc: 'Picks the best layout for your screen.', best: 'Recommended' },
  { id: 'desktop', label: 'Desktop', icon: Monitor, desc: 'Full product UI with sidebar navigation.', best: 'Laptop & desktop' },
  { id: 'mobile', label: 'Mobile App', icon: Smartphone, desc: 'Phone-framed interface with touch feel.', best: 'Presentations' },
  { id: 'glasses', label: 'Glasses HUD', icon: Glasses, desc: 'AR point-of-view with floating panels.', best: 'Immersive demos' },
  { id: 'hologram', label: 'Desk Hologram', icon: Lightbulb, desc: 'Spatial UI projected on a desk scene.', best: 'Investor pitch' },
];

export function ViewModeChooser() {
  const { chooseMode } = useDemo();

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: 'blur(20px)' }}
      transition={{ duration: 0.5 }}
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-10"
        >
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">Choose your demo view</h1>
          <p className="text-sm text-muted-foreground mt-2">You can switch anytime during the experience.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {MODES.map((mode, i) => {
            const Icon = mode.icon;
            return (
              <motion.button
                key={mode.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }}
                onClick={() => chooseMode(mode.id)}
                className="group relative flex flex-col items-center p-5 rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm hover:border-primary/40 hover:bg-card/80 transition-all duration-300 cursor-pointer text-center"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl bg-primary/0 group-hover:bg-primary/[0.03] transition-colors duration-300" />

                <div className="relative z-10 h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors duration-300">
                  <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                </div>
                <span className="relative z-10 text-sm font-medium text-foreground">{mode.label}</span>
                <span className="relative z-10 text-[11px] text-muted-foreground mt-1.5 leading-relaxed">{mode.desc}</span>
                <span className="relative z-10 text-[10px] text-primary/70 font-medium mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Best for: {mode.best}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
