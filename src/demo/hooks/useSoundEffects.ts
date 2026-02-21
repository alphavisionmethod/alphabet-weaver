import { useCallback, useRef } from 'react';

type SoundType = 'chime' | 'confirm' | 'stamp' | 'warning';

const audioCtxRef = { current: null as AudioContext | null };

function getCtx(): AudioContext {
  if (!audioCtxRef.current) {
    audioCtxRef.current = new AudioContext();
  }
  return audioCtxRef.current;
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.08) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not available
  }
}

const SOUNDS: Record<SoundType, () => void> = {
  chime: () => {
    playTone(880, 0.15, 'sine', 0.06);
    setTimeout(() => playTone(1100, 0.2, 'sine', 0.05), 80);
  },
  confirm: () => {
    playTone(600, 0.1, 'sine', 0.05);
    setTimeout(() => playTone(800, 0.15, 'sine', 0.05), 100);
    setTimeout(() => playTone(1000, 0.2, 'sine', 0.04), 200);
  },
  stamp: () => {
    playTone(200, 0.08, 'square', 0.04);
    setTimeout(() => playTone(400, 0.15, 'triangle', 0.06), 50);
  },
  warning: () => {
    playTone(440, 0.15, 'sawtooth', 0.03);
    setTimeout(() => playTone(380, 0.2, 'sawtooth', 0.03), 150);
  },
};

export function useSoundEffects() {
  const enabledRef = useRef(true);

  const play = useCallback((sound: SoundType) => {
    if (!enabledRef.current) return;
    SOUNDS[sound]();
  }, []);

  const toggle = useCallback(() => {
    enabledRef.current = !enabledRef.current;
    return enabledRef.current;
  }, []);

  return { play, toggle, isEnabled: () => enabledRef.current };
}
