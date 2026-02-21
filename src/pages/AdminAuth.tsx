import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import sitaLogo from '@/assets/sita-s-logo.jpeg';
import { toast } from 'sonner';

export default function AdminAuth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const attemptAdminAccess = async (accessToken: string) => {
    // Check if already admin
    const { data } = await supabase.functions.invoke('check-admin', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (data?.isAdmin) {
      navigate('/admin');
      return;
    }

    // Try setup-admin (first user auto-promotion)
    const { data: setup, error: setupError } = await supabase.functions.invoke('setup-admin', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (setupError) {
      console.error('setup-admin error:', setupError);
    }

    if (setup?.role) {
      toast.success(`Welcome! You are now ${setup.role}.`);
      navigate('/admin');
    } else {
      toast.error(setup?.error || 'Admin access required. Contact the administrator.');
      await supabase.auth.signOut();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { data: signUpData, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        // With auto-confirm, signUp returns a session
        if (signUpData.session) {
          await attemptAdminAccess(signUpData.session.access_token);
        } else {
          toast.success('Check your email for a confirmation link.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await attemptAdminAccess(session.access_token);
        }
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm mx-auto px-6"
      >
        <div className="text-center mb-8">
          <img src={sitaLogo} alt="SITA OS" className="w-14 h-14 rounded-2xl mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-foreground mb-1">Admin Console</h1>
          <p className="text-sm text-muted-foreground">
            {isSignUp ? 'Create an account to get started.' : 'Sign in to manage workflows.'}
          </p>
        </div>

        <div className="rounded-2xl p-6 border border-border/40 bg-card/60 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm bg-muted/30 border border-border/40 text-foreground outline-none focus:border-primary/50 transition-colors"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-3 rounded-xl text-sm bg-muted/30 border border-border/40 text-foreground outline-none focus:border-primary/50 transition-colors"
                  placeholder="••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-hero text-sm py-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 rounded-full border-2 border-background border-t-transparent animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
