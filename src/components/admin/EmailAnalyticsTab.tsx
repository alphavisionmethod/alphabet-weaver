import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3, Mail, MousePointer, AlertTriangle, TrendingUp, RefreshCw,
  Send, Eye, CheckCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Analytics {
  overview: {
    totalSent: number;
    totalPending: number;
    totalFailed: number;
    sentLast7Days: number;
    sentLast30Days: number;
  };
  engagement: {
    opened: number;
    clicked: number;
    bounced: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
  };
  sequences: {
    total: number;
    active: number;
    list: Array<{
      id: string;
      name: string;
      isActive: boolean;
      triggerType: string;
      audience: string;
      steps: number;
    }>;
  };
  templates: {
    total: number;
    active: number;
    list: Array<{
      id: string;
      name: string;
      category: string;
      is_active: boolean;
    }>;
  };
  dailyStats: Array<{
    date: string;
    sent: number;
    opened: number;
  }>;
}

const EmailAnalyticsTab = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase.functions.invoke("get-email-analytics", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (error) throw error;
      setAnalytics(data);
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
        <p className="text-muted-foreground">Unable to load analytics</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const maxSent = Math.max(...analytics.dailyStats.map(d => d.sent), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Email Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Track email performance and engagement
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 border border-border/50 rounded-xl p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Send className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{analytics.overview.totalSent}</p>
              <p className="text-sm text-muted-foreground">Total Sent</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card/50 border border-border/50 rounded-xl p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Eye className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{analytics.engagement.openRate}%</p>
              <p className="text-sm text-muted-foreground">Open Rate</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/50 border border-border/50 rounded-xl p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
              <MousePointer className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{analytics.engagement.clickRate}%</p>
              <p className="text-sm text-muted-foreground">Click Rate</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card/50 border border-border/50 rounded-xl p-5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{analytics.engagement.bounceRate}%</p>
              <p className="text-sm text-muted-foreground">Bounce Rate</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* 7-Day Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card/50 border border-border/50 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Last 7 Days</h3>
          <div className="flex items-end gap-2 h-40">
            {analytics.dailyStats.map((day, index) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary/20 rounded-t"
                    style={{ height: `${(day.sent / maxSent) * 100}px` }}
                  />
                  <div
                    className="w-full bg-accent rounded-t -mt-1"
                    style={{ height: `${(day.opened / maxSent) * 100}px`, maxHeight: `${(day.sent / maxSent) * 100}px` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(day.date).toLocaleDateString("en-US", { weekday: "short" })}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary/20" />
              <span className="text-xs text-muted-foreground">Sent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-accent" />
              <span className="text-xs text-muted-foreground">Opened</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-card/50 border border-border/50 rounded-2xl p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
              <span className="text-sm text-muted-foreground">Sent (Last 7 days)</span>
              <span className="text-lg font-semibold text-foreground">{analytics.overview.sentLast7Days}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
              <span className="text-sm text-muted-foreground">Sent (Last 30 days)</span>
              <span className="text-lg font-semibold text-foreground">{analytics.overview.sentLast30Days}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
              <span className="text-sm text-muted-foreground">Pending in Queue</span>
              <span className="text-lg font-semibold text-gold">{analytics.overview.totalPending}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
              <span className="text-sm text-muted-foreground">Failed Emails</span>
              <span className="text-lg font-semibold text-destructive">{analytics.overview.totalFailed}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sequences & Templates Summary */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card/50 border border-border/50 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Sequences</h3>
            <span className="text-sm text-muted-foreground">
              {analytics.sequences.active} / {analytics.sequences.total} active
            </span>
          </div>
          <div className="space-y-3">
            {analytics.sequences.list.slice(0, 5).map((seq) => (
              <div key={seq.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                <div className="flex items-center gap-3">
                  {seq.isActive ? (
                    <CheckCircle className="w-4 h-4 text-accent" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-border" />
                  )}
                  <span className="text-sm font-medium text-foreground">{seq.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{seq.steps} steps</span>
              </div>
            ))}
            {analytics.sequences.list.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No sequences created yet</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card/50 border border-border/50 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Templates</h3>
            <span className="text-sm text-muted-foreground">
              {analytics.templates.active} / {analytics.templates.total} active
            </span>
          </div>
          <div className="space-y-3">
            {analytics.templates.list.slice(0, 5).map((temp) => (
              <div key={temp.id} className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">{temp.name}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                  {temp.category}
                </span>
              </div>
            ))}
            {analytics.templates.list.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No templates created yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EmailAnalyticsTab;
