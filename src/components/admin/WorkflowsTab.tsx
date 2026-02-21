import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, Plus, Trash2, Clock, Mail, Users,
  ChevronRight, Zap, Rocket, CheckCircle, XCircle,
  Activity, GitBranch, Edit2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import WorkflowBuilderModal from "./WorkflowBuilderModal";
import { TRIGGER_TYPES } from "./TriggerSelector";
import { ACTION_TYPES, WorkflowAction } from "./ActionCard";

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  workflow_triggers: { trigger_type: string; trigger_config: any }[];
  workflow_actions: WorkflowAction[];
  execution_count: number;
}

const WorkflowsTab = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "paused">("all");
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("workflows" as any)
        .select(`
          *,
          workflow_triggers (trigger_type, trigger_config),
          workflow_actions (id, action_type, action_order, action_config, parent_action_id, branch)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get execution counts
      const { data: execData } = await supabase
        .from("workflow_executions" as any)
        .select("workflow_id");

      const execCounts: Record<string, number> = {};
      (execData as any)?.forEach((e: any) => {
        execCounts[e.workflow_id] = (execCounts[e.workflow_id] || 0) + 1;
      });

      const enriched = ((data || []) as any[]).map((w: any) => ({
        ...w,
        execution_count: execCounts[w.id] || 0,
      }));

      setWorkflows(enriched);
    } catch (error: any) {
      console.error("Error fetching workflows:", error);
      toast({ title: "Error", description: "Failed to load workflows", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkflow = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("workflows" as any)
        .update({ is_active: !isActive } as any)
        .eq("id", id);
      if (error) throw error;

      setWorkflows(prev => prev.map(w => w.id === id ? { ...w, is_active: !isActive } : w));
      toast({
        title: isActive ? "Workflow Paused" : "Workflow Activated",
        description: `The workflow has been ${isActive ? "paused" : "activated"}.`,
      });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const deleteWorkflow = async (id: string) => {
    try {
      const { error } = await supabase.from("workflows" as any).delete().eq("id", id);
      if (error) throw error;
      setWorkflows(prev => prev.filter(w => w.id !== id));
      toast({ title: "Deleted", description: "Workflow deleted." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const openEdit = (w: Workflow) => {
    const trigger = w.workflow_triggers?.[0];
    setEditingWorkflow({
      id: w.id,
      name: w.name,
      description: w.description,
      is_active: w.is_active,
      trigger_type: trigger?.trigger_type || null,
      trigger_config: trigger?.trigger_config || {},
      actions: w.workflow_actions || [],
    });
    setShowBuilder(true);
  };

  const filtered = workflows.filter(w => {
    if (filter === "active") return w.is_active;
    if (filter === "paused") return !w.is_active;
    return true;
  });

  const activeCount = workflows.filter(w => w.is_active).length;
  const totalActions = workflows.reduce((a, w) => a + (w.workflow_actions?.length || 0), 0);
  const totalExecutions = workflows.reduce((a, w) => a + w.execution_count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Workflow Automations</h2>
          <p className="text-sm text-muted-foreground">
            Trigger-action workflows for your audience
          </p>
        </div>
        <button
          onClick={() => { setEditingWorkflow(null); setShowBuilder(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Workflow
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "active", "paused"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors capitalize ${
              filter === f ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f} {f === "all" ? `(${workflows.length})` : f === "active" ? `(${activeCount})` : `(${workflows.length - activeCount})`}
          </button>
        ))}
      </div>

      {/* Workflows List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-card/50 border border-border/50 rounded-2xl p-12 text-center">
            <Zap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Workflows Yet</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Create your first trigger-action workflow to automate your processes
            </p>
            <button
              onClick={() => { setEditingWorkflow(null); setShowBuilder(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Workflow
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((w) => {
              const trigger = w.workflow_triggers?.[0];
              const triggerMeta = TRIGGER_TYPES.find(t => t.value === trigger?.trigger_type);
              const TriggerIcon = triggerMeta?.icon || Zap;

              return (
                <motion.div
                  key={w.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-card/50 border border-border/50 rounded-2xl p-5 hover:border-primary/20 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        w.is_active ? "bg-accent/10 ring-1 ring-accent/20 text-accent" : "bg-muted ring-1 ring-border text-muted-foreground"
                      }`}>
                        <TriggerIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          {w.name}
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            w.is_active ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
                          }`}>
                            {w.is_active ? "Active" : "Paused"}
                          </span>
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          {triggerMeta && (
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {triggerMeta.label}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <GitBranch className="w-3 h-3" />
                            {w.workflow_actions?.length || 0} actions
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {w.execution_count} runs
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(w)}
                        className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleWorkflow(w.id, w.is_active)}
                        className={`p-2 rounded-lg transition-colors ${
                          w.is_active ? "hover:bg-accent/10 text-accent" : "hover:bg-primary/10 text-primary"
                        }`}
                      >
                        {w.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteWorkflow(w.id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card/50 border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{activeCount}</p>
              <p className="text-sm text-muted-foreground">Active Workflows</p>
            </div>
          </div>
        </div>
        <div className="bg-card/50 border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalExecutions}</p>
              <p className="text-sm text-muted-foreground">Total Executions</p>
            </div>
          </div>
        </div>
        <div className="bg-card/50 border border-border/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalActions}</p>
              <p className="text-sm text-muted-foreground">Actions Configured</p>
            </div>
          </div>
        </div>
      </div>

      {/* Builder Modal */}
      <WorkflowBuilderModal
        isOpen={showBuilder}
        onClose={() => { setShowBuilder(false); setEditingWorkflow(null); }}
        onSave={fetchWorkflows}
        editWorkflow={editingWorkflow}
      />
    </div>
  );
};

export default WorkflowsTab;
