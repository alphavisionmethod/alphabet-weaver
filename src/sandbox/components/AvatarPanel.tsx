import { Volume2, VolumeX, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useRef } from 'react';

interface AvatarPanelProps {
  voiceLines: string[];
  isSpeaking: boolean;
  muted: boolean;
  onToggleMute: () => void;
  onSpeak: (lines: string[]) => void;
}

export function AvatarPanel({ voiceLines, isSpeaking, muted, onToggleMute, onSpeak }: AvatarPanelProps) {
  const spokenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const key = voiceLines.join('|');
    if (voiceLines.length > 0 && !spokenRef.current.has(key)) {
      spokenRef.current.add(key);
      onSpeak(voiceLines);
    }
  }, [voiceLines, onSpeak]);

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`relative w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center ${isSpeaking ? 'animate-pulse' : ''}`}>
            <Bot className="h-5 w-5 text-primary" />
            {isSpeaking && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent rounded-full border-2 border-card" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">SITA</p>
            <p className="text-xs text-muted-foreground">
              {isSpeaking ? 'Speaking...' : 'Ready'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onToggleMute} className="h-8 w-8">
          {muted ? <VolumeX className="h-4 w-4 text-muted-foreground" /> : <Volume2 className="h-4 w-4 text-foreground" />}
        </Button>
      </div>

      {voiceLines.length > 0 && (
        <div className="space-y-1.5 border-t border-border pt-3">
          {voiceLines.map((line, i) => (
            <p key={i} className="text-xs text-muted-foreground leading-relaxed italic">
              "{line}"
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
