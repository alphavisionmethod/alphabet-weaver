import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, DollarSign, TrendingUp, CheckCircle, Building2, BarChart3, Target, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CRMAnalyticsTab = () => {
  const [stats, setStats] = useState({
    totalContacts: 0,
    newThisWeek: 0,
    totalCompanies: 0,
    totalDeals: 0,
    openPipeline: 0,
    wonDeals: 0,
    wonValue: 0,
    lostDeals: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    completedTasks: 0,
    stageBreakdown: [] as { name: string; count: number; value: number; color: string }[],
    sourceBreakdown: [] as { source: string; count: number }[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    setLoading(true);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [contactsRes, newContactsRes, companiesRes, dealsRes, stagesRes, tasksRes] = await Promise.all([
      supabase.from("contacts" as any).select("id, source", { count: "exact" }),
      supabase.from("contacts" as any).select("id", { count: "exact" }).gte("created_at", weekAgo),
      supabase.from("companies" as any).select("id", { count: "exact" }),
      supabase.from("deals" as any).select("*, deal_stages(name, color)"),
      supabase.from("deal_stages" as any).select("*").order("stage_order"),
      supabase.from("tasks" as any).select("id, status, due_date"),
    ]);

    const contacts = (contactsRes.data || []) as any[];
    const deals = (dealsRes.data || []) as any[];
    const stages = (stagesRes.data || []) as any[];
    const tasks = (tasksRes.data || []) as any[];
    const now = new Date();

    const sourceMap: Record<string, number> = {};
    contacts.forEach((c: any) => {
      const src = c.source || "manual";
      sourceMap[src] = (sourceMap[src] || 0) + 1;
    });

    const stageBreakdown = stages.map((s: any) => {
      const stageDeals = deals.filter((d: any) => d.stage_id === s.id);
      return {
        name: s.name,
        count: stageDeals.length,
        value: stageDeals.reduce((sum: number, d: any) => sum + (d.value || 0), 0),
        color: s.color,
      };
    });

    setStats({
      totalContacts: contactsRes.count || 0,
      newThisWeek: newContactsRes.count || 0,
      totalCompanies: companiesRes.count || 0,
      totalDeals: deals.length,
      openPipeline: deals.filter((d: any) => d.status === "open").reduce((s: number, d: any) => s + (d.value || 0), 0),
      wonDeals: deals.filter((d: any) => d.status === "won").length,
      wonValue: deals.filter((d: any) => d.status === "won").reduce((s: number, d: any) => s + (d.value || 0), 0),
      lostDeals: deals.filter((d: any) => d.status === "lost").length,
      pendingTasks: tasks.filter((t: any) => t.status === "pending").length,
      overdueTasks: tasks.filter((t: any) => t.status !== "completed" && t.due_date && new Date(t.due_date) < now).length,
      completedTasks: tasks.filter((t: any) => t.status === "completed").length,
      stageBreakdown,
      sourceBreakdown: Object.entries(sourceMap).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count),
    });
    setLoading(false);
  };

  if (loading) return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>;

  const StatCard = ({ icon: Icon, value, label, variant }: { icon: any; value: string | number; label: string; variant: string }) => {
    const colors: Record<string, string> = {
      primary: "bg-primary/10 ring-primary/20 text-primary",
      accent: "bg-accent/10 ring-accent/20 text-accent",
      amber: "bg-amber-500/10 ring-amber-500/20 text-amber-500",
      emerald: "bg-emerald-500/10 ring-emerald-500/20 text-emerald-500",
    };
    return (
      <div className="bg-card/50 border border-border/50 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ring-1 ${colors[variant]}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">CRM Analytics</h2>
        <p className="text-sm text-muted-foreground">Overview of your CRM performance</p>
      </div>

      {/* Main stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} value={stats.totalContacts} label="Total Contacts" variant="primary" />
        <StatCard icon={TrendingUp} value={stats.newThisWeek} label="New This Week" variant="accent" />
        <StatCard icon={DollarSign} value={`$${stats.openPipeline.toLocaleString()}`} label="Open Pipeline" variant="amber" />
        <StatCard icon={CheckCircle} value={`$${stats.wonValue.toLocaleString()}`} label="Won Revenue" variant="emerald" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Building2} value={stats.totalCompanies} label="Companies" variant="primary" />
        <StatCard icon={Target} value={stats.wonDeals} label="Deals Won" variant="emerald" />
        <StatCard icon={Activity} value={stats.pendingTasks} label="Pending Tasks" variant="amber" />
        <StatCard icon={BarChart3} value={stats.overdueTasks} label="Overdue Tasks" variant="primary" />
      </div>

      {/* Pipeline breakdown */}
      <div className="bg-card/50 border border-border/50 rounded-2xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Pipeline Breakdown</h3>
        <div className="space-y-3">
          {stats.stageBreakdown.map(stage => {
            const maxCount = Math.max(...stats.stageBreakdown.map(s => s.count), 1);
            return (
              <div key={stage.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                <span className="text-sm text-foreground w-28 shrink-0">{stage.name}</span>
                <div className="flex-1 h-6 bg-secondary rounded-lg overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(stage.count / maxCount) * 100}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-lg"
                    style={{ backgroundColor: stage.color + "40" }}
                  />
                </div>
                <span className="text-sm text-muted-foreground w-8 text-right">{stage.count}</span>
                <span className="text-sm font-medium text-foreground w-24 text-right">${stage.value.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Source breakdown */}
      <div className="bg-card/50 border border-border/50 rounded-2xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Contact Sources</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.sourceBreakdown.map(src => (
            <div key={src.source} className="p-3 rounded-xl bg-secondary/50 border border-border/50 text-center">
              <p className="text-2xl font-bold text-foreground">{src.count}</p>
              <p className="text-xs text-muted-foreground capitalize">{src.source}</p>
            </div>
          ))}
          {stats.sourceBreakdown.length === 0 && (
            <p className="col-span-4 text-sm text-muted-foreground text-center py-4">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CRMAnalyticsTab;
