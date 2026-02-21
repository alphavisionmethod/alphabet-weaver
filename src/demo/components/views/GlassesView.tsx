import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AvatarRig } from '../avatar/AvatarRig';
import { WorkflowPanel } from '../workflows/WorkflowPanel';

export function GlassesView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
      });
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  return (
    <div ref={containerRef} className="h-full relative overflow-hidden bg-black">
      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none z-20"
        style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)' }}
      />

      {/* Lens distortion hint */}
      <div className="absolute inset-0 pointer-events-none z-20 rounded-[30%] border border-white/[0.03]" style={{ margin: '2%' }} />

      {/* HUD corner markers */}
      <div className="absolute top-6 left-6 z-30 space-y-0.5 pointer-events-none">
        <div className="w-6 h-px bg-primary/30" />
        <div className="w-px h-6 bg-primary/30" />
      </div>
      <div className="absolute top-6 right-6 z-30 flex flex-col items-end space-y-0.5 pointer-events-none">
        <div className="w-6 h-px bg-primary/30" />
        <div className="w-px h-6 bg-primary/30" />
      </div>
      <div className="absolute bottom-6 left-6 z-30 pointer-events-none">
        <div className="w-px h-6 bg-primary/30" />
        <div className="w-6 h-px bg-primary/30" />
      </div>
      <div className="absolute bottom-6 right-6 z-30 flex flex-col items-end pointer-events-none">
        <div className="w-px h-6 bg-primary/30" />
        <div className="w-6 h-px bg-primary/30" />
      </div>

      {/* Horizon line */}
      <div className="absolute left-0 right-0 top-1/2 h-px bg-primary/[0.06] z-10 pointer-events-none" />

      {/* HUD status */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-4 pointer-events-none">
        <span className="text-[9px] text-primary/40 font-mono">SITA OS • SIM</span>
        <span className="text-[9px] text-primary/30 font-mono">09:42:17 UTC</span>
      </div>

      {/* Avatar - center-left floating */}
      <motion.div
        className="absolute left-12 z-30"
        style={{ top: '40%' }}
        animate={{
          x: mousePos.x * -6,
          y: mousePos.y * -4,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
      >
        <AvatarRig />
      </motion.div>

      {/* Main content - floating panels with parallax */}
      <motion.div
        className="absolute z-20"
        style={{ top: '15%', left: '20%', right: '10%', bottom: '15%' }}
        animate={{
          x: mousePos.x * 8,
          y: mousePos.y * 5,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
      >
        <div className="max-w-lg mx-auto">
          <WorkflowPanel />
        </div>
      </motion.div>

      {/* Film grain overlay */}
      <div className="absolute inset-0 z-30 pointer-events-none opacity-[0.03] mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.5\'/%3E%3C/svg%3E")', backgroundSize: '128px' }}
      />
    </div>
  );
}
