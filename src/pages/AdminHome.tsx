import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, DollarSign, Mail, Workflow, TrendingUp, Clock,
  UserPlus, Eye, Shield, Zap, ArrowUpRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface Stats {
  totalLeads: number;
  donors: number;
  investors: number;
  totalRaised: number;
  pendingEmails: number;
  liveWorkflows: number;
}

interface ActivityEvent {
  id: string;
  event_type: string;
  created_at: string;
  payload: any;
  lead_email?: string;
}

const EVENT_LABELS: Record<string, { label: string; icon: typeof Users; color: string }> = {
  WAITLIST_SIGNUP: { label: 'New signup', icon: UserPlus, color: 'text-primary' },
  DONATION_CREATED: { label: 'New donation', icon: DollarSign, color: 'text-accent' },
  INVESTOR_INFO_REQUEST: { label: 'Investor request', icon: Eye, color: 'text-amber-400' },
  PITCH_VIEW: { label: 'Pitch viewed', icon: Eye, color: 'text-muted-foreground' },
  DEMO_VIEW: { label: 'Demo viewed', icon: Eye, color: 'text-muted-foreground' },
  WORKFLOW_TOGGLED: { label: 'Workflow toggled', icon: Workflow, color: 'text-primary' },
  EMAIL_SENT: { label: 'Email sent', icon: Mail, color: 'text-accent' },
  EMAIL_FAILED: { label: 'Email failed', icon: Mail, color: 'text-destructive' },
  TEMPLATE_UPDATED: { label: 'Template updated', icon: Zap, color: 'text-primary' },
  UNSUBSCRIBE: { label: 'Unsubscribe', icon: Users, color: 'text-destructive' },
  BOUNCE: { label: 'Bounce', icon: Shield, color: 'text-destructive' },
  COMPLAINT: { label: 'Complaint', icon: Shield, color: 'text-destructive' },
};

export default function AdminHome() {
  const [stats, setStats] = useState<Stats>({ totalLeads: 0, donors: 0, investors: 0, totalRaised: 0, pendingEmails: 0, liveWorkflows: 0 });
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();

    // Realtime activity feed
    const channel = supabase
      .channel('admin-events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, (payload) => {
        setEvents(prev => [payload.new as ActivityEvent, ...prev].slice(0, 30));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'user_leads' }, () => {
        fetchStats();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchEvents()]);
    setLoading(false);
  };

  const fetchStats = async () => {
    const [leadsRes, donorsRes, investorsRes, workflowsRes, emailsRes] = await Promise.all([
      supabase.from('user_leads').select('id', { count: 'exact', head: true }),
      supabase.from('donor_profiles').select('amount_total'),
      supabase.from('user_leads').select('id', { count: 'exact', head: true }).eq('lead_type', 'investor'),
      supabase.from('workflow_templates').select('id', { count: 'exact', head: true }).eq('status', 'LIVE'),
      supabase.from('email_messages').select('id', { count: 'exact', head: true }).eq('status', 'queued'),
    ]);

    const totalRaised = (donorsRes.data || []).reduce((sum, d) => sum + (d.amount_total || 0), 0);

    setStats({
      totalLeads: leadsRes.count || 0,
      donors: (donorsRes.data || []).length,
      investors: investorsRes.count || 0,
      totalRaised,
      liveWorkflows: workflowsRes.count || 0,
      pendingEmails: emailsRes.count || 0,
    });
  };

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('id, event_type, created_at, payload, lead_id')
      .order('created_at', { ascending: false })
      .limit(30);

    if (data) setEvents(data as unknown as ActivityEvent[]);
  };

  const statCards = [
    { icon: Users, label: 'Total Leads', value: stats.totalLeads, color: 'text-primary', bgColor: 'bg-primary/10' },
    { icon: DollarSign, label: 'Total Raised', value: `$${stats.totalRaised.toLocaleString()}`, color: 'text-accent', bgColor: 'bg-accent/10' },
    { icon: TrendingUp, label: 'Investors', value: stats.investors, color: 'text-amber-400', bgColor: 'bg-amber-400/10' },
    { icon: Workflow, label: 'Live Workflows', value: stats.liveWorkflows, color: 'text-primary', bgColor: 'bg-primary/10' },
    { icon: Mail, label: 'Queued Emails', value: stats.pendingEmails, color: 'text-muted-foreground', bgColor: 'bg-muted/30' },
  ];

  const quickActions = [
    { label: 'Manage Workflows', path: '/admin/workflows', icon: Workflow },
    { label: 'Brand Theme', path: '/admin/brand', icon: Mail },
    { label: 'Investor Codes', path: '/admin/investor', icon: Shield },
    { label: 'Team & Roles', path: '/admin/team', icon: Users },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time overview of your SITA OS operations.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card/60 border border-border/30 rounded-2xl p-5 hover:border-border/60 transition-all"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.bgColor} mb-3`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Live Activity</h2>
            <span className="flex items-center gap-1.5 text-[10px] text-accent">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              Real-time
            </span>
          </div>
          <div className="bg-card/60 border border-border/30 rounded-2xl divide-y divide-border/20 max-h-[480px] overflow-y-auto">
            {events.length === 0 ? (
              <div className="p-8 text-center">
                <Clock className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No events yet. Activity will appear here in real-time.</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {events.map(evt => {
                  const config = EVENT_LABELS[evt.event_type] || { label: evt.event_type, icon: Zap, color: 'text-muted-foreground' };
                  const EvtIcon = config.icon;
                  return (
                    <motion.div
                      key={evt.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 px-4 py-3"
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center bg-muted/30 shrink-0`}>
                        <EvtIcon className={`w-3.5 h-3.5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{config.label}</p>
                        {evt.payload?.contact_email && (
                          <p className="text-[10px] text-muted-foreground truncate">{evt.payload.contact_email}</p>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground/60 shrink-0">
                        {formatRelative(evt.created_at)}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {quickActions.map(action => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-card/60 border border-border/30 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="text-sm font-medium text-foreground">{action.label}</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatRelative(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}
