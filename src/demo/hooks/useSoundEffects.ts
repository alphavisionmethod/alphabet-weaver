import { useCallback, useRef, useEffect } from 'react';

type SoundType = 'chime' | 'confirm' | 'stamp' | 'warning' | 'tap' | 'gavel' | 'type';

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

function playNoise(duration: number, gain = 0.03) {
  try {
    const ctx = getCtx();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 0.5;
    source.connect(filter).connect(g).connect(ctx.destination);
    source.start();
    source.stop(ctx.currentTime + duration);
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
    playNoise(0.06, 0.05);
    setTimeout(() => playTone(400, 0.15, 'triangle', 0.06), 50);
  },
  warning: () => {
    playTone(440, 0.15, 'sawtooth', 0.03);
    setTimeout(() => playTone(380, 0.2, 'sawtooth', 0.03), 150);
  },
  tap: () => {
    playTone(1200, 0.04, 'sine', 0.03);
    playNoise(0.02, 0.02);
  },
  gavel: () => {
    playTone(150, 0.06, 'square', 0.06);
    playNoise(0.08, 0.06);
    setTimeout(() => playTone(120, 0.12, 'square', 0.04), 60);
    setTimeout(() => playNoise(0.1, 0.04), 60);
  },
  type: () => {
    playTone(600 + Math.random() * 400, 0.03, 'square', 0.015);
    playNoise(0.02, 0.01);
  },
};

// Ambient drone system
let ambientOsc: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;
let ambientLfo: OscillatorNode | null = null;

function startAmbient() {
  try {
    const ctx = getCtx();
    if (ambientOsc) return;
    ambientOsc = ctx.createOscillator();
    ambientGain = ctx.createGain();
    ambientLfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    ambientOsc.type = 'sine';
    ambientOsc.frequency.value = 55;
    ambientGain.gain.value = 0.012;
    ambientLfo.type = 'sine';
    ambientLfo.frequency.value = 0.15;
    lfoGain.gain.value = 5;

    ambientLfo.connect(lfoGain).connect(ambientOsc.frequency);
    ambientOsc.connect(ambientGain).connect(ctx.destination);
    ambientOsc.start();
    ambientLfo.start();
  } catch {
    // Audio not available
  }
}

function stopAmbient() {
  try {
    ambientOsc?.stop();
    ambientLfo?.stop();
  } catch {}
  ambientOsc = null;
  ambientGain = null;
  ambientLfo = null;
}

function setAmbientPitch(freq: number) {
  if (ambientOsc) {
    try {
      const ctx = getCtx();
      ambientOsc.frequency.exponentialRampToValueAtTime(freq, ctx.currentTime + 0.3);
    } catch {}
  }
}

export function useSoundEffects() {
  const enabledRef = useRef(true);
  const ambientActiveRef = useRef(false);

  const play = useCallback((sound: SoundType) => {
    if (!enabledRef.current) return;
    SOUNDS[sound]();
  }, []);

  const toggle = useCallback(() => {
    enabledRef.current = !enabledRef.current;
    if (!enabledRef.current) stopAmbient();
    return enabledRef.current;
  }, []);

  const startAmbientSound = useCallback(() => {
    if (!enabledRef.current || ambientActiveRef.current) return;
    ambientActiveRef.current = true;
    startAmbient();
  }, []);

  const stopAmbientSound = useCallback(() => {
    ambientActiveRef.current = false;
    stopAmbient();
  }, []);

  const shiftAmbientPitch = useCallback((freq: number) => {
    setAmbientPitch(freq);
  }, []);

  useEffect(() => {
    return () => { stopAmbient(); };
  }, []);

  return { play, toggle, isEnabled: () => enabledRef.current, startAmbientSound, stopAmbientSound, shiftAmbientPitch };
}
