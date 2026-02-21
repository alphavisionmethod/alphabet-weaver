import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AvatarRig } from '../avatar/AvatarRig';
import { WorkflowPanel } from '../workflows/WorkflowPanel';

export function HologramView() {
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
    <div ref={containerRef} className="h-full relative overflow-hidden">
      {/* Office/desk background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />

      {/* Desk surface */}
      <div className="absolute bottom-0 left-0 right-0 h-[35%]"
        style={{
          background: 'linear-gradient(180deg, hsl(var(--muted) / 0.3) 0%, hsl(var(--muted) / 0.15) 100%)',
          transform: 'perspective(800px) rotateX(5deg)',
          transformOrigin: 'bottom center',
        }}
      >
        {/* Desk edge line */}
        <div className="absolute top-0 left-[10%] right-[10%] h-px bg-border/30" />

        {/* Projected glow on desk */}
        <motion.div
          className="absolute top-4 left-1/2 -translate-x-1/2 w-[300px] h-[120px] rounded-full bg-primary/[0.04] blur-[60px]"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Holographic panels */}
      <motion.div
        className="absolute z-10"
        style={{ top: '8%', left: '15%', right: '15%', bottom: '38%' }}
        animate={{
          rotateY: mousePos.x * 3,
          rotateX: mousePos.y * -2,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
      >
        <div className="h-full relative" style={{ perspective: '1200px' }}>
          <div className="max-w-lg mx-auto" style={{ transform: 'translateZ(20px)' }}>
            <WorkflowPanel />
          </div>
        </div>
      </motion.div>

      {/* Avatar hologram pillar */}
      <motion.div
        className="absolute z-20 left-[8%]"
        style={{ bottom: '38%' }}
        animate={{
          x: mousePos.x * -4,
          y: mousePos.y * -3,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
      >
        <AvatarRig />
      </motion.div>

      {/* Foreground desk edge mask (occlusion) */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-background z-30" />
    </div>
  );
}
