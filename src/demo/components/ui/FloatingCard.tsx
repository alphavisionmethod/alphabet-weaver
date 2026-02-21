import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useDemo } from '../../store';

interface FloatingCardProps {
  children: ReactNode;
  className?: string;
  depth?: number; // 0 = near, 1 = mid, 2 = far
}

export function FloatingCard({ children, className = '', depth = 1 }: FloatingCardProps) {
  const { resolvedMode } = useDemo();
  const isGlasses = resolvedMode === 'glasses';
  const isHologram = resolvedMode === 'hologram';

  const blurAmount = isGlasses && depth === 2 ? 'blur-[0.5px]' : '';
  const perspective = isHologram ? 'transform-gpu' : '';

  return (
    <motion.div
      className={`rounded-xl border border-border/40 bg-card/80 backdrop-blur-sm p-4 ${blurAmount} ${perspective} ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={isGlasses ? { z: 10, scale: 1.01 } : undefined}
      style={isHologram ? { transformStyle: 'preserve-3d', transform: `perspective(1200px) rotateX(2deg)` } : undefined}
    >
      {children}
    </motion.div>
  );
}
