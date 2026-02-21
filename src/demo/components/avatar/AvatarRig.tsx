import { useId, useMemo, useState, useRef, useEffect, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import type { AvatarSkinState } from '../../types';
import { useDemo } from '../../store';
import { CommandPanel } from './CommandPanel';
import { WaveformVisualizer } from '../ui/WaveformVisualizer';

const AvatarOrb3D = lazy(() => import('./AvatarOrb3D').then(m => ({ default: m.AvatarOrb3D })));

const STATE_COLORS: Record<AvatarSkinState, { ring: number; glow: number }> = {
  IDLE: { ring: 0.2, glow: 0 },
  LISTENING: { ring: 0.4, glow: 0.06 },
  THINKING: { ring: 0.5, glow: 0.1 },
  CONFIRMING: { ring: 0.6, glow: 0.12 },
  WARNING: { ring: 0.7, glow: 0.15 },
  REFUSAL: { ring: 0.3, glow: 0.05 },
};

interface AvatarRigProps {
  className?: string;
}

export function AvatarRig({ className = '' }: AvatarRigProps) {
  const { resolvedMode, avatarState } = useDemo();
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelPos, setPanelPos] = useState({ top: 0, left: 0 });
  const skinRef = useRef<HTMLDivElement>(null);

  const config = STATE_COLORS[avatarState];

  const togglePanel = () => {
    if (!panelOpen && skinRef.current) {
      const rect = skinRef.current.getBoundingClientRect();
      setPanelPos({ top: rect.bottom + 8, left: rect.left });
    }
    setPanelOpen(p => !p);
  };

  const skin = (() => {
    if (resolvedMode === 'desktop') return <DesktopSkin state={avatarState} config={config} className={className} onClick={togglePanel} />;
    if (resolvedMode === 'mobile') return <MobileSkin state={avatarState} config={config} className={className} onClick={togglePanel} />;
    if (resolvedMode === 'glasses') return <GlassesSkin state={avatarState} config={config} className={className} onClick={togglePanel} />;
    return <HologramSkin state={avatarState} config={config} className={className} onClick={togglePanel} />;
  })();

  return (
    <div className="relative" ref={skinRef}>
      {skin}
      {createPortal(
        <AnimatePresence>
          {panelOpen && (
            <div className="fixed z-[100]" style={{ top: panelPos.top, left: panelPos.left }}>
              <CommandPanel onClose={() => setPanelOpen(false)} />
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

interface SkinProps {
  state: AvatarSkinState;
  config: { ring: number; glow: number };
  className?: string;
  onClick?: () => void;
}

function DesktopSkin({ state, config, className, onClick }: SkinProps) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 cursor-pointer group ${className}`}>
      <Suspense fallback={<DesktopSkinFallback state={state} />}>
        <AvatarOrb3D state={state} size={48} />
      </Suspense>
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-foreground tracking-tight">SITA</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
            {state === 'IDLE' ? 'Ready' : state === 'THINKING' ? 'Processing…' : state === 'CONFIRMING' ? 'Confirmed' : state === 'WARNING' ? 'Attention' : state}
          </span>
          <WaveformVisualizer state={state} />
        </div>
      </div>
    </button>
  );
}

function DesktopSkinFallback({ state }: { state: AvatarSkinState }) {
  const isBusy = state === 'THINKING';
  const isActive = state !== 'IDLE';
  return (
    <div className="relative w-12 h-12">
      <motion.div
        className="absolute inset-0 rounded-full blur-xl"
        style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.35), hsl(var(--accent) / 0.25))' }}
        animate={isBusy ? { scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] } : { scale: [1, 1.08, 1], opacity: [0.2, 0.35, 0.2] }}
        transition={{ duration: isBusy ? 1.2 : 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <div className="absolute inset-0 rounded-full opacity-85" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))' }} />
      <div className="absolute inset-1 rounded-full bg-background/80 backdrop-blur-md" />
      <motion.div className="absolute inset-0 rounded-full border border-primary/20" animate={{ scale: [1, 1.06, 1] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} />
      {isActive && (
        <motion.div className="absolute -inset-1 rounded-full border-2 border-primary/40" animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 1.8, repeat: Infinity }} />
      )}
    </div>
  );
}

function MobileSkin({ state, config, className, onClick }: SkinProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`h-5 w-5 rounded-full border border-primary/30 flex items-center justify-center cursor-pointer ${className}`}
      animate={{ borderColor: `hsl(var(--primary) / ${config.ring})` }}
      whileTap={{ scale: 0.92 }}
    >
      <motion.div
        className="h-2 w-2 rounded-full bg-primary"
        animate={{
          scale: state === 'THINKING' ? [1, 1.3, 1] : 1,
          opacity: state === 'IDLE' ? 0.4 : 0.85,
        }}
        transition={{ duration: 1.2, repeat: state === 'THINKING' ? Infinity : 0 }}
      />
    </motion.button>
  );
}

function GlassesSkin({ state, config, className, onClick }: SkinProps) {
  const uid = useId();

  return (
    <button onClick={onClick} className={`relative cursor-pointer ${className}`}>
      {/* Volumetric glow */}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary blur-2xl"
        animate={{ opacity: config.glow * 2, scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: 56, height: 56, margin: -12 }}
      />

      {/* Orb */}
      <svg width={32} height={32} viewBox="0 0 64 64" className="relative z-10">
        <defs>
          <radialGradient id={`${uid}-g`} cx="0.4" cy="0.35" r="0.5">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
          </radialGradient>
          <radialGradient id={`${uid}-h`} cx="0.35" cy="0.3" r="0.3">
            <stop offset="0%" stopColor="white" stopOpacity={0.5} />
            <stop offset="100%" stopColor="white" stopOpacity={0} />
          </radialGradient>
        </defs>
        <motion.circle
          cx="32" cy="32" r="22"
          fill={`url(#${uid}-g)`}
          animate={{ r: state === 'THINKING' ? [22, 24, 22] : 22 }}
          transition={{ duration: 2, repeat: state === 'THINKING' ? Infinity : 0 }}
        />
        <circle cx="28" cy="26" r="8" fill={`url(#${uid}-h)`} />
        <circle cx="32" cy="32" r="26" stroke="hsl(var(--primary))" strokeOpacity={config.ring} strokeWidth="1.5" fill="none" />
      </svg>

      {/* Particle drift */}
      <motion.div
        className="absolute top-1 left-1 h-1 w-1 rounded-full bg-primary/30"
        animate={{ y: [-2, 2, -2], x: [0, 3, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </button>
  );
}

function HologramSkin({ state, config, className, onClick }: SkinProps) {
  return (
    <button onClick={onClick} className={`relative flex flex-col items-center cursor-pointer ${className}`}>
      {/* Light column */}
      <motion.div
        className="w-8 rounded-full overflow-hidden"
        style={{ height: 48 }}
        animate={{ opacity: state === 'IDLE' ? 0.4 : 0.7 }}
      >
        <div className="w-full h-full bg-gradient-to-t from-primary/20 via-primary/10 to-transparent relative">
          {/* Scanlines */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-0 right-0 h-px bg-primary/20"
              style={{ top: `${(i + 1) * 14}%` }}
              animate={{ opacity: [0.1, 0.4, 0.1] }}
              transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
            />
          ))}
        </div>
      </motion.div>

      {/* Presence ring at top */}
      <motion.div
        className="h-4 w-4 rounded-full border border-primary/40 flex items-center justify-center -mt-1"
        animate={{
          borderColor: `hsl(var(--primary) / ${config.ring})`,
          boxShadow: `0 0 ${config.glow * 80}px hsl(var(--primary) / ${config.glow})`,
        }}
      >
        <div className="h-1.5 w-1.5 rounded-full bg-primary/60" />
      </motion.div>

      {/* Desk spill glow */}
      <motion.div
        className="w-16 h-3 rounded-full bg-primary blur-lg mt-1"
        animate={{ opacity: config.glow * 1.5 }}
      />
    </button>
  );
}
