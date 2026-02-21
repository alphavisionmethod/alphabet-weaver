import { useState, useCallback, useRef, useEffect } from 'react';
import type { StressLevel } from '../contracts';

interface VoiceOptions {
  stress?: StressLevel;
  isRisky?: boolean;
}

// Female voice name patterns (case-insensitive matching)
const FEMALE_VOICE_PATTERNS = [
  'samantha', 'karen', 'victoria', 'zira', 'hazel', 'susan', 'jenny',
  'female', 'woman', 'fiona', 'moira', 'tessa', 'veena', 'allison',
  'ava', 'joana', 'nicky', 'kate', 'serena',
];

function selectEnglishFemaleVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const english = voices.filter(v => v.lang.startsWith('en'));
  if (english.length === 0) return null;

  // Try to find a female voice by name pattern
  for (const v of english) {
    const lower = v.name.toLowerCase();
    if (FEMALE_VOICE_PATTERNS.some(p => lower.includes(p))) {
      return v;
    }
  }

  // Fallback: first English voice
  return english[0];
}

export function useVoice() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [muted, setMuted] = useState(false);
  const queueRef = useRef<string[]>([]);
  const speakingRef = useRef(false);
  const optionsRef = useRef<VoiceOptions>({});
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Resolve voice on mount + voiceschanged
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const resolve = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        voiceRef.current = selectEnglishFemaleVoice(voices);
      }
    };

    resolve();
    speechSynthesis.addEventListener('voiceschanged', resolve);
    return () => speechSynthesis.removeEventListener('voiceschanged', resolve);
  }, []);

  const setVoiceOptions = useCallback((opts: VoiceOptions) => {
    optionsRef.current = opts;
  }, []);

  const speakLine = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (muted || !('speechSynthesis' in window)) {
        resolve();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      const opts = optionsRef.current;

      // Apply selected voice
      if (voiceRef.current) {
        utterance.voice = voiceRef.current;
      }
      // Force English
      utterance.lang = 'en-US';

      if (opts.isRisky) {
        utterance.rate = 0.8;
        utterance.pitch = 0.85;
        utterance.volume = 0.9;
      } else if (opts.stress === 'overwhelmed') {
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        utterance.volume = 0.75;
      } else {
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      speechSynthesis.speak(utterance);
    });
  }, [muted]);

  const speak = useCallback(async (lines: string[]) => {
    if (muted || speakingRef.current) return;
    speakingRef.current = true;
    setIsSpeaking(true);
    queueRef.current = [...lines];

    for (const line of lines) {
      if (muted) break;
      await speakLine(line);
      const pause = optionsRef.current.stress === 'overwhelmed' ? 150 : 300;
      await new Promise(r => setTimeout(r, pause));
    }

    speakingRef.current = false;
    setIsSpeaking(false);
  }, [muted, speakLine]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    speakingRef.current = false;
    setIsSpeaking(false);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      if (!prev) stop();
      return !prev;
    });
  }, [stop]);

  return { isSpeaking, muted, speak, stop, toggleMute, setVoiceOptions };
}
