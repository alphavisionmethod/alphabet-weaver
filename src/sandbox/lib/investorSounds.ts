// Web Audio API sound effects for investor demo
// Subtle, Apple-style tones for state transitions

let ctx: AudioContext | null = null;
let _muted = false;

export function isSoundMuted() { return _muted; }
export function toggleSoundMute() { _muted = !_muted; return _muted; }

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.06) {
  if (_muted) return;
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    g.gain.setValueAtTime(gain, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    osc.connect(g).connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + dur);
  } catch {
    // Audio unavailable
  }
}

/** Gentle ascending chime — phase transition, approval */
export function playChime() {
  tone(660, 0.12, 'sine', 0.05);
  setTimeout(() => tone(880, 0.15, 'sine', 0.04), 70);
  setTimeout(() => tone(1100, 0.2, 'sine', 0.03), 150);
}

/** Single soft confirmation tick — pipeline step complete */
export function playTick() {
  tone(800, 0.08, 'sine', 0.04);
}

/** Short warning tone — block/refusal */
export function playBlock() {
  tone(320, 0.12, 'sawtooth', 0.03);
  setTimeout(() => tone(260, 0.18, 'sawtooth', 0.025), 100);
}

/** Subtle success — verification pass */
export function playSuccess() {
  tone(520, 0.1, 'sine', 0.04);
  setTimeout(() => tone(660, 0.12, 'sine', 0.04), 80);
  setTimeout(() => tone(880, 0.18, 'sine', 0.03), 170);
}

/** Activation hum — OS boot */
export function playActivation() {
  tone(220, 0.4, 'sine', 0.03);
  setTimeout(() => tone(330, 0.3, 'sine', 0.03), 200);
  setTimeout(() => tone(440, 0.35, 'sine', 0.025), 400);
}

/** Undo/reverse tone — descending */
export function playUndo() {
  tone(660, 0.1, 'sine', 0.04);
  setTimeout(() => tone(520, 0.12, 'sine', 0.035), 80);
  setTimeout(() => tone(400, 0.15, 'sine', 0.03), 160);
}
