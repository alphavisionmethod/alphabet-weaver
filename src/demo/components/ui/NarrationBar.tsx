import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NarrationBarProps {
  text: string;
  speed?: number;
}

export function NarrationBar({ text, speed = 30 }: NarrationBarProps) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const prevTextRef = useRef('');

  useEffect(() => {
    if (text === prevTextRef.current) return;
    prevTextRef.current = text;
    setDisplayed('');
    if (!text) return;

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  useEffect(() => {
    const blink = setInterval(() => setShowCursor(c => !c), 530);
    return () => clearInterval(blink);
  }, []);

  if (!text) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="px-4 py-1.5 bg-card/50 backdrop-blur-sm border-b border-border/10 flex-shrink-0 z-30"
      >
        <p className="text-[11px] font-mono text-primary/80 tracking-wide">
          {displayed}
          <span className={`inline-block w-[5px] h-[13px] ml-0.5 align-middle bg-primary/60 ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
        </p>
      </motion.div>
    </AnimatePresence>
  );
}
