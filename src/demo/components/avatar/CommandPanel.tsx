import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Sparkles, Play } from 'lucide-react';
import { useDemo } from '../../store';
import type { WorkflowId } from '../../types';
import { TypingIndicator } from '../ui/TypingIndicator';

interface WorkflowSuggestion {
  workflowId: WorkflowId;
  label: string;
}

const CANNED_RESPONSES: Record<string, { text: string; workflow?: WorkflowSuggestion }> = {
  'revenue': {
    text: "I found 5 anomalies totaling $27,688 in recoverable revenue. Want me to run the Revenue Leak Detector?",
    workflow: { workflowId: 'revenue-leak', label: '▶ Run Revenue Leak Detector' },
  },
  'wire': {
    text: "I can draft a wire transfer for you. The workflow includes dual-signature approval and AML screening.",
    workflow: { workflowId: 'wire-transfer', label: '▶ Start Wire Transfer' },
  },
  'board': {
    text: "I'll compile a Board Briefing from all 12 advisors. This typically takes a few moments to gather consensus.",
    workflow: { workflowId: 'board-briefing', label: '▶ Compile Board Briefing' },
  },
  'status': {
    text: "All systems nominal. 3 workflows available: Revenue Leak Detector, Wire Transfer, and Board Briefing. No pending approvals.",
  },
  'help': {
    text: "I can help you with:\n• Run a revenue leak scan\n• Draft a wire transfer\n• Compile a board briefing\n• Check system status\n\nJust type a command or click a workflow.",
  },
};

function getResponse(input: string): { text: string; workflow?: WorkflowSuggestion } {
  const lower = input.toLowerCase();
  if (lower.includes('revenue') || lower.includes('leak') || lower.includes('scan')) return CANNED_RESPONSES['revenue'];
  if (lower.includes('wire') || lower.includes('transfer') || lower.includes('pay')) return CANNED_RESPONSES['wire'];
  if (lower.includes('board') || lower.includes('brief') || lower.includes('advisor')) return CANNED_RESPONSES['board'];
  if (lower.includes('status') || lower.includes('health') || lower.includes('system')) return CANNED_RESPONSES['status'];
  if (lower.includes('help') || lower.includes('?')) return CANNED_RESPONSES['help'];
  return { text: "I understand. Would you like me to run a workflow, check system status, or scan for anomalies? Type 'help' for options." };
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  workflow?: WorkflowSuggestion;
}

export function CommandPanel({ onClose }: { onClose: () => void }) {
  const { setAvatarState, setActiveWorkflow, advanceWorkflow } = useDemo();
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', role: 'assistant', text: "Hello. I'm SITA — your autonomous operating system. How can I help?" },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAvatarState('THINKING');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const response = getResponse(text);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: response.text,
        workflow: response.workflow,
      }]);
      setAvatarState('CONFIRMING');
    }, 800);
  };

  const triggerWorkflow = (wf: WorkflowSuggestion) => {
    setActiveWorkflow(wf.workflowId);
    advanceWorkflow(wf.workflowId);
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      text: `Starting ${wf.label.replace('▶ ', '')}…`,
    }]);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-80 max-h-96 rounded-xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold text-foreground">SITA Command</span>
        </div>
        <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted/50">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2 min-h-[120px]">
        {messages.map((msg) => (
          <div key={msg.id}>
            <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg px-3 py-1.5 text-xs leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-foreground'
              }`}>
                {msg.text}
              </div>
            </div>
            {msg.workflow && (
              <div className="flex justify-start mt-1">
                <button
                  onClick={() => triggerWorkflow(msg.workflow!)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/15 text-primary hover:bg-primary/25 border border-primary/30 transition-colors"
                >
                  <Play className="h-3 w-3" />
                  {msg.workflow.label.replace('▶ ', '')}
                </button>
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted/50 rounded-lg">
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border/30 px-3 py-2 flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask SITA anything…"
          className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/60 outline-none"
        />
        <button
          onClick={send}
          disabled={!input.trim()}
          className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Send className="h-3 w-3" />
        </button>
      </div>
    </motion.div>
  );
}
