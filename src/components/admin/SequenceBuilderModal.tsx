import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Plus, Trash2, Clock, Mail, Users, Crown, Settings, GripVertical,
  ChevronDown, Zap, Timer, UserCheck, Filter, Save, Play
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  subject: string;
  category: string;
}

interface SequenceStep {
  id?: string;
  step_order: number;
  delay_hours: number;
  template_id: string;
  conditions?: Record<string, any>;
  email_templates?: {
    name: string;
    subject: string;
  };
}

interface Sequence {
  id?: string;
  name: string;
  description: string | null;
  trigger_type: string;
  audience: string;
  tier_filter: string | null;
  is_active: boolean;
  sequence_steps?: SequenceStep[];
}

interface SequenceBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editSequence?: Sequence | null;
}

const TRIGGER_TYPES = [
  { value: "on_signup", label: "Waitlist Signup", icon: Users, description: "When someone joins the waitlist" },
  { value: "on_backer", label: "New Backer", icon: Crown, description: "When someone becomes a backer" },
  { value: "manual", label: "Manual Trigger", icon: Settings, description: "Triggered manually by admin" },
];

const AUDIENCES = [
  { value: "all", label: "All Contacts" },
  { value: "waitlist", label: "Waitlist Only" },
  { value: "donors", label: "Backers Only" },
  { value: "investors", label: "Investors Only" },
];

const TIERS = [
  { value: null, label: "All Tiers" },
  { value: "operator", label: "Operator" },
  { value: "sovereign", label: "Sovereign" },
  { value: "governance", label: "Governance Board" },
];

const DELAY_PRESETS = [
  { value: 0, label: "Immediately" },
  { value: 1, label: "1 hour" },
  { value: 6, label: "6 hours" },
  { value: 24, label: "1 day" },
  { value: 48, label: "2 days" },
  { value: 72, label: "3 days" },
  { value: 120, label: "5 days" },
  { value: 168, label: "7 days" },
  { value: 336, label: "14 days" },
  { value: 720, label: "30 days" },
];

const SequenceBuilderModal = ({ isOpen, onClose, onSave, editSequence }: SequenceBuilderModalProps) => {
  const [sequence, setSequence] = useState<{
    id?: string;
    name: string;
    description: string;
    trigger_type: string;
    audience: string;
    tier_filter: string | null;
    is_active: boolean;
    sequence_steps: Array<{
      id?: string;
      step_order: number;
      delay_hours: number;
      template_id: string;
      conditions?: Record<string, any>;
    }>;
  }>({
    name: "",
    description: "",
    trigger_type: "on_signup",
    audience: "all",
    tier_filter: null,
    is_active: false,
    sequence_steps: [],
  });
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"settings" | "steps">("settings");
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
      if (editSequence) {
        setSequence({
          id: editSequence.id,
          name: editSequence.name,
          description: editSequence.description || "",
          trigger_type: editSequence.trigger_type,
          audience: editSequence.audience,
          tier_filter: editSequence.tier_filter,
          is_active: editSequence.is_active,
          sequence_steps: (editSequence.sequence_steps || []).map(step => ({
            id: step.id,
            step_order: step.step_order,
            delay_hours: step.delay_hours,
            template_id: step.template_id,
            conditions: {},
          })),
        });
      } else {
        setSequence({
          name: "",
          description: "",
          trigger_type: "on_signup",
          audience: "all",
          tier_filter: null,
          is_active: false,
          sequence_steps: [],
        });
      }
    }
  }, [isOpen, editSequence]);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("email_templates" as any)
        .select("id, name, subject, category")
        .eq("is_active", true)
        .order("category")
        .order("name");

      if (error) throw error;
      setTemplates((data || []) as unknown as Template[]);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const addStep = () => {
    const newStep: SequenceStep = {
      step_order: sequence.sequence_steps.length + 1,
      delay_hours: sequence.sequence_steps.length === 0 ? 0 : 24,
      template_id: templates[0]?.id || "",
      conditions: {},
    };
    setSequence(prev => ({
      ...prev,
      sequence_steps: [...prev.sequence_steps, newStep],
    }));
  };

  const updateStep = (index: number, updates: Partial<SequenceStep>) => {
    setSequence(prev => ({
      ...prev,
      sequence_steps: prev.sequence_steps.map((step, i) =>
        i === index ? { ...step, ...updates } : step
      ),
    }));
  };

  const removeStep = (index: number) => {
    setSequence(prev => ({
      ...prev,
      sequence_steps: prev.sequence_steps
        .filter((_, i) => i !== index)
        .map((step, i) => ({ ...step, step_order: i + 1 })),
    }));
  };

  const moveStep = (from: number, to: number) => {
    if (to < 0 || to >= sequence.sequence_steps.length) return;
    
    const steps = [...sequence.sequence_steps];
    const [moved] = steps.splice(from, 1);
    steps.splice(to, 0, moved);
    
    setSequence(prev => ({
      ...prev,
      sequence_steps: steps.map((step, i) => ({ ...step, step_order: i + 1 })),
    }));
  };

  const handleSave = async () => {
    if (!sequence.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a sequence name",
        variant: "destructive",
      });
      return;
    }

    if (sequence.sequence_steps.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one email step",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      let sequenceId = sequence.id;

      // Create or update the sequence
      if (sequenceId) {
        const { error } = await supabase
          .from("email_sequences" as any)
          .update({
            name: sequence.name,
            description: sequence.description,
            trigger_type: sequence.trigger_type,
            audience: sequence.audience,
            tier_filter: sequence.tier_filter,
            is_active: sequence.is_active,
          } as any)
          .eq("id", sequenceId);

        if (error) throw error;

        // Delete existing steps
        await supabase
          .from("sequence_steps" as any)
          .delete()
          .eq("sequence_id", sequenceId);
      } else {
        const { data, error } = await supabase
          .from("email_sequences" as any)
          .insert({
            name: sequence.name,
            description: sequence.description,
            trigger_type: sequence.trigger_type,
            audience: sequence.audience,
            tier_filter: sequence.tier_filter,
            is_active: sequence.is_active,
          } as any)
          .select()
          .single();

        if (error) throw error;
        sequenceId = (data as any).id;
      }

      // Insert steps
      const stepsToInsert = sequence.sequence_steps.map(step => ({
        sequence_id: sequenceId,
        template_id: step.template_id,
        step_order: step.step_order,
        delay_hours: step.delay_hours,
        conditions: step.conditions || {},
      }));

      const { error: stepsError } = await supabase
        .from("sequence_steps" as any)
        .insert(stepsToInsert as any);

      if (stepsError) throw stepsError;

      toast({
        title: "Success",
        description: `Sequence "${sequence.name}" saved successfully`,
      });

      onSave();
      onClose();
    } catch (error: any) {
      console.error("Error saving sequence:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getTemplateById = (id: string) => templates.find(t => t.id === id);

  const calculateTotalTime = () => {
    const totalHours = sequence.sequence_steps.reduce((acc, step) => acc + step.delay_hours, 0);
    if (totalHours < 24) return `${totalHours} hours`;
    const days = Math.floor(totalHours / 24);
    return `${days} day${days > 1 ? "s" : ""}`;
  };

  if (!isOpen) return null;

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
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {editSequence ? "Edit Sequence" : "Create New Sequence"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Build an automated email workflow for your audience
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border px-6">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("settings")}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "settings"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Settings className="w-4 h-4 inline-block mr-2" />
              Settings & Trigger
            </button>
            <button
              onClick={() => setActiveTab("steps")}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "steps"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="w-4 h-4 inline-block mr-2" />
              Email Steps ({sequence.sequence_steps.length})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "settings" && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  Basic Information
                </h3>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Sequence Name *
                    </label>
                    <input
                      type="text"
                      value={sequence.name}
                      onChange={(e) => setSequence(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Backer Welcome Series"
                      className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description (optional)
                    </label>
                    <textarea
                      value={sequence.description}
                      onChange={(e) => setSequence(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe what this sequence does..."
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground placeholder:text-muted-foreground resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Trigger Selection */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Trigger
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {TRIGGER_TYPES.map((trigger) => {
                    const Icon = trigger.icon;
                    return (
                      <button
                        key={trigger.value}
                        onClick={() => setSequence(prev => ({ ...prev, trigger_type: trigger.value }))}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          sequence.trigger_type === trigger.value
                            ? "border-primary bg-primary/10 ring-1 ring-primary"
                            : "border-border bg-secondary/50 hover:border-primary/50"
                        }`}
                      >
                        <Icon className={`w-5 h-5 mb-2 ${
                          sequence.trigger_type === trigger.value ? "text-primary" : "text-muted-foreground"
                        }`} />
                        <p className="font-medium text-foreground text-sm">{trigger.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{trigger.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Audience & Filters */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Audience & Filters
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Audience
                    </label>
                    <div className="relative">
                      <select
                        value={sequence.audience}
                        onChange={(e) => setSequence(prev => ({ ...prev, audience: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground appearance-none cursor-pointer"
                      >
                        {AUDIENCES.map((audience) => (
                          <option key={audience.value} value={audience.value}>
                            {audience.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Tier Filter
                    </label>
                    <div className="relative">
                      <select
                        value={sequence.tier_filter || ""}
                        onChange={(e) => setSequence(prev => ({ 
                          ...prev, 
                          tier_filter: e.target.value || null 
                        }))}
                        className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground appearance-none cursor-pointer"
                      >
                        {TIERS.map((tier) => (
                          <option key={tier.value || "all"} value={tier.value || ""}>
                            {tier.label}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 border border-border">
                <div>
                  <p className="font-medium text-foreground">Activate Sequence</p>
                  <p className="text-sm text-muted-foreground">
                    Enable this to start sending emails automatically
                  </p>
                </div>
                <button
                  onClick={() => setSequence(prev => ({ ...prev, is_active: !prev.is_active }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    sequence.is_active ? "bg-accent" : "bg-muted"
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    sequence.is_active ? "left-7" : "left-1"
                  }`} />
                </button>
              </div>
            </div>
          )}

          {activeTab === "steps" && (
            <div className="space-y-6">
              {/* Steps Summary */}
              {sequence.sequence_steps.length > 0 && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4" />
                    {sequence.sequence_steps.length} email{sequence.sequence_steps.length > 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Timer className="w-4 h-4" />
                    {calculateTotalTime()} total
                  </span>
                </div>
              )}

              {/* Steps List */}
              <div className="space-y-4">
                <AnimatePresence>
                  {sequence.sequence_steps.map((step, index) => {
                    const template = getTemplateById(step.template_id);
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-secondary/50 border border-border rounded-xl p-4"
                      >
                        <div className="flex items-start gap-4">
                          {/* Drag Handle & Number */}
                          <div className="flex flex-col items-center pt-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                              {step.step_order}
                            </div>
                            {index < sequence.sequence_steps.length - 1 && (
                              <div className="w-0.5 h-16 bg-border mt-2" />
                            )}
                          </div>

                          {/* Step Content */}
                          <div className="flex-1 space-y-4">
                            {/* Delay */}
                            <div className="flex items-center gap-3">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <select
                                value={step.delay_hours}
                                onChange={(e) => updateStep(index, { delay_hours: parseInt(e.target.value) })}
                                className="px-3 py-1.5 rounded-lg bg-card border border-border text-sm text-foreground focus:border-primary outline-none"
                              >
                                {DELAY_PRESETS.map((preset) => (
                                  <option key={preset.value} value={preset.value}>
                                    {preset.label}
                                  </option>
                                ))}
                              </select>
                              <span className="text-sm text-muted-foreground">after previous step</span>
                            </div>

                            {/* Template Selection */}
                            <div className="flex items-center gap-3">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <select
                                value={step.template_id}
                                onChange={(e) => updateStep(index, { template_id: e.target.value })}
                                className="flex-1 px-3 py-2 rounded-lg bg-card border border-border text-sm text-foreground focus:border-primary outline-none"
                              >
                                <option value="">Select a template...</option>
                                {templates.map((template) => (
                                  <option key={template.id} value={template.id}>
                                    [{template.category}] {template.name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Template Preview */}
                            {template && (
                              <div className="p-3 rounded-lg bg-card border border-border/50">
                                <p className="text-sm font-medium text-foreground">{template.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Subject: {template.subject}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => moveStep(index, index - 1)}
                              disabled={index === 0}
                              className="p-1.5 rounded-lg hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <ChevronDown className="w-4 h-4 rotate-180 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => moveStep(index, index + 1)}
                              disabled={index === sequence.sequence_steps.length - 1}
                              className="p-1.5 rounded-lg hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => removeStep(index)}
                              className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>

              {/* Add Step Button */}
              <button
                onClick={addStep}
                className="w-full p-4 rounded-xl border-2 border-dashed border-border hover:border-primary/50 text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add Email Step
              </button>

              {/* Empty State */}
              {sequence.sequence_steps.length === 0 && (
                <div className="text-center py-8">
                  <Mail className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-medium text-foreground mb-2">No Steps Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add email steps to build your automation sequence
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-border hover:bg-secondary transition-colors text-foreground"
          >
            Cancel
          </button>
          <div className="flex items-center gap-3">
            {sequence.sequence_steps.length > 0 && sequence.name && (
              <span className="text-sm text-muted-foreground">
                {sequence.sequence_steps.length} step{sequence.sequence_steps.length > 1 ? "s" : ""} • 
                {calculateTotalTime()}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !sequence.name || sequence.sequence_steps.length === 0}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? (
                <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? "Saving..." : "Save Sequence"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SequenceBuilderModal;
