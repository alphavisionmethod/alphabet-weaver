import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import sitaLogo from '@/assets/sita-s-logo.jpeg';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'sita_investor_auth';

export function InvestorGate({ children }: { children: React.ReactNode }) {
  const [searchParams] = useSearchParams();
  const [authenticated, setAuthenticated] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const validate = async () => {
      // Check localStorage first
      if (localStorage.getItem(STORAGE_KEY) === 'true') {
        setAuthenticated(true);
        setChecking(false);
        return;
      }

      // Check URL key
      const urlKey = searchParams.get('k');
      if (urlKey) {
        const valid = await validateCode(urlKey);
        if (valid) {
          localStorage.setItem(STORAGE_KEY, 'true');
          setAuthenticated(true);
        }
      }
      setChecking(false);
    };
    validate();
  }, [searchParams]);

  const validateCode = async (codeToCheck: string): Promise<boolean> => {
    const { data } = await supabase
      .from('investor_access_codes' as any)
      .select('id, is_active, uses_count, max_uses, expires_at')
      .eq('code', codeToCheck)
      .eq('is_active', true)
      .maybeSingle();

    if (!data) return false;
    const row = data as any;
    if (row.max_uses && row.uses_count >= row.max_uses) return false;
    if (row.expires_at && new Date(row.expires_at) < new Date()) return false;

    // Increment uses
    await supabase
      .from('investor_access_codes' as any)
      .update({ uses_count: (row.uses_count || 0) + 1 })
      .eq('id', row.id);

    return true;
  };

  const handleSubmit = async () => {
    setError(false);
    const valid = await validateCode(code);
    if (valid) {
      localStorage.setItem(STORAGE_KEY, 'true');
      setAuthenticated(true);
    } else {
      setError(true);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (authenticated) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0B0812' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm mx-auto px-6">
        <div className="text-center mb-8">
          <img src={sitaLogo} alt="SITA OS" className="w-14 h-14 rounded-2xl mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white mb-1">Investor Console</h1>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>Enter passcode to access the governance deep dive.</p>
        </div>
        <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4" style={{ color: 'hsl(270 91% 65%)' }} />
            <span className="text-sm font-medium text-white">Access Code</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={e => { setCode(e.target.value); setError(false); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Enter code"
              className="flex-1 px-4 py-3 rounded-xl text-center text-sm font-mono tracking-wider outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`, color: '#fff' }}
            />
            <button onClick={handleSubmit} className="px-4 rounded-xl transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, hsl(270 91% 55%), hsl(38 95% 54%))' }}>
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
          </div>
          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-xs text-red-400 mt-2 text-center">
                Invalid or expired code.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
