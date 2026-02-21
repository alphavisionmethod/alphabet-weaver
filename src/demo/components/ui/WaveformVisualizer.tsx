import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import type { AvatarSkinState } from '../../types';

interface WaveformVisualizerProps {
  state: AvatarSkinState;
  barCount?: number;
}

export function WaveformVisualizer({ state, barCount = 12 }: WaveformVisualizerProps) {
  const [bars, setBars] = useState<number[]>(Array(barCount).fill(0.2));
  const animRef = useRef<number>();
  const isActive = state === 'LISTENING' || state === 'THINKING';

  useEffect(() => {
    if (!isActive) {
      setBars(Array(barCount).fill(0.2));
      return;
    }

    const animate = () => {
      setBars(prev => prev.map((_, i) => {
        const base = state === 'THINKING' ? 0.5 : 0.3;
        const wave = Math.sin(Date.now() * 0.004 + i * 0.8) * 0.3;
        const noise = Math.random() * 0.2;
        return Math.max(0.1, Math.min(1, base + wave + noise));
      }));
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isActive, barCount, state]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: 'auto' }}
          exit={{ opacity: 0, width: 0 }}
          className="flex items-center gap-[2px] h-5 overflow-hidden"
        >
          {bars.map((height, i) => (
            <motion.div
              key={i}
              className="w-[2px] rounded-full bg-primary/60"
              style={{ height: `${height * 100}%` }}
              transition={{ duration: 0.05 }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
