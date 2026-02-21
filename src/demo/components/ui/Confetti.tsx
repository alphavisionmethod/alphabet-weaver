import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  scale: number;
}

const COLORS = [
  'hsl(270 91% 55%)',   // purple
  'hsl(38 95% 54%)',    // gold
  'hsl(142 71% 45%)',   // green
  'hsl(270 100% 65%)',  // light purple
  'hsl(38 100% 65%)',   // light gold
];

export function Confetti({ trigger }: { trigger: boolean }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!trigger) return;
    const newParticles: Particle[] = Array.from({ length: 24 }, (_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 200,
      y: -(Math.random() * 150 + 50),
      rotation: Math.random() * 720 - 360,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      scale: Math.random() * 0.5 + 0.5,
    }));
    setParticles(newParticles);
    const t = setTimeout(() => setParticles([]), 1200);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {particles.map(p => (
          <motion.div
            key={p.id}
            className="absolute left-1/2 top-1/2"
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0 }}
            animate={{
              x: p.x,
              y: p.y,
              opacity: 0,
              rotate: p.rotation,
              scale: p.scale,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            style={{ width: 6, height: 6, borderRadius: 1, backgroundColor: p.color }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
