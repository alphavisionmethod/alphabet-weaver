import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Sparkles } from 'lucide-react';

interface EmailCaptureModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (email: string) => void;
}

export function EmailCaptureModal({ show, onClose, onSubmit }: EmailCaptureModalProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (email.includes('@')) {
      console.log('Email captured:', email);
      setSubmitted(true);
      onSubmit(email);
      setTimeout(onClose, 1500);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative max-w-sm w-full rounded-3xl p-8 text-center space-y-6 bg-card border border-border"
            style={{ boxShadow: '0 25px 60px hsl(var(--border) / 0.4)' }}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full transition-colors bg-muted"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            <div className="space-y-3">
              <div className="mx-auto w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, hsl(270 91% 55% / 0.15), hsl(38 95% 54% / 0.15))' }}>
                <Sparkles className="h-5 w-5" style={{ color: 'hsl(270 91% 55%)' }} />
              </div>
              <h2 className="text-lg font-medium text-foreground">
                Want this running on your real data?
              </h2>
              <p className="text-sm text-muted-foreground">
                Join the private alpha. No spam, ever.
              </p>
            </div>

            {!submitted ? (
              <div className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="you@example.com"
                  className="w-full text-center text-sm py-3 px-4 rounded-2xl border-0 outline-none transition-all bg-muted text-foreground"
                  style={{ boxShadow: '0 0 0 1px hsl(var(--border))' }}
                />
                <motion.button
                  onClick={handleSubmit}
                  disabled={!email.includes('@')}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium text-white transition-all disabled:opacity-30"
                  style={{
                    background: email.includes('@')
                      ? 'linear-gradient(135deg, hsl(270 91% 55%), hsl(38 95% 54%))'
                      : 'hsl(var(--muted))',
                  }}
                  whileHover={email.includes('@') ? { scale: 1.02 } : {}}
                  whileTap={email.includes('@') ? { scale: 0.98 } : {}}
                >
                  Join Private Alpha
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4"
              >
                <p className="text-sm font-medium" style={{ color: 'hsl(150 60% 40%)' }}>
                  ✓ You're on the list
                </p>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
