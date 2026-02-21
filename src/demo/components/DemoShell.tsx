import { AnimatePresence, motion } from 'framer-motion';
import { useDemo, DemoProvider } from '../store';
import { ViewModeChooser } from './ViewModeChooser';
import { ViewSwitcher } from './ViewSwitcher';
import { DesktopView } from './views/DesktopView';
import { MobileView } from './views/MobileView';
import { GlassesView } from './views/GlassesView';
import { HologramView } from './views/HologramView';
import { SessionProgress } from './ui/SessionProgress';
import { ActivityTicker } from './ui/ActivityTicker';
import { Shield, RotateCcw, Home, Play, Keyboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { useAutoplay } from '../hooks/useAutoplay';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

function ShortcutCheatSheet({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute top-12 right-4 z-50 w-52 rounded-xl border border-border/40 bg-card/95 backdrop-blur-xl shadow-2xl p-3"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-foreground">Keyboard Shortcuts</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xs">✕</button>
      </div>
      <div className="space-y-1.5 text-[10px]">
        {[
          ['1', 'Revenue Leak'],
          ['2', 'Wire Transfer'],
          ['3', 'Board Briefing'],
          ['Esc', 'Back / Close'],
          ['R', 'Reset demo'],
        ].map(([key, desc]) => (
          <div key={key} className="flex items-center justify-between">
            <kbd className="px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground font-mono text-[9px]">{key}</kbd>
            <span className="text-muted-foreground">{desc}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function DemoInner() {
  const { hasChosenMode, resolvedMode, settings, resetDemo, autoplayActive, startAutoplay, stopAutoplay } = useDemo();
  const navigate = useNavigate();
  const [showShortcuts, setShowShortcuts] = useState(false);

  useKeyboardShortcuts();
  useAutoplay();

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex flex-col">
      {/* View mode chooser (first run) */}
      <AnimatePresence>
        {!hasChosenMode && <ViewModeChooser />}
      </AnimatePresence>

      {hasChosenMode && (
        <>
          {/* Top bar */}
          <div className="h-10 flex items-center justify-between px-4 border-b border-border/20 bg-card/30 backdrop-blur-sm flex-shrink-0 z-40 relative">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-foreground tracking-tight">SITA OS</span>
              <SessionProgress />
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full border border-border/40 text-[9px] font-semibold text-muted-foreground tracking-wider">
                {settings.connectorMode}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Autoplay toggle */}
              <button
                onClick={autoplayActive ? stopAutoplay : startAutoplay}
                className={`p-1 transition-colors rounded-md ${autoplayActive ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}
                title={autoplayActive ? 'Stop autoplay' : 'Watch demo'}
              >
                <Play className="h-3 w-3" />
              </button>
              <button onClick={() => navigate('/')} className="p-1 text-muted-foreground hover:text-foreground transition-colors" title="Back to homepage">
                <Home className="h-3 w-3" />
              </button>
              <button onClick={resetDemo} className="p-1 text-muted-foreground hover:text-foreground transition-colors" title="Reset demo">
                <RotateCcw className="h-3 w-3" />
              </button>
              <button
                onClick={() => setShowShortcuts(s => !s)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                title="Keyboard shortcuts"
              >
                <Keyboard className="h-3 w-3" />
              </button>
              <div className="flex items-center gap-1 text-muted-foreground/50">
                <Shield className="h-3 w-3" />
              </div>
              <div className="scale-[0.6] origin-right -mr-2">
                <ThemeToggle />
              </div>
              <ViewSwitcher />
            </div>
          </div>

          {/* Shortcut cheat sheet */}
          <AnimatePresence>
            {showShortcuts && <ShortcutCheatSheet onClose={() => setShowShortcuts(false)} />}
          </AnimatePresence>

          {/* Main content area */}
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={resolvedMode}
                initial={{ opacity: 0, filter: 'blur(8px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, filter: 'blur(8px)' }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0"
              >
                {resolvedMode === 'desktop' && <DesktopView />}
                {resolvedMode === 'mobile' && <MobileView />}
                {resolvedMode === 'glasses' && <GlassesView />}
                {resolvedMode === 'hologram' && <HologramView />}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Activity ticker */}
          <ActivityTicker />
        </>
      )}
    </div>
  );
}

export function DemoShell() {
  return (
    <DemoProvider>
      <DemoInner />
    </DemoProvider>
  );
}
