import { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssistant } from '@/state/assistantStore';
import { OrbAvatar, type AvatarState } from './OrbAvatar';

export function AvatarButton() {
  const { isOpen, toggle, badgeCount, executionMode } = useAssistant();

  // Keyboard shortcut: Ctrl/⌘K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toggle();
      }
      if (e.key === 'Escape' && isOpen) {
        toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle, isOpen]);

  const avatarState: AvatarState = useMemo(() => {
    if (isOpen) return 'READY';
    if (badgeCount > 0) return 'NEEDS_REVIEW';
    return 'IDLE';
  }, [isOpen, badgeCount]);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const badgeLabel = badgeCount > 0 ? `, ${badgeCount} item${badgeCount !== 1 ? 's' : ''} to review` : '';

  return (
    <motion.button
      onClick={toggle}
      className="fixed bottom-5 right-5 z-[60] flex items-center justify-center rounded-full bg-transparent p-0 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Open Assistant Panel${badgeLabel}`}
      title="⌘K to toggle"
    >
      <OrbAvatar
        size={36}
        mode={executionMode}
        state={avatarState}
        animate={isOpen && !prefersReducedMotion}
      />

      {/* Badge count */}
      <AnimatePresence>
        {badgeCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -left-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground"
          >
            {badgeCount > 9 ? '9+' : badgeCount}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
