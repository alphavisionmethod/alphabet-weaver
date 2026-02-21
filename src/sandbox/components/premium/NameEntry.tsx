import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import sitaLogo from '@/assets/sita-logo.jpeg';

interface NameEntryProps {
  onComplete: (name: string) => void;
}

export function NameEntry({ onComplete }: NameEntryProps) {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(() => {
    if (name.trim()) {
      setSubmitted(true);
      setTimeout(() => onComplete(name.trim()), 800);
    }
  }, [name, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: submitted ? 0 : 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="max-w-md w-full px-8 text-center space-y-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <motion.div
          className="mx-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <img src={sitaLogo} alt="SITA OS" className="w-16 h-16 rounded-2xl mx-auto shadow-lg" />
        </motion.div>

        {/* Orb */}
        <motion.div
          className="mx-auto w-16 h-16 rounded-full relative"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <div className="absolute inset-0 rounded-full blur-xl"
            style={{ background: 'linear-gradient(135deg, hsl(270 91% 55% / 0.3), hsl(38 95% 54% / 0.3))' }} />
          <div className="absolute inset-1 rounded-full opacity-80"
            style={{ background: 'linear-gradient(135deg, hsl(270 91% 55%), hsl(38 95% 54%))' }} />
          <div className="absolute inset-3 rounded-full bg-white/90 backdrop-blur-sm" />
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ border: '2px solid hsl(38 95% 54% / 0.4)' }}
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        <motion.div
          className="space-y-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h1 className="text-2xl font-medium tracking-tight text-foreground">
            What should I call you?
          </h1>
          <p className="text-sm text-muted-foreground">
            No account needed. Everything stays on your device.
          </p>
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Your first name"
            autoFocus
            className="w-full text-center text-lg font-light tracking-wide py-3 px-4 rounded-2xl border-0 outline-none transition-all duration-300 placeholder:text-muted-foreground/40 bg-card text-foreground"
            style={{
              boxShadow: '0 2px 20px hsl(var(--border) / 0.5), 0 0 0 1px hsl(var(--border))',
            }}
          />

          <motion.button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-sm font-medium text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: name.trim()
                ? 'linear-gradient(135deg, hsl(270 91% 55%), hsl(38 95% 54%))'
                : 'hsl(var(--muted))',
              boxShadow: name.trim() ? '0 4px 20px hsl(270 91% 55% / 0.3)' : 'none',
            }}
            whileHover={name.trim() ? { scale: 1.03, y: -1 } : {}}
            whileTap={name.trim() ? { scale: 0.97 } : {}}
          >
            Continue
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
