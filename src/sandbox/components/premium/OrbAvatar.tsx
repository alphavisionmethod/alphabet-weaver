import { motion } from 'framer-motion';

interface OrbAvatarProps {
  speaking?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function OrbAvatar({ speaking = false, size = 'md', className = '' }: OrbAvatarProps) {
  const sizes = {
    sm: { outer: 'w-10 h-10', blur: 'blur-lg', ring: 'inset-0.5' },
    md: { outer: 'w-14 h-14', blur: 'blur-xl', ring: 'inset-1' },
    lg: { outer: 'w-20 h-20', blur: 'blur-2xl', ring: 'inset-1.5' },
  };
  const s = sizes[size];

  return (
    <div className={`relative ${s.outer} ${className}`}>
      {/* Outer glow — purple-gold brand */}
      <motion.div
        className={`absolute inset-0 rounded-full ${s.blur}`}
        style={{ background: 'linear-gradient(135deg, hsl(270 91% 55% / 0.35), hsl(38 95% 54% / 0.25))' }}
        animate={speaking ? { scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] } : { scale: [1, 1.08, 1], opacity: [0.3, 0.45, 0.3] }}
        transition={{ duration: speaking ? 1.2 : 3.5, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Core gradient — purple to gold */}
      <div className="absolute inset-0 rounded-full opacity-85"
        style={{ background: 'linear-gradient(135deg, hsl(270 91% 55%), hsl(38 95% 54%))' }} />
      {/* Inner light */}
      <div className={`absolute ${s.ring} rounded-full bg-white/80 backdrop-blur-md`} />
      {/* Speaking ring */}
      {speaking && (
        <motion.div
          className="absolute -inset-1 rounded-full"
          style={{ border: '2px solid hsl(270 91% 55% / 0.5)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
      {/* Breathing ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ border: '1px solid hsl(38 95% 54% / 0.2)' }}
        animate={{ scale: [1, 1.06, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
