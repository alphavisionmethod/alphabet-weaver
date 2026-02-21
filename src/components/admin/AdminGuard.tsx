import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin/login');
        return;
      }

      try {
        const { data } = await supabase.functions.invoke('check-admin', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (data?.isAdmin) {
          setAuthorized(true);
        } else {
          navigate('/admin/login');
        }
      } catch {
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };
    check();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
}
