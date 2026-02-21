import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Save, Play, ChevronRight, Plus, Zap, Settings,
  List, CheckCircle, ArrowLeft
} from "lucide-react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, arrayMove
} from "@dnd-kit/sortable";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TriggerSelector, { TRIGGER_TYPES } from "./TriggerSelector";
import ActionCard, { ACTION_TYPES, WorkflowAction } from "./ActionCard";
import WorkflowFlowDiagram from "./WorkflowFlowDiagram";

interface WorkflowBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editWorkflow?: {
    id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    trigger_type: string | null;
    trigger_config: Record<string, any>;
    actions: WorkflowAction[];
  } | null;
}

type Step = "settings" | "trigger" | "actions" | "review";
const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: "settings", label: "Settings", icon: Settings },
  { key: "trigger", label: "Trigger", icon: Zap },
  { key: "actions", label: "Actions", icon: List },
  { key: "review", label: "Review", icon: CheckCircle },
];

const WorkflowBuilderModal = ({ isOpen, onClose, onSave, editWorkflow }: WorkflowBuilderModalProps) => {
  const [step, setStep] = useState<Step>("settings");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [triggerType, setTriggerType] = useState<string | null>(null);
  const [triggerConfig, setTriggerConfig] = useState<Record<string, any>>({});
  const [actions, setActions] = useState<WorkflowAction[]>([]);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [showActionPicker, setShowActionPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setActions(prev => {
        const oldIndex = prev.findIndex(a => a.id === active.id);
        const newIndex = prev.findIndex(a => a.id === over.id);
        return arrayMove(prev, oldIndex, newIndex).map((a, i) => ({ ...a, action_order: i + 1 }));
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (editWorkflow) {
        setName(editWorkflow.name);
        setDescription(editWorkflow.description || "");
        setIsActive(editWorkflow.is_active);
        setTriggerType(editWorkflow.trigger_type);
        setTriggerConfig(editWorkflow.trigger_config || {});
        setActions(editWorkflow.actions || []);
      } else {
        setName("");
        setDescription("");
        setIsActive(false);
        setTriggerType(null);
        setTriggerConfig({});
        setActions([]);
      }
      setStep("settings");
      setExpandedAction(null);
    }
  }, [isOpen, editWorkflow]);

  const addAction = (actionType: string) => {
    const newAction: WorkflowAction = {
      id: crypto.randomUUID(),
      action_type: actionType,
      action_order: actions.length + 1,
      action_config: actionType === "wait_delay" ? { delay_hours: 24 } : {},
    };
    setActions(prev => [...prev, newAction]);
    setExpandedAction(newAction.id);
    setShowActionPicker(false);
  };

  const updateAction = (id: string, config: Record<string, any>) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, action_config: config } : a));
  };

  const deleteAction = (id: string) => {
    setActions(prev => prev.filter(a => a.id !== id).map((a, i) => ({ ...a, action_order: i + 1 })));
    if (expandedAction === id) setExpandedAction(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: "Error", description: "Please enter a workflow name", variant: "destructive" });
      return;
    }
    if (!triggerType) {
      toast({ title: "Error", description: "Please select a trigger", variant: "destructive" });
      return;
    }
    if (actions.length === 0) {
      toast({ title: "Error", description: "Please add at least one action", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      let workflowId = editWorkflow?.id;

      if (workflowId) {
        const { error } = await supabase
          .from("workflows" as any)
          .update({ name, description, is_active: isActive } as any)
          .eq("id", workflowId);
        if (error) throw error;

        // Delete existing triggers and actions
        await supabase.from("workflow_triggers" as any).delete().eq("workflow_id", workflowId);
        await supabase.from("workflow_actions" as any).delete().eq("workflow_id", workflowId);
      } else {
        const { data, error } = await supabase
          .from("workflows" as any)
          .insert({ name, description, is_active: isActive } as any)
          .select()
          .single();
        if (error) throw error;
        workflowId = (data as any).id;
      }

      // Insert trigger
      const { error: triggerError } = await supabase
        .from("workflow_triggers" as any)
        .insert({
          workflow_id: workflowId,
          trigger_type: triggerType,
          trigger_config: triggerConfig,
        } as any);
      if (triggerError) throw triggerError;

      // Insert actions
      const actionsToInsert = actions.map((a, i) => ({
        workflow_id: workflowId!,
        action_order: i + 1,
        action_type: a.action_type,
        action_config: a.action_config,
        parent_action_id: a.parent_action_id || null,
        branch: a.branch || null,
      }));

      const { error: actionsError } = await supabase
        .from("workflow_actions" as any)
        .insert(actionsToInsert as any);
      if (actionsError) throw actionsError;

      toast({ title: "Success", description: `Workflow "${name}" saved successfully` });
      onSave();
      onClose();
    } catch (error: any) {
      console.error("Save workflow error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const canProceed = (): boolean => {
    switch (step) {
      case "settings": return name.trim().length > 0;
      case "trigger": return triggerType !== null;
      case "actions": return actions.length > 0;
      default: return true;
    }
  };

  const nextStep = () => {
    const idx = STEPS.findIndex(s => s.key === step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1].key);
  };

  const prevStep = () => {
    const idx = STEPS.findIndex(s => s.key === step);
    if (idx > 0) setStep(STEPS[idx - 1].key);
  };

  const triggerMeta = TRIGGER_TYPES.find(t => t.value === triggerType);

  if (!isOpen) return null;

  const ACTION_CATEGORIES = ["Communication", "CRM", "Logic", "Integration"];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {editWorkflow ? "Edit Workflow" : "Create Workflow"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Build a trigger-action automation
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-5 py-3 border-b border-border flex items-center gap-1">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = s.key === step;
            const isPast = STEPS.findIndex(st => st.key === step) > i;
            return (
              <div key={s.key} className="flex items-center">
                <button
                  onClick={() => setStep(s.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    isActive ? "bg-primary/10 text-primary font-medium" :
                    isPast ? "text-accent" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {s.label}
                </button>
                {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground mx-1" />}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === "settings" && (
            <div className="space-y-5 max-w-xl">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Workflow Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., New Backer Welcome Flow"
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What does this workflow do?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground resize-none"
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Activate on save</p>
                  <p className="text-xs text-muted-foreground">Start processing contacts immediately</p>
                </div>
                <button
                  onClick={() => setIsActive(!isActive)}
                  className={`w-12 h-7 rounded-full transition-all relative ${
                    isActive ? "bg-accent" : "bg-muted"
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-all ${
                    isActive ? "left-6" : "left-1"
                  }`} />
                </button>
              </div>
            </div>
          )}

          {step === "trigger" && (
            <TriggerSelector
              selected={triggerType}
              onSelect={setTriggerType}
              triggerConfig={triggerConfig}
              onConfigChange={setTriggerConfig}
            />
          )}

          {step === "actions" && (
            <div className="space-y-4">
              {/* Trigger badge */}
              {triggerMeta && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm text-foreground font-medium">When: {triggerMeta.label}</span>
                </div>
              )}

              {/* Action list */}
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={actions.map(a => a.id)} strategy={verticalListSortingStrategy}>
                  <div>
                    {actions.map((action, idx) => (
                      <ActionCard
                        key={action.id}
                        action={action}
                        index={idx}
                        isExpanded={expandedAction === action.id}
                        onToggle={() => setExpandedAction(expandedAction === action.id ? null : action.id)}
                        onUpdate={(config) => updateAction(action.id, config)}
                        onDelete={() => deleteAction(action.id)}
                        isLast={idx === actions.length - 1 && !showActionPicker}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {/* Add action button */}
              {!showActionPicker ? (
                <button
                  onClick={() => setShowActionPicker(true)}
                  className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-border hover:border-primary/40 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Add Action</span>
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border border-border bg-card p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">Choose Action</p>
                    <button onClick={() => setShowActionPicker(false)} className="text-xs text-muted-foreground hover:text-foreground">
                      Cancel
                    </button>
                  </div>
                  {ACTION_CATEGORIES.map(cat => {
                    const catActions = ACTION_TYPES.filter(a => a.category === cat);
                    return (
                      <div key={cat}>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">{cat}</p>
                        <div className="grid grid-cols-2 gap-1.5">
                          {catActions.map(a => {
                            const Icon = a.icon;
                            return (
                              <button
                                key={a.value}
                                onClick={() => addAction(a.value)}
                                className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-secondary/50 hover:border-primary/40 hover:bg-primary/5 transition-colors text-left"
                              >
                                <Icon className={`w-4 h-4 ${a.color}`} />
                                <span className="text-sm text-foreground">{a.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              )}
            </div>
          )}

          {step === "review" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-5">
                  <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
                    <h3 className="font-semibold text-foreground">{name}</h3>
                    {description && <p className="text-sm text-muted-foreground">{description}</p>}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"}`}>
                        {isActive ? "Active" : "Draft"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/30 p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Trigger</p>
                    {triggerMeta && (
                      <div className="flex items-center gap-2">
                        <triggerMeta.icon className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">{triggerMeta.label}</span>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-border bg-secondary/30 p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                      Actions ({actions.length})
                    </p>
                    <div className="space-y-2">
                      {actions.map((a, i) => {
                        const meta = ACTION_TYPES.find(at => at.value === a.action_type);
                        if (!meta) return null;
                        const Icon = meta.icon;
                        return (
                          <div key={a.id} className="flex items-center gap-3 text-sm">
                            <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium">
                              {i + 1}
                            </span>
                            <Icon className={`w-4 h-4 ${meta.color}`} />
                            <span className="text-foreground">{meta.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Flow Diagram */}
                <WorkflowFlowDiagram
                  triggerType={triggerType}
                  triggerConfig={triggerConfig}
                  actions={actions}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-border flex items-center justify-between">
          <div>
            {step !== "settings" && (
              <button
                onClick={prevStep}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            {step === "review" ? (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Workflow"}
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition-all disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WorkflowBuilderModal;
