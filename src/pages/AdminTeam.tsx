import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, ShieldCheck, Eye, Trash2, Plus, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
}

const ROLE_CONFIG: Record<string, { label: string; icon: typeof Shield; color: string }> = {
  superadmin: { label: 'Super Admin', icon: ShieldCheck, color: 'text-accent' },
  admin: { label: 'Admin', icon: Shield, color: 'text-primary' },
  readonly: { label: 'Read Only', icon: Eye, color: 'text-muted-foreground' },
};

export default function AdminTeam() {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState<string>('readonly');
  const [adding, setAdding] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setCurrentUserId(session.user.id);
    });
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) toast.error(error.message);
    else setRoles((data || []) as unknown as UserRole[]);
    setLoading(false);
  };

  const addUserRole = async () => {
    if (!addEmail.trim()) return;
    setAdding(true);

    // We need the user_id from the email. Since we can't query auth.users,
    // the admin can only add roles for users who already signed up.
    // We'll use the edge function approach.
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { setAdding(false); return; }

    toast.info('Note: The user must have already signed up. Adding role by user ID coming soon.');
    setAdding(false);
  };

  const removeRole = async (id: string, userId: string) => {
    if (userId === currentUserId) {
      toast.error("You can't remove your own role.");
      return;
    }

    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('id', id);

    if (error) toast.error(error.message);
    else {
      setRoles(prev => prev.filter(r => r.id !== id));
      toast.success('Role removed');
    }
  };

  const changeRole = async (id: string, newRole: string) => {
    const { error } = await supabase
      .from('user_roles')
      .update({ role: newRole as any })
      .eq('id', id);

    if (error) toast.error(error.message);
    else {
      setRoles(prev => prev.map(r => r.id === id ? { ...r, role: newRole } : r));
      toast.success(`Role updated to ${newRole}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Team & Roles</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage who has access to the admin panel.</p>
      </div>

      {/* Role summary */}
      <div className="grid grid-cols-3 gap-4">
        {(['superadmin', 'admin', 'readonly'] as const).map(role => {
          const config = ROLE_CONFIG[role];
          const count = roles.filter(r => r.role === role).length;
          const RoleIcon = config.icon;
          return (
            <div key={role} className="bg-card/60 border border-border/30 rounded-xl p-4 text-center">
              <RoleIcon className={`w-5 h-5 ${config.color} mx-auto mb-2`} />
              <p className="text-xl font-bold text-foreground">{count}</p>
              <p className="text-xs text-muted-foreground">{config.label}</p>
            </div>
          );
        })}
      </div>

      {/* Users list */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          {roles.length} Team Member{roles.length !== 1 ? 's' : ''}
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : roles.length === 0 ? (
          <div className="bg-card/60 border border-border/30 rounded-2xl p-8 text-center">
            <Users className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No team members yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {roles.map(role => {
              const config = ROLE_CONFIG[role.role] || ROLE_CONFIG.readonly;
              const RoleIcon = config.icon;
              const isCurrentUser = role.user_id === currentUserId;

              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card/60 border border-border/30 rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted/30 flex items-center justify-center">
                      <RoleIcon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-mono text-foreground">
                        {role.user_id.slice(0, 8)}…
                        {isCurrentUser && <span className="text-[10px] text-accent ml-2">(you)</span>}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Added {new Date(role.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={role.role}
                      onChange={e => changeRole(role.id, e.target.value)}
                      disabled={isCurrentUser}
                      className="px-3 py-1.5 rounded-lg text-xs bg-muted/30 border border-border/40 text-foreground outline-none disabled:opacity-50"
                    >
                      <option value="superadmin">Super Admin</option>
                      <option value="admin">Admin</option>
                      <option value="readonly">Read Only</option>
                    </select>
                    {!isCurrentUser && (
                      <button
                        onClick={() => removeRole(role.id, role.user_id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
