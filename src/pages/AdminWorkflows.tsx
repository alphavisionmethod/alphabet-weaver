import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Play, Pause, Eye, EyeOff, ChevronRight, Clock, Mail, Users,
  Crown, Briefcase
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WorkflowTemplate {
  id: string;
  key: string;
  name: string;
  description: string | null;
  version: number;
  is_system: boolean;
  audience_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  workflow_steps?: WorkflowStep[];
}

interface WorkflowStep {
  id: string;
  step_order: number;
  delay_minutes: number;
  subject_template: string;
  body_template: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  OFF: { label: "OFF", color: "bg-muted text-muted-foreground", icon: EyeOff },
  SHADOW: { label: "SHADOW", color: "bg-amber-500/10 text-amber-400 border-amber-500/30", icon: Eye },
  LIVE: { label: "LIVE", color: "bg-accent/10 text-accent border-accent/30", icon: Play },
};

const AUDIENCE_CONFIG: Record<string, { label: string; icon: React.ElementType }> = {
  waitlist: { label: "Waitlist", icon: Users },
  donor: { label: "Backers", icon: Crown },
  investor: { label: "Investors", icon: Briefcase },
};

function formatDelay(minutes: number): string {
  if (minutes === 0) return "Immediately";
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / 1440)}d`;
}

const AdminWorkflows = () => {
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => { fetchWorkflows(); }, []);

  const fetchWorkflows = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("workflow_templates")
      .select("*, workflow_steps(*)")
      .order("audience_type")
      .order("key");

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setWorkflows((data || []) as unknown as WorkflowTemplate[]);
    }
    setLoading(false);
  };

  const cycleStatus = async (wf: WorkflowTemplate) => {
    const order = ["OFF", "SHADOW", "LIVE"];
    const next = order[(order.indexOf(wf.status) + 1) % order.length];

    const { error } = await supabase
      .from("workflow_templates")
      .update({ status: next as any })
      .eq("id", wf.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setWorkflows(prev => prev.map(w => w.id === wf.id ? { ...w, status: next } : w));

      // Audit log
      await supabase.from("admin_audit_log").insert({
        action: "WORKFLOW_STATUS_CHANGED",
        entity_type: "workflow_template",
        entity_id: wf.id,
        old_value: { status: wf.status },
        new_value: { status: next },
      });

      // Event
      await supabase.from("events").insert({
        event_type: "WORKFLOW_TOGGLED" as any,
        payload: { workflow_key: wf.key, old_status: wf.status, new_status: next },
      });

      toast({ title: `Workflow → ${next}`, description: `${wf.name} is now ${next}` });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  // Group by audience
  const grouped = workflows.reduce((acc, wf) => {
    const key = wf.audience_type;
    if (!acc[key]) acc[key] = [];
    acc[key].push(wf);
    return acc;
  }, {} as Record<string, WorkflowTemplate[]>);

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Email Workflows</h1>
          <p className="text-sm text-muted-foreground mt-1">{workflows.length} workflows configured</p>
        </div>
      </div>
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Live", count: workflows.filter(w => w.status === "LIVE").length, color: "text-accent" },
            { label: "Shadow", count: workflows.filter(w => w.status === "SHADOW").length, color: "text-amber-400" },
            { label: "Off", count: workflows.filter(w => w.status === "OFF").length, color: "text-muted-foreground" },
          ].map(s => (
            <div key={s.label} className="bg-card/50 border border-border/30 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Workflow cards by audience */}
        {Object.entries(grouped).map(([audience, wfs]) => {
          const config = AUDIENCE_CONFIG[audience] || { label: audience, icon: Users };
          const AudienceIcon = config.icon;

          return (
            <div key={audience}>
              <div className="flex items-center gap-2 mb-4">
                <AudienceIcon className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {config.label} Workflows
                </h2>
              </div>

              <div className="grid gap-4">
                {wfs.map(wf => {
                  const statusConf = STATUS_CONFIG[wf.status] || STATUS_CONFIG.OFF;
                  const StatusIcon = statusConf.icon;
                  const steps = wf.workflow_steps || [];
                  const sortedSteps = [...steps].sort((a, b) => a.step_order - b.step_order);

                  return (
                    <motion.div
                      key={wf.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card/60 border border-border/40 rounded-2xl p-5 hover:border-primary/30 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-foreground">{wf.name}</h3>
                            <button
                              onClick={() => cycleStatus(wf)}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border cursor-pointer hover:opacity-80 transition-opacity ${statusConf.color}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              {statusConf.label}
                            </button>
                            {wf.is_system && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                SYSTEM
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{wf.description}</p>
                          <p className="text-xs text-muted-foreground/60 mt-1">v{wf.version} · {wf.key}</p>
                        </div>
                        <button
                          onClick={() => navigate(`/admin/workflows/${wf.id}`)}
                          className="p-2 rounded-lg hover:bg-secondary transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Mini timeline */}
                      {sortedSteps.length > 0 && (
                        <div className="flex items-center gap-1 overflow-x-auto pb-1">
                          {sortedSteps.map((step, i) => (
                            <div key={step.id} className="flex items-center gap-1 shrink-0">
                              <div className="flex flex-col items-center">
                                <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                  {step.step_order}
                                </div>
                                <span className="text-[9px] text-muted-foreground mt-0.5 max-w-[80px] truncate text-center">
                                  {step.subject_template.slice(0, 20)}…
                                </span>
                              </div>
                              {i < sortedSteps.length - 1 && (
                                <div className="flex items-center gap-0.5 text-muted-foreground/40 mx-1">
                                  <div className="w-4 h-px bg-border" />
                                  <span className="text-[9px] font-mono">{formatDelay(sortedSteps[i + 1].delay_minutes)}</span>
                                  <div className="w-4 h-px bg-border" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
    </div>
  );
};

export default AdminWorkflows;
