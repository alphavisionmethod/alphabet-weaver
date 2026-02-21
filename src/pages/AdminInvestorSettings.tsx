import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Copy, Check, Key, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AccessCode {
  id: string;
  code: string;
  label: string | null;
  is_active: boolean;
  uses_count: number;
  max_uses: number | null;
  expires_at: string | null;
  created_at: string;
}

export default function AdminInvestorSettings() {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { fetchCodes(); }, []);

  const fetchCodes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('investor_access_codes' as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) toast.error(error.message);
    else setCodes((data || []) as unknown as AccessCode[]);
    setLoading(false);
  };

  const addCode = async () => {
    if (!newCode.trim()) { toast.error('Enter a passcode'); return; }
    const { error } = await supabase
      .from('investor_access_codes' as any)
      .insert({ code: newCode.trim(), label: newLabel.trim() || null });

    if (error) toast.error(error.message);
    else { toast.success('Access code created'); setNewCode(''); setNewLabel(''); fetchCodes(); }
  };

  const toggleCode = async (id: string, active: boolean) => {
    const { error } = await supabase
      .from('investor_access_codes' as any)
      .update({ is_active: !active })
      .eq('id', id);

    if (error) toast.error(error.message);
    else setCodes(prev => prev.map(c => c.id === id ? { ...c, is_active: !active } : c));
  };

  const deleteCode = async (id: string) => {
    const { error } = await supabase
      .from('investor_access_codes' as any)
      .delete()
      .eq('id', id);

    if (error) toast.error(error.message);
    else { setCodes(prev => prev.filter(c => c.id !== id)); toast.success('Code deleted'); }
  };

  const copyLink = (code: string) => {
    const url = `${window.location.origin}/investor?k=${encodeURIComponent(code)}`;
    navigator.clipboard.writeText(url);
    setCopied(code);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(null), 2000);
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'SITA_';
    for (let i = 0; i < 8; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
    setNewCode(result);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Investor Access</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage passcodes for the investor demo.</p>
      </div>

      {/* Create new code */}
      <div className="bg-card/60 border border-border/40 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Key className="w-4 h-4 text-primary" />
          Create Access Code
        </h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Passcode</label>
            <div className="flex gap-2">
              <input
                value={newCode}
                onChange={e => setNewCode(e.target.value)}
                placeholder="e.g. INVESTOR_DEMO_2026"
                className="flex-1 px-3 py-2.5 rounded-xl text-sm bg-muted/30 border border-border/40 text-foreground outline-none focus:border-primary/50 transition-colors font-mono"
              />
              <button onClick={generateCode} className="px-3 py-2.5 rounded-xl text-xs font-medium border border-border/40 text-muted-foreground hover:text-foreground hover:border-border transition-all">
                Generate
              </button>
            </div>
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-1 block">Label (optional)</label>
            <input
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder="e.g. Series A Partners"
              className="w-full px-3 py-2.5 rounded-xl text-sm bg-muted/30 border border-border/40 text-foreground outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          <div className="flex items-end">
            <button onClick={addCode} className="btn-hero text-sm px-5 py-2.5">
              <Plus className="w-4 h-4 mr-1" /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Active codes */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          {codes.length} Access Code{codes.length !== 1 ? 's' : ''}
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : codes.length === 0 ? (
          <div className="bg-card/60 border border-border/40 rounded-2xl p-8 text-center">
            <Key className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No access codes yet. Create one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {codes.map(code => (
              <motion.div
                key={code.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-card/60 border rounded-2xl p-5 transition-all ${code.is_active ? 'border-border/40' : 'border-border/20 opacity-60'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <code className="text-sm font-mono font-semibold text-foreground">{code.code}</code>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${code.is_active ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-muted text-muted-foreground'}`}>
                        {code.is_active ? 'ACTIVE' : 'DISABLED'}
                      </span>
                    </div>
                    {code.label && <p className="text-xs text-muted-foreground">{code.label}</p>}
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground/60">
                      <span>Uses: {code.uses_count}{code.max_uses ? `/${code.max_uses}` : ''}</span>
                      <span>Created: {new Date(code.created_at).toLocaleDateString()}</span>
                      {code.expires_at && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Expires: {new Date(code.expires_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => copyLink(code.code)} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Copy shareable link">
                      {copied === code.code ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button onClick={() => toggleCode(code.id, code.is_active)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${code.is_active ? 'text-amber-400 hover:bg-amber-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}>
                      {code.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => deleteCode(code.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
